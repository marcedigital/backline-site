// models/booking.js
import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  // Datos de la calculadora
  hours: {
    type: Number,
    required: true,
    min: 1
  },
  reservationDate: {
    type: Date,
    required: true
  },
  services: {
    platillos: { type: Boolean, default: false },
    pedalDoble: { type: Boolean, default: false }
  },
  
  // Información financiera
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Información del cupón (si se usó)
  couponUsed: {
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    code: { type: String },
    discountType: { type: String, enum: ['percentage', 'fixed', 'hours'] },
    value: { type: Number },
    discountAmount: { type: Number, default: 0 }
  },
  
  // CAMPO ACTUALIZADO: Ahora usamos imagen en lugar de texto
  receiptImage: {
    type: String, // Base64 de la imagen
    required: true
  },
  receiptImageType: {
    type: String, // Tipo MIME de la imagen (image/jpeg, image/png, etc.)
    required: true
  },
  receiptImageSize: {
    type: Number, // Tamaño en bytes para control
    required: true
  },
  
  // Metadata del sistema
  ipAddress: { type: String },
  userAgent: { type: String },
  
  // Estado de la reserva
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  
  // Timestamps adicionales
  confirmedAt: { type: Date },
  cancelledAt: { type: Date },
  completedAt: { type: Date }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para consultas optimizadas
BookingSchema.index({ createdAt: -1 });
BookingSchema.index({ 'couponUsed.couponId': 1 });
BookingSchema.index({ status: 1 });

// Virtual para calcular duración desde creación
BookingSchema.virtual('timeSinceCreated').get(function() {
  return Date.now() - this.createdAt;
});

// Virtual para obtener información resumida del cupón
BookingSchema.virtual('couponSummary').get(function() {
  if (!this.couponUsed || !this.couponUsed.code) return null;
  
  return {
    code: this.couponUsed.code,
    type: this.couponUsed.discountType,
    value: this.couponUsed.value,
    savedAmount: this.couponUsed.discountAmount
  };
});

// Virtual para obtener el tamaño de la imagen en formato legible
BookingSchema.virtual('receiptImageSizeFormatted').get(function() {
  if (!this.receiptImageSize) return 'N/A';
  
  const sizes = ['bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(this.receiptImageSize) / Math.log(1024));
  return Math.round(this.receiptImageSize / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Método estático para obtener estadísticas
BookingSchema.statics.getStats = async function(dateRange = {}) {
  const matchStage = {};
  
  if (dateRange.start && dateRange.end) {
    matchStage.createdAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        totalDiscount: { $sum: '$discount' },
        averageBookingValue: { $avg: '$total' },
        averageHours: { $avg: '$hours' },
        couponsUsed: {
          $sum: { $cond: [{ $ne: ['$couponUsed.code', null] }, 1, 0] }
        },
        totalImageSize: { $sum: '$receiptImageSize' } // NUEVO: Total de espacio usado por imágenes
      }
    }
  ]);
  
  return stats[0] || {
    totalBookings: 0,
    totalRevenue: 0,
    totalDiscount: 0,
    averageBookingValue: 0,
    averageHours: 0,
    couponsUsed: 0,
    totalImageSize: 0
  };
};

// Método para limpiar imágenes de reservas antiguas (>6 meses)
BookingSchema.statics.cleanOldImages = async function() {
  console.log('🧹 Iniciando limpieza de imágenes antiguas...');
  
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  try {
    // Buscar reservas mayores a 6 meses que tengan imagen
    const oldBookings = await this.find({
      createdAt: { $lt: sixMonthsAgo },
      receiptImage: { $exists: true, $ne: null }
    });
    
    console.log(`📊 Encontradas ${oldBookings.length} reservas con imágenes para limpiar`);
    
    let totalSizeFreed = 0;
    let cleanedCount = 0;
    
    // Limpiar imágenes una por una
    for (const booking of oldBookings) {
      const imageSize = booking.receiptImageSize || 0;
      
      await this.findByIdAndUpdate(booking._id, {
        $unset: {
          receiptImage: 1,
          receiptImageType: 1,
          receiptImageSize: 1
        }
      });
      
      totalSizeFreed += imageSize;
      cleanedCount++;
    }
    
    console.log(`✅ Limpieza completada:`);
    console.log(`- Imágenes eliminadas: ${cleanedCount}`);
    console.log(`- Espacio liberado: ${(totalSizeFreed / 1024 / 1024).toFixed(2)} MB`);
    
    return {
      success: true,
      cleanedCount,
      totalSizeFreed,
      message: `Se eliminaron ${cleanedCount} imágenes, liberando ${(totalSizeFreed / 1024 / 1024).toFixed(2)} MB`
    };
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Método de instancia para actualizar estado (mantener compatibilidad)
BookingSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  const now = new Date();
  switch (newStatus) {
    case 'confirmed':
      this.confirmedAt = now;
      break;
    case 'cancelled':
      this.cancelledAt = now;
      break;
    case 'completed':
      this.completedAt = now;
      break;
  }
  
  return this.save();
};

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);