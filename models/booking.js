// models/booking.js
import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  // Datos de la calculadora
  hours: {
    type: Number,
    required: true,
    min: 1
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
  
  // Datos del cliente
  receiptDetail: {
    type: String,
    required: true,
    trim: true
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
BookingSchema.index({ receiptDetail: 'text' });

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
        statusBreakdown: {
          $push: '$status'
        }
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
    statusBreakdown: []
  };
};

// Método estático para obtener top cupones
BookingSchema.statics.getTopCoupons = async function(limit = 10) {
  return await this.aggregate([
    { $match: { 'couponUsed.code': { $ne: null } } },
    {
      $group: {
        _id: '$couponUsed.code',
        usageCount: { $sum: 1 },
        totalSavings: { $sum: '$couponUsed.discountAmount' },
        lastUsed: { $max: '$createdAt' },
        discountType: { $first: '$couponUsed.discountType' },
        value: { $first: '$couponUsed.value' }
      }
    },
    { $sort: { usageCount: -1 } },
    { $limit: limit }
  ]);
};

// Método para actualizar estado
BookingSchema.methods.updateStatus = async function(newStatus) {
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
  
  return await this.save();
};

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);