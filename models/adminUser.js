import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AdminUserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

// Hash password antes de guardar
AdminUserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Método para comparar passwords
AdminUserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);