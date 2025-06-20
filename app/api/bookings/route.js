// app/api/bookings/route.js
import { NextResponse } from 'next/server';
import Booking from '../../../models/booking';
import Coupon from '../../../models/coupons';
import { connectToDatabase } from '../../../utils/database';

// POST - Crear nueva reserva
export async function POST(req) {
  try {
    console.log('📝 POST /api/bookings - Creando nueva reserva...');
    
    await connectToDatabase();
    console.log('✅ Conectado a MongoDB');
    
    const bookingData = await req.json();
    console.log('📋 Datos de reserva recibidos:', {
      hours: bookingData.hours,
      services: bookingData.services,
      total: bookingData.total,
      coupon: bookingData.couponCode || 'Sin cupón',
      hasImage: !!bookingData.receiptImage,
      imageType: bookingData.receiptImageType,
      imageSize: bookingData.receiptImageSize ? `${(bookingData.receiptImageSize / 1024).toFixed(1)} KB` : 'N/A'
    });
    
    // Validar datos requeridos básicos primero
    const { hours, services, subtotal, total } = bookingData;
    
    if (!hours || !services || !subtotal || !total) {
      console.log('❌ Faltan campos básicos requeridos');
      return NextResponse.json({
        success: false,
        message: 'Faltan datos básicos requeridos para crear la reserva'
      }, { status: 400 });
    }
    
    // Validar imagen
    const { receiptImage, receiptImageType, receiptImageSize } = bookingData;
    if (!receiptImage || !receiptImageType || !receiptImageSize) {
      console.log('❌ Faltan datos de imagen del comprobante');
      return NextResponse.json({
        success: false,
        message: 'Faltan datos de la imagen del comprobante'
      }, { status: 400 });
    }
    
    console.log('✅ Validación de campos completada');

    // Validar formato de imagen
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedImageTypes.includes(receiptImageType)) {
      return NextResponse.json({
        success: false,
        message: 'Tipo de imagen no válido. Solo se permiten JPG, PNG y WebP'
      }, { status: 400 });
    }

    // Validar tamaño de imagen (máximo 5MB)
    const maxImageSize = 5 * 1024 * 1024; // 5MB
    if (receiptImageSize > maxImageSize) {
      return NextResponse.json({
        success: false,
        message: 'La imagen es demasiado grande. Máximo 5MB permitido'
      }, { status: 400 });
    }

    // Validar formato base64
    if (!receiptImage.startsWith('data:')) {
      return NextResponse.json({
        success: false,
        message: 'Formato de imagen inválido'
      }, { status: 400 });
    }
    
    // Obtener IP y User Agent
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Preparar datos de la reserva - ACTUALIZADO PARA IMÁGENES
    const newBookingData = {
      hours: parseFloat(hours),
      services: {
        platillos: Boolean(services.platillos),
        pedalDoble: Boolean(services.pedalDoble)
      },
      subtotal: parseFloat(subtotal),
      discount: parseFloat(bookingData.discount) || 0,
      total: parseFloat(total),
      receiptImage: receiptImage, // Base64 de la imagen
      receiptImageType: receiptImageType,
      receiptImageSize: parseInt(receiptImageSize),
      ipAddress,
      userAgent,
      status: 'pending'
    };
    
    console.log('📄 Datos preparados para la base de datos');

    // Si se usó un cupón, agregar información del cupón
    if (bookingData.couponCode && bookingData.appliedCoupon) {
      console.log('🎫 Procesando cupón:', bookingData.couponCode);
      
      // Usar la información del cupón que ya fue validada en el frontend
      const appliedCouponData = bookingData.appliedCoupon;
      
      // Solo verificar que el cupón sigue existiendo y activo - SIN incrementar uso aún
      const coupon = await Coupon.findOne({ 
        code: bookingData.couponCode.toUpperCase(),
        isActive: true 
      });
      
      if (!coupon) {
        console.log('❌ Cupón no encontrado o inactivo:', bookingData.couponCode);
        return NextResponse.json({
          success: false,
          message: 'El cupón ya no es válido'
        }, { status: 400 });
      }
      
      // Verificar límite de usos ANTES de incrementar
      if (coupon.usageLimit > 0 && coupon.timesUsed >= coupon.usageLimit) {
        console.log('❌ Cupón agotado. Usos:', coupon.timesUsed, 'Límite:', coupon.usageLimit);
        return NextResponse.json({
          success: false,
          message: 'El cupón ha alcanzado su límite de usos'
        }, { status: 400 });
      }
      
      console.log('✅ Cupón válido. Usos actuales:', coupon.timesUsed, 'Límite:', coupon.usageLimit || 'Sin límite');
      
      // Agregar información del cupón a la reserva usando los datos ya validados
      newBookingData.couponUsed = {
        couponId: coupon._id,
        code: coupon.code,
        discountType: appliedCouponData.discountType,
        value: appliedCouponData.value,
        discountAmount: parseFloat(bookingData.discount) || 0
      };
      
      console.log('📝 Cupón agregado a los datos de la reserva');
    }
    
    console.log('💾 Guardando reserva en base de datos...');
    
    // Crear la reserva
    const newBooking = new Booking(newBookingData);
    const savedBooking = await newBooking.save();
    
    console.log('✅ Reserva guardada exitosamente:', savedBooking._id);
    
    // SOLO después de guardar exitosamente, incrementar el uso del cupón
    if (bookingData.couponCode && savedBooking.couponUsed?.couponId) {
      try {
        await Coupon.findByIdAndUpdate(savedBooking.couponUsed.couponId, {
          $inc: { timesUsed: 1 }
        });
        console.log('✅ Contador de cupón incrementado exitosamente');
      } catch (couponError) {
        console.warn('⚠️ Error incrementando contador de cupón:', couponError.message);
        // No fallar la reserva por esto
      }
    }
    
    // Poblar información del cupón si existe
    await savedBooking.populate('couponUsed.couponId');
    
    console.log('✅ Reserva creada exitosamente:', savedBooking._id);
    console.log('📊 Tamaño de imagen:', `${(savedBooking.receiptImageSize / 1024).toFixed(1)} KB`);
    
    return NextResponse.json({
      success: true,
      booking: {
        id: savedBooking._id,
        hours: savedBooking.hours,
        services: savedBooking.services,
        total: savedBooking.total,
        discount: savedBooking.discount,
        hasReceiptImage: !!savedBooking.receiptImage,
        receiptImageType: savedBooking.receiptImageType,
        receiptImageSize: savedBooking.receiptImageSizeFormatted,
        couponUsed: savedBooking.couponSummary,
        status: savedBooking.status,
        createdAt: savedBooking.createdAt
      },
      message: 'Reserva creada exitosamente'
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error en POST /api/bookings:', error);
    
    // Error específico de MongoDB por tamaño de documento
    if (error.code === 16755 || error.message?.includes('document too large')) {
      return NextResponse.json({
        success: false,
        message: 'La imagen es demasiado grande. Por favor usa una imagen más pequeña.'
      }, { status: 413 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor al crear la reserva',
      error: error.message
    }, { status: 500 });
  }
}

// GET - Obtener estadísticas públicas (opcional)
export async function GET(req) {
  try {
    console.log('📊 GET /api/bookings - Obteniendo estadísticas públicas...');
    
    await connectToDatabase();
    
    // Solo estadísticas básicas, sin datos sensibles
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          averageRating: { $avg: '$hours' }, // Promedio de horas como métrica pública
          totalImageStorage: { $sum: '$receiptImageSize' } // Espacio total usado por imágenes
        }
      }
    ]);
    
    const result = stats[0] || { 
      totalBookings: 0, 
      averageRating: 0, 
      totalImageStorage: 0 
    };
    
    // Formatear el tamaño del almacenamiento
    result.totalImageStorageFormatted = result.totalImageStorage > 0 
      ? `${(result.totalImageStorage / 1024 / 1024).toFixed(2)} MB`
      : '0 MB';
    
    return NextResponse.json({
      success: true,
      stats: result
    });
    
  } catch (error) {
    console.error('❌ Error en GET /api/bookings:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al obtener estadísticas'
    }, { status: 500 });
  }
}