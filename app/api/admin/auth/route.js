import { NextResponse } from 'next/server';
import AdminUser from '../../../../models/adminUser';
import { connectToDatabase } from '../../../../utils/database';
import { generateToken } from '../../../../utils/auth';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    console.log('🔄 Iniciando proceso de autenticación...');
    
    const { username, password } = await req.json();
    console.log('📝 Credenciales recibidas:', { username, password: password ? '***' : 'vacío' });
    
    if (!username || !password) {
      console.log('❌ Faltan credenciales');
      return NextResponse.json({ 
        success: false, 
        message: 'Username and password are required',
        debug: 'Credenciales faltantes'
      }, { status: 400 });
    }

    // Verificar variables de entorno
    console.log('🔧 Variables de entorno:');
    console.log('- MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('- JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('- ADMIN_USERNAME:', process.env.ADMIN_USERNAME);
    console.log('- ADMIN_PASSWORD exists:', !!process.env.ADMIN_PASSWORD);

    // Intentar conectar a la base de datos
    console.log('🔌 Intentando conectar a MongoDB...');
    try {
      await connectToDatabase();
      console.log('✅ Conexión a MongoDB exitosa');
    } catch (dbError) {
      console.error('❌ Error de conexión a MongoDB:', dbError);
      return NextResponse.json({
        success: false,
        message: 'Error de conexión a base de datos',
        debug: dbError.message
      }, { status: 500 });
    }
    
    // Buscar admin en la base de datos
    console.log('🔍 Buscando admin en BD:', username);
    let admin;
    try {
      admin = await AdminUser.findOne({ username });
      console.log('👤 Admin encontrado en BD:', !!admin);
      if (admin) {
        console.log('- Username BD:', admin.username);
        console.log('- Active:', admin.isActive);
        console.log('- Password hash exists:', !!admin.password);
      }
    } catch (findError) {
      console.error('❌ Error buscando admin:', findError);
      return NextResponse.json({
        success: false,
        message: 'Error consultando base de datos',
        debug: findError.message
      }, { status: 500 });
    }
    
    // Si no existe admin en DB, usar credenciales de environment
    if (!admin) {
      console.log('🔄 No hay admin en BD, probando credenciales de entorno...');
      const envUsername = process.env.ADMIN_USERNAME;
      const envPassword = process.env.ADMIN_PASSWORD;
      
      console.log('🔧 Comparando credenciales:');
      console.log('- Input username:', username);
      console.log('- Env username:', envUsername);
      console.log('- Username match:', username === envUsername);
      console.log('- Password match:', password === envPassword);
      
      if (username === envUsername && password === envPassword) {
        console.log('✅ Autenticación exitosa con credenciales de entorno');
        const token = generateToken({ _id: 'env-admin', username: envUsername });
        return NextResponse.json({
          success: true,
          token,
          user: { username: envUsername },
          debug: 'Autenticado con variables de entorno'
        });
      }
      
      console.log('❌ Credenciales de entorno no coinciden');
      return NextResponse.json({ 
        success: false, 
        message: 'Credenciales inválidas',
        debug: 'No hay admin en BD y credenciales de entorno no coinciden'
      }, { status: 401 });
    }
    
    // Verificar password del admin de DB
    console.log('🔐 Verificando password del admin de BD...');
    try {
      if (!admin.isActive) {
        console.log('❌ Admin inactivo');
        return NextResponse.json({ 
          success: false, 
          message: 'Usuario inactivo',
          debug: 'Admin existe pero está inactivo'
        }, { status: 401 });
      }

      const passwordMatch = await admin.comparePassword(password);
      console.log('🔑 Password match:', passwordMatch);
      
      if (!passwordMatch) {
        console.log('❌ Password incorrecto');
        return NextResponse.json({ 
          success: false, 
          message: 'Credenciales inválidas',
          debug: 'Password incorrecto para admin de BD'
        }, { status: 401 });
      }
      
      console.log('✅ Autenticación exitosa con admin de BD');
      const token = generateToken(admin);
      
      return NextResponse.json({
        success: true,
        token,
        user: { username: admin.username },
        debug: 'Autenticado con admin de BD'
      });
      
    } catch (authError) {
      console.error('❌ Error en verificación de password:', authError);
      return NextResponse.json({
        success: false,
        message: 'Error en autenticación',
        debug: authError.message
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Error general en autenticación:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error de autenticación',
      debug: error.message
    }, { status: 500 });
  }
}