// app/api/admin/bookings/[id]/image/route.js
import { NextResponse } from 'next/server';
import Booking from '../../../../../../models/booking';
import { connectToDatabase } from '../../../../../../utils/database';
import { verifyAdminToken } from '../../../../../../utils/auth';

// GET - Obtener imagen de una reserva específica
export async function GET(req, { params }) {
  try {
    console.log('🖼️ GET /api/admin/bookings/[id]/image - Cargando imagen...');
    
    // Verificar autenticación admin
    const adminUser = await verifyAdminToken(req);
    if (!adminUser) {
      console.log('❌ Token admin inválido');
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    
    console.log('✅ Admin autenticado:', adminUser.username);
    
    await connectToDatabase();
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID de reserva requerido'
      }, { status: 400 });
    }
    
    console.log('🔍 Buscando imagen para reserva:', id);
    
    // Buscar solo la imagen de la reserva específica
    const booking = await Booking.findById(id)
      .select('receiptImage receiptImageType receiptImageSize')
      .lean();
    
    if (!booking) {
      return NextResponse.json({
        success: false,
        message: 'Reserva no encontrada'
      }, { status: 404 });
    }
    
    if (!booking.receiptImage) {
      return NextResponse.json({
        success: false,
        message: 'Esta reserva no tiene imagen de comprobante'
      }, { status: 404 });
    }
    
    console.log('✅ Imagen encontrada:', {
      id: id,
      type: booking.receiptImageType,
      size: `${(booking.receiptImageSize / 1024).toFixed(1)} KB`
    });
    
    return NextResponse.json({
      success: true,
      image: {
        data: booking.receiptImage,
        type: booking.receiptImageType,
        size: booking.receiptImageSize,
        sizeFormatted: `${(booking.receiptImageSize / 1024).toFixed(1)} KB`
      }
    });
    
  } catch (error) {
    console.error('❌ Error en GET /api/admin/bookings/[id]/image:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al obtener la imagen',
      error: error.message
    }, { status: 500 });
  }
}