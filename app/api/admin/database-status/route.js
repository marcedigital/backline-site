// app/api/admin/database-status/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '../../../../utils/database';
import { verifyAdminToken } from '../../../../utils/auth';
import Coupon from '../../../../models/coupons';
import AdminUser from '../../../../models/adminUser';

export async function GET(req) {
  try {
    console.log('🔍 GET /api/admin/database-status - Verificando estado...');
    
    // Verificar autenticación admin
    const adminUser = await verifyAdminToken(req);
    if (!adminUser) {
      console.log('❌ Token admin inválido');
      return NextResponse.json({ 
        success: false,
        message: 'No autorizado' 
      }, { status: 401 });
    }
    
    console.log('✅ Admin autenticado:', adminUser.username);
    
    const status = {
      connected: false,
      message: '',
      timestamp: new Date().toISOString(),
      details: {
        mongooseState: 'disconnected',
        databaseName: '',
        collections: [],
        totalCoupons: 0,
        totalAdmins: 0,
        connectionTime: null,
        errors: []
      }
    };

    try {
      // Intentar conectar a la base de datos
      console.log('🔌 Intentando conectar a MongoDB...');
      await connectToDatabase();
      
      // Verificar estado de conexión de Mongoose
      const mongooseState = mongoose.connection.readyState;
      const stateNames = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      
      status.details.mongooseState = stateNames[mongooseState] || 'unknown';
      console.log('📊 Estado de Mongoose:', status.details.mongooseState);
      
      if (mongooseState === 1) {
        // Conexión exitosa
        status.connected = true;
        status.message = 'Conectado a MongoDB exitosamente';
        
        // Obtener información de la base de datos
        status.details.databaseName = mongoose.connection.db.databaseName;
        console.log('🗄️ Base de datos:', status.details.databaseName);
        
        // Obtener lista de colecciones
        try {
          const collections = await mongoose.connection.db.listCollections().toArray();
          status.details.collections = collections.map(col => ({
            name: col.name,
            type: col.type || 'collection'
          }));
          console.log('📋 Colecciones encontradas:', status.details.collections.length);
        } catch (collectionsError) {
          console.warn('⚠️ No se pudieron obtener las colecciones:', collectionsError.message);
          status.details.errors.push('No se pudieron listar las colecciones');
        }
        
        // Contar documentos en las colecciones principales
        try {
          // Contar cupones
          const couponCount = await Coupon.countDocuments();
          status.details.totalCoupons = couponCount;
          console.log('🎫 Total cupones:', couponCount);
          
          // Contar admins
          try {
            const adminCount = await AdminUser.countDocuments();
            status.details.totalAdmins = adminCount;
            console.log('👤 Total admins:', adminCount);
          } catch (adminError) {
            console.warn('⚠️ No se pudieron contar admins:', adminError.message);
            status.details.errors.push('Error contando usuarios admin');
          }
          
        } catch (countError) {
          console.warn('⚠️ Error contando documentos:', countError.message);
          status.details.errors.push('Error contando documentos');
        }
        
        // Tiempo de conexión (uptime aproximado)
        if (mongoose.connection.readyState === 1) {
          status.details.connectionTime = new Date().toISOString();
        }
        
        // Verificar performance con una query simple
        try {
          const startTime = Date.now();
          await mongoose.connection.db.admin().ping();
          const pingTime = Date.now() - startTime;
          status.details.pingTime = `${pingTime}ms`;
          console.log('🏓 Ping a MongoDB:', status.details.pingTime);
        } catch (pingError) {
          console.warn('⚠️ Error en ping:', pingError.message);
          status.details.errors.push('Error en ping de performance');
        }
        
      } else {
        // Conexión fallida o en proceso
        status.connected = false;
        status.message = `Estado de conexión: ${status.details.mongooseState}`;
        status.details.errors.push('MongoDB no está completamente conectado');
      }
      
    } catch (connectionError) {
      console.error('❌ Error de conexión a MongoDB:', connectionError);
      status.connected = false;
      status.message = 'Error de conexión a MongoDB';
      status.details.errors.push(connectionError.message);
      
      // Diagnosticar el tipo de error
      if (connectionError.message.includes('ENOTFOUND')) {
        status.details.errors.push('Servidor MongoDB no encontrado - verificar URL');
      } else if (connectionError.message.includes('authentication')) {
        status.details.errors.push('Error de autenticación - verificar credenciales');
      } else if (connectionError.message.includes('timeout')) {
        status.details.errors.push('Timeout de conexión - verificar red');
      }
    }

    // Información adicional del entorno
    status.details.environment = {
      nodeVersion: process.version,
      mongooseVersion: mongoose.version,
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoUriPreview: process.env.MONGODB_URI ? 
        process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 
        'No configurado'
    };

    console.log('📊 Estado final:', status.connected ? 'CONECTADO' : 'DESCONECTADO');
    
    return NextResponse.json({
      success: true,
      ...status
    });
    
  } catch (error) {
    console.error('❌ Error general en database-status:', error);
    
    return NextResponse.json({
      success: false,
      connected: false,
      message: 'Error al verificar estado de la base de datos',
      timestamp: new Date().toISOString(),
      details: {
        mongooseState: 'error',
        errors: [error.message]
      }
    }, { status: 500 });
  }
}

// POST - Intentar reconectar (opcional)
export async function POST(req) {
  try {
    console.log('🔄 POST /api/admin/database-status - Intentando reconectar...');
    
    // Verificar autenticación admin
    const adminUser = await verifyAdminToken(req);
    if (!adminUser) {
      return NextResponse.json({ 
        success: false,
        message: 'No autorizado' 
      }, { status: 401 });
    }
    
    // Cerrar conexión existente si existe
    if (mongoose.connection.readyState !== 0) {
      console.log('🔌 Cerrando conexión existente...');
      await mongoose.connection.close();
    }
    
    // Intentar reconectar
    console.log('🔄 Reconnectando...');
    await connectToDatabase();
    
    // Verificar el estado
    const connected = mongoose.connection.readyState === 1;
    
    return NextResponse.json({
      success: true,
      connected,
      message: connected ? 'Reconexión exitosa' : 'Reconexión fallida',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error en reconexión:', error);
    
    return NextResponse.json({
      success: false,
      connected: false,
      message: 'Error al intentar reconectar',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}