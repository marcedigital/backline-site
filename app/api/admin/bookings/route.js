// app/api/admin/bookings/route.js
import { NextResponse } from 'next/server';
import Booking from '../../../../models/booking';
import { connectToDatabase } from '../../../../utils/database';
import { verifyAdminToken } from '../../../../utils/auth';

// GET - Listar todas las reservas (con filtros)
export async function GET(req) {
  try {
    console.log('📋 GET /api/admin/bookings - Obteniendo reservas...');
    
    // Verificar autenticación admin
    const adminUser = await verifyAdminToken(req);
    if (!adminUser) {
      console.log('❌ Token admin inválido');
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    
    console.log('✅ Admin autenticado:', adminUser.username);
    
    await connectToDatabase();
    
    // Obtener parámetros de consulta
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search');
    const hasCoupon = searchParams.get('hasCoupon');
    const includeImages = searchParams.get('includeImages') !== 'false'; // Por defecto incluir imágenes
    
    console.log('📋 Parámetros recibidos:', {
      page, limit, status, includeImages,
      search: search || 'ninguno'
    });

    // Construir filtros
    const filters = {};
    
    if (status && status !== 'all') {
      filters.status = status;
    }
    
    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) filters.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filters.createdAt.$lte = new Date(dateTo);
    }
    
    if (search) {
      // Buscar en campos que podrían contener el término de búsqueda
      filters.$or = [
        { ipAddress: { $regex: search, $options: 'i' } },
        { 'couponUsed.code': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (hasCoupon === 'true') {
      filters['couponUsed.code'] = { $ne: null };
    } else if (hasCoupon === 'false') {
      filters['couponUsed.code'] = null;
    }
    
    console.log('🔍 Filtros aplicados:', filters);
    
    // Calcular skip para paginación
    const skip = (page - 1) * limit;
    
    // Seleccionar campos - ACTUALIZADO para incluir campos de imagen
    let selectFields = [
      'hours', 'reservationDate', 'services', 'subtotal', 'discount', 'total', 'status', 
      'createdAt', 'updatedAt', 'ipAddress', 'userAgent',
      'couponUsed'
    ];
    
    // SIEMPRE incluir campos de imagen para el admin
    if (includeImages) {
      selectFields.push('receiptImage', 'receiptImageType', 'receiptImageSize');
      console.log('🖼️ Incluyendo campos de imagen en la consulta');
    }
    
    const selectString = selectFields.join(' ');
    console.log('📝 Campos seleccionados:', selectString);
    
    // Obtener reservas con paginación
    const [bookings, totalCount] = await Promise.all([
      Booking.find(filters)
        .select(selectString)
        .populate('couponUsed.couponId', 'code discountType value active')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filters)
    ]);
    
    console.log(`📄 Encontradas ${bookings.length} reservas de ${totalCount} total`);
    
    // DEBUG: Verificar si las imágenes están presentes
    if (bookings.length > 0) {
      const firstBooking = bookings[0];
      console.log('🔍 Primera reserva (campos de imagen):', {
        id: firstBooking._id,
        hasReceiptImage: !!firstBooking.receiptImage,
        receiptImageType: firstBooking.receiptImageType,
        receiptImageSize: firstBooking.receiptImageSize,
        imageDataLength: firstBooking.receiptImage ? firstBooking.receiptImage.length : 0
      });
    }
    
    // Procesar bookings para agregar información adicional
    const processedBookings = bookings.map(booking => {
      const processed = {
        ...booking,
        hasReceiptImage: !!booking.receiptImage,
        receiptImageSizeFormatted: booking.receiptImageSize 
          ? `${(booking.receiptImageSize / 1024).toFixed(1)} KB`
          : null
      };
      
      // Asegurar que la imagen esté presente si existe
      if (booking.receiptImage && includeImages) {
        processed.receiptImage = booking.receiptImage;
      }
      
      return processed;
    });
    
    console.log(`✅ Procesadas ${processedBookings.length} reservas. Con imágenes: ${processedBookings.filter(b => b.hasReceiptImage).length}`);
    
    // Obtener estadísticas generales
    const stats = await Booking.getStats();
    
    return NextResponse.json({
      success: true,
      bookings: processedBookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      },
      stats,
      debug: {
        includeImages,
        bookingsWithImages: processedBookings.filter(b => b.hasReceiptImage).length,
        totalBookings: processedBookings.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error en GET /api/admin/bookings:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al obtener reservas',
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Actualizar estado de reserva
export async function PUT(req) {
  try {
    console.log('✏️ PUT /api/admin/bookings - Actualizando reserva...');
    
    // Verificar autenticación admin
    const adminUser = await verifyAdminToken(req);
    if (!adminUser) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    
    await connectToDatabase();
    
    const { id, status, notes } = await req.json();
    
    if (!id || !status) {
      return NextResponse.json({
        success: false,
        message: 'ID y estado son requeridos'
      }, { status: 400 });
    }
    
    // Validar estado
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        message: 'Estado inválido'
      }, { status: 400 });
    }
    
    // Buscar y actualizar reserva
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({
        success: false,
        message: 'Reserva no encontrada'
      }, { status: 404 });
    }
    
    // Actualizar estado usando el método del modelo
    await booking.updateStatus(status);
    
    // Agregar notas si se proporcionan
    if (notes) {
      booking.adminNotes = notes;
      await booking.save();
    }
    
    console.log(`✅ Reserva ${id} actualizada a estado: ${status}`);
    
    return NextResponse.json({
      success: true,
      booking: {
        id: booking._id,
        status: booking.status,
        updatedAt: booking.updatedAt,
        hasReceiptImage: !!booking.receiptImageType
      },
      message: 'Reserva actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error en PUT /api/admin/bookings:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al actualizar reserva',
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Eliminar reserva (solo para admins)
export async function DELETE(req) {
  try {
    console.log('🗑️ DELETE /api/admin/bookings - Eliminando reserva...');
    
    // Verificar autenticación admin
    const adminUser = await verifyAdminToken(req);
    if (!adminUser) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID de reserva es requerido'
      }, { status: 400 });
    }
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({
        success: false,
        message: 'Reserva no encontrada'
      }, { status: 404 });
    }
    
    // Obtener información antes de eliminar para logging
    const bookingInfo = {
      id: booking._id,
      hasImage: !!booking.receiptImage,
      imageSize: booking.receiptImageSize || 0
    };
    
    await Booking.findByIdAndDelete(id);
    
    console.log(`✅ Reserva ${id} eliminada exitosamente`);
    if (bookingInfo.hasImage) {
      console.log(`🖼️ Se eliminó imagen de ${(bookingInfo.imageSize / 1024).toFixed(1)} KB`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Reserva eliminada exitosamente',
      deletedBooking: bookingInfo
    });
    
  } catch (error) {
    console.error('❌ Error en DELETE /api/admin/bookings:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al eliminar reserva',
      error: error.message
    }, { status: 500 });
  }
}