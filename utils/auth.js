// utils/auth.js - UTILIDADES DE AUTENTICACIÓN COMPLETAS
import jwt from 'jsonwebtoken';
import AdminUser from '../models/adminUser';
import { connectToDatabase } from './database';

/**
 * Genera un token JWT para un usuario admin
 * @param {Object} user - Datos del usuario (debe tener _id y username)
 * @returns {string} Token JWT firmado
 */
export function generateToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado en las variables de entorno');
  }

  const payload = {
    id: user._id,
    username: user.username,
    type: 'admin'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { 
    expiresIn: '24h',
    issuer: 'backline-studios-admin'
  });
}

/**
 * Verifica un token JWT y retorna los datos del usuario
 * @param {string} token - Token JWT a verificar
 * @returns {Object|null} Datos del usuario si el token es válido, null si no
 */
export function verifyToken(token) {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET no está configurado');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que sea un token de admin
    if (decoded.type !== 'admin') {
      console.log('❌ Token no es de tipo admin');
      return null;
    }

    return decoded;
  } catch (error) {
    console.log('❌ Error verificando token:', error.message);
    return null;
  }
}

/**
 * Extrae y verifica el token de una request de Next.js
 * @param {NextRequest} req - Request object de Next.js
 * @returns {Object|null} Datos del admin autenticado o null
 */
export async function verifyAdminToken(req) {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No se encontró token en Authorization header');
      return null;
    }

    const token = authHeader.substring(7); // Remover "Bearer "
    
    // Verificar el token
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('❌ Token inválido o expirado');
      return null;
    }

    console.log('✅ Token válido para admin:', decoded.username);

    // Si el token es de variables de entorno, retornar datos básicos
    if (decoded.id === 'env-admin') {
      return {
        _id: 'env-admin',
        username: decoded.username,
        isActive: true,
        source: 'environment'
      };
    }

    // Si es un admin de base de datos, verificar que aún existe y está activo
    try {
      await connectToDatabase();
      const admin = await AdminUser.findById(decoded.id);
      
      if (!admin) {
        console.log('❌ Admin no encontrado en BD:', decoded.id);
        return null;
      }

      if (!admin.isActive) {
        console.log('❌ Admin inactivo:', admin.username);
        return null;
      }

      console.log('✅ Admin verificado desde BD:', admin.username);
      return {
        _id: admin._id,
        username: admin.username,
        isActive: admin.isActive,
        source: 'database'
      };
      
    } catch (dbError) {
      console.error('❌ Error verificando admin en BD:', dbError);
      // Si hay error de BD pero el token es válido, permitir acceso con datos del token
      return {
        _id: decoded.id,
        username: decoded.username,
        isActive: true,
        source: 'token-fallback'
      };
    }

  } catch (error) {
    console.error('❌ Error en verifyAdminToken:', error);
    return null;
  }
}

/**
 * Middleware para proteger rutas de admin
 * Uso: const admin = await requireAdmin(req); if (!admin) return unauthorized();
 * @param {NextRequest} req - Request object
 * @returns {Object|null} Admin autenticado o null
 */
export async function requireAdmin(req) {
  const admin = await verifyAdminToken(req);
  if (!admin) {
    console.log('❌ Acceso denegado - Admin requerido');
  }
  return admin;
}

/**
 * Verifica si un usuario tiene permisos de admin
 * Útil para verificaciones adicionales de autorización
 * @param {Object} user - Objeto usuario a verificar
 * @returns {boolean} True si es admin válido
 */
export function isValidAdmin(user) {
  return user && 
         user._id && 
         user.username && 
         user.isActive !== false;
}

/**
 * Crea respuesta de error no autorizado estándar
 * @param {string} message - Mensaje personalizado (opcional)
 * @returns {NextResponse} Respuesta 401 estandarizada
 */
export function unauthorizedResponse(message = 'No autorizado') {
  return new Response(
    JSON.stringify({ 
      success: false, 
      message,
      error: 'UNAUTHORIZED' 
    }), 
    { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Obtiene información del token sin verificar con la BD
 * Útil para casos donde solo necesitas datos básicos del token
 * @param {NextRequest} req - Request object
 * @returns {Object|null} Datos del token decodificado
 */
export function getTokenData(req) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    return verifyToken(token);
    
  } catch (error) {
    console.error('Error obteniendo datos del token:', error);
    return null;
  }
}

/**
 * Middleware específico para verificar permisos de gestión de cupones
 * @param {NextRequest} req - Request object
 * @returns {Object|null} Admin con permisos verificados
 */
export async function requireCouponManagement(req) {
  const admin = await verifyAdminToken(req);
  
  if (!admin) {
    console.log('❌ Sin permisos para gestión de cupones - No autenticado');
    return null;
  }

  // Aquí podrías agregar verificaciones adicionales de permisos específicos
  // Por ejemplo, roles específicos para gestión de cupones
  
  console.log('✅ Permisos de gestión de cupones verificados para:', admin.username);
  return admin;
}

/**
 * Valida datos de entrada para creación/actualización de cupones
 * @param {Object} couponData - Datos del cupón a validar
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validateCouponData(couponData) {
  const errors = [];
  
  // Validar código
  if (!couponData.code || typeof couponData.code !== 'string') {
    errors.push('Código del cupón es requerido');
  } else if (couponData.code.length < 3) {
    errors.push('El código debe tener al menos 3 caracteres');
  } else if (couponData.code.length > 20) {
    errors.push('El código no puede tener más de 20 caracteres');
  } else if (!/^[A-Z0-9]+$/.test(couponData.code)) {
    errors.push('El código solo puede contener letras mayúsculas y números');
  }
  
  // Validar tipo de descuento
  if (!['percentage', 'fixed'].includes(couponData.discountType)) {
    errors.push('Tipo de descuento debe ser "percentage" o "fixed"');
  }
  
  // Validar valor
  const value = parseFloat(couponData.value);
  if (isNaN(value) || value <= 0) {
    errors.push('El valor debe ser un número mayor a 0');
  }
  
  if (couponData.discountType === 'percentage' && value > 100) {
    errors.push('El porcentaje no puede ser mayor a 100');
  }
  
  // Validar tipo de cupón
  if (!['one-time', 'time-limited'].includes(couponData.couponType)) {
    errors.push('Tipo de cupón debe ser "one-time" o "time-limited"');
  }
  
  // Validar fechas para cupones de tiempo limitado
  if (couponData.couponType === 'time-limited') {
    if (!couponData.startDate || !couponData.endDate) {
      errors.push('Cupones de tiempo limitado requieren fechas de inicio y fin');
    } else {
      const startDate = new Date(couponData.startDate);
      const endDate = new Date(couponData.endDate);
      const now = new Date();
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        errors.push('Fechas inválidas');
      } else if (startDate >= endDate) {
        errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
      } else if (endDate <= now) {
        errors.push('La fecha de fin debe ser futura');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export default {
  generateToken,
  verifyToken,
  verifyAdminToken,
  requireAdmin,
  requireCouponManagement,
  isValidAdmin,
  unauthorizedResponse,
  getTokenData,
  validateCouponData
};