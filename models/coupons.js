import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  couponType: {
    type: String,
    enum: ['one-time', 'time-limited'],
    required: true,
  },
  startDate: { type: Date },
  endDate: { type: Date },
  active: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 },
  lastUsedAt: { type: Date },
  lastUsedBy: { type: String }
}, { timestamps: true });

// Validación personalizada para cupones con límite de tiempo
CouponSchema.pre('validate', function(next) {
  if (this.couponType === 'time-limited') {
    if (!this.startDate || !this.endDate) {
      return next(new Error('Time-limited coupons require both start and end dates'));
    }
    if (this.startDate > this.endDate) {
      return next(new Error('Start date must be before end date'));
    }
  }
  next();
});

// Método para rastrear uso
CouponSchema.methods.trackUsage = async function(userId) {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  if (userId) this.lastUsedBy = userId;
  
  // Desactivar cupones de un solo uso después del uso
  if (this.couponType === 'one-time') {
    this.active = false;
  }
  return this.save();
};

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);