import jwt from 'jsonwebtoken';
import AdminUser from '../models/adminUser';
import { connectToDatabase } from './database';

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyAdminToken = async (req) => {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    await connectToDatabase();
    
    const admin = await AdminUser.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return null;
    }

    return admin;
  } catch (error) {
    return null;
  }
};

export const generateToken = (admin) => {
  return jwt.sign(
    { id: admin._id, username: admin.username }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );
};