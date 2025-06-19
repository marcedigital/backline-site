import { NextResponse } from 'next/server';
import { connectToDatabase, isConnected } from '../../../../utils/database';
import { verifyAdminToken } from '../../../../utils/auth';

export async function GET(req) {
  try {
    // Verificar autenticación admin
    const admin = await verifyAdminToken(req);
    if (!admin) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 401 });
    }

    // Intentar conectar a la base de datos
    await connectToDatabase();
    
    const connected = isConnected();
    
    return NextResponse.json({
      success: true,
      connected,
      message: connected ? 'Conectado a la base de datos' : 'No conectado a la base de datos',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database status error:', error);
    return NextResponse.json({
      success: false,
      connected: false,
      message: 'No conectado a la base de datos',
      error: error.message
    }, { status: 500 });
  }
}