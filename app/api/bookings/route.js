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
    
    const bookingData = await req.json();
    console.log('📋 Datos de reserva recibidos:', {
      hours: bookingData.hours,
      services: bookingData.services,
      total: bookingData.total,
      coupon: bookingData.couponCode || 'Sin cupón'
    });
    
    // Validar datos requeridos
    const { hours, services, subtotal, total, discount, receiptDetail } = bookingData;
    
    if (!hours || !services || !subtotal || !total || !receiptDetail) {
      return NextResponse.json({
        success: false,
        message: 'Faltan datos requeridos para crear la reserva'
      }, { status: 400 });
    }
    
    // Obtener IP y User Agent
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Preparar datos de la reserva
    const newBookingData = {
      hours: parseFloat(hours),
      services: {
        platillos: Boolean(services.platillos),
        pedalDoble: Boolean(services.pedalDoble)
      },
      subtotal: parseFloat(subtotal),
      discount: parseFloat(discount) || 0,
      total: parseFloat(total),
      receiptDetail: receiptDetail.trim(),
      ipAddress,
      userAgent,
      status: 'pending'
    };
    
    // Si se usó un cupón, procesarlo
    if (bookingData.couponCode && bookingData.appliedCoupon) {
      console.log('🎫 Procesando cupón:', bookingData.couponCode);
      
      try {
        // Buscar el cupón en la base de datos
        const coupon = await Coupon.findOne({ 
          code: bookingData.couponCode.toUpperCase(),
          active: true 
        });
        
        if (!coupon) {
          return NextResponse.json({
            success: false,
            message: 'El cupón no es válido o ya no está activo'
          }, { status: 400 });
        }
        
        // Agregar información del cupón a la reserva
        newBookingData.couponUsed = {
          couponId: coupon._id,
          code: coupon.code,
          discountType: coupon.discountType,
          value: coupon.value,
          discountAmount: parseFloat(discount) || 0
        };
        
        // Actualizar estadísticas del cupón
        await coupon.trackUsage(receiptDetail);
        
        console.log('✅ Cupón procesado y estadísticas actualizadas');
        
      } catch (couponError) {
        console.error('❌ Error procesando cupón:', couponError);
        // Continuar con la reserva sin cupón en caso de error
        newBookingData.couponUsed = {};
      }
    }
    
    // Crear la reserva
    const booking = new Booking(newBookingData);
    const savedBooking = await booking.save();
    
    console.log('✅ Reserva creada exitosamente:', savedBooking._id);
    
    // Poblar información del cupón para la respuesta
    await savedBooking.populate('couponUsed.couponId');
    
    return NextResponse.json({
      success: true,
      booking: {
        id: savedBooking._id,
        hours: savedBooking.hours,
        services: savedBooking.services,
        total: savedBooking.total,
        discount: savedBooking.discount,
        receiptDetail: savedBooking.receiptDetail,
        couponUsed: savedBooking.couponSummary,
        status: savedBooking.status,
        createdAt: savedBooking.createdAt
      },
      message: 'Reserva creada exitosamente'
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error en POST /api/bookings:', error);
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
          averageRating: { $avg: '$hours' } // Promedio de horas como métrica pública
        }
      }
    ]);
    
    return NextResponse.json({
      success: true,
      stats: stats[0] || { totalBookings: 0, averageRating: 0 }
    });
    
  } catch (error) {
    console.error('❌ Error en GET /api/bookings:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al obtener estadísticas'
    }, { status: 500 });
  }
}