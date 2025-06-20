// app/api/admin/cleanup-images/route.js
import { NextResponse } from 'next/server';
import Booking from '../../../../models/booking';
import { connectToDatabase } from '../../../../utils/database';
import { verifyAdminToken } from '../../../../utils/auth';

// POST - Ejecutar limpieza de imágenes antiguas
export async function POST(req) {
  try {
    console.log('🧹 POST /api/admin/cleanup-images - Iniciando limpieza de imágenes...');
    
    // Verificar autenticación admin
    const adminUser = await verifyAdminToken(req);
    if (!adminUser) {
      console.log('❌ Token admin inválido');
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    
    console.log('✅ Admin autenticado:', adminUser.username);
    
    await connectToDatabase();
    
    // Ejecutar limpieza usando el método del modelo
    const result = await Booking.cleanOldImages();
    
    if (result.success) {
      console.log('✅ Limpieza completada exitosamente');
      return NextResponse.json({
        success: true,
        data: {
          cleanedCount: result.cleanedCount,
          totalSizeFreed: result.totalSizeFreed,
          totalSizeFreedMB: (result.totalSizeFreed / 1024 / 1024).toFixed(2)
        },
        message: result.message
      });
    } else {
      console.error('❌ Error en la limpieza:', result.error);
      return NextResponse.json({
        success: false,
        message: 'Error durante la limpieza: ' + result.error
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Error en POST /api/admin/cleanup-images:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    }, { status: 500 });
  }
}

// GET - Obtener información sobre imágenes que serían limpiadas (preview)
export async function GET(req) {
  try {
    console.log('📊 GET /api/admin/cleanup-images - Obteniendo preview de limpieza...');
    
    // Verificar autenticación admin
    const adminUser = await verifyAdminToken(req);
    if (!adminUser) {
      console.log('❌ Token admin inválido');
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    
    console.log('✅ Admin autenticado:', adminUser.username);
    
    await connectToDatabase();
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // Obtener estadísticas de lo que se limpiaría
    const oldBookingsWithImages = await Booking.find({
      createdAt: { $lt: sixMonthsAgo },
      receiptImage: { $exists: true, $ne: null }
    }).select('createdAt receiptImageSize receiptImageType');
    
    const totalImageSize = oldBookingsWithImages.reduce((sum, booking) => {
      return sum + (booking.receiptImageSize || 0);
    }, 0);
    
    // Obtener estadísticas generales
    const allBookingsStats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalWithImages: {
            $sum: {
              $cond: [
                { $and: [{ $exists: ['$receiptImage'] }, { $ne: ['$receiptImage', null] }] },
                1,
                0
              ]
            }
          },
          totalImageStorage: { $sum: '$receiptImageSize' }
        }
      }
    ]);
    
    const generalStats = allBookingsStats[0] || {
      totalBookings: 0,
      totalWithImages: 0,
      totalImageStorage: 0
    };
    
    return NextResponse.json({
      success: true,
      preview: {
        imagesToClean: oldBookingsWithImages.length,
        totalSizeToFree: totalImageSize,
        totalSizeToFreeMB: (totalImageSize / 1024 / 1024).toFixed(2),
        cutoffDate: sixMonthsAgo.toISOString(),
        oldestImageDate: oldBookingsWithImages.length > 0 
          ? oldBookingsWithImages[oldBookingsWithImages.length - 1].createdAt
          : null
      },
      currentStats: {
        totalBookings: generalStats.totalBookings,
        totalWithImages: generalStats.totalWithImages,
        totalImageStorage: generalStats.totalImageStorage,
        totalImageStorageMB: (generalStats.totalImageStorage / 1024 / 1024).toFixed(2)
      }
    });
    
  } catch (error) {
    console.error('❌ Error en GET /api/admin/cleanup-images:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al obtener estadísticas de limpieza',
      error: error.message
    }, { status: 500 });
  }
}