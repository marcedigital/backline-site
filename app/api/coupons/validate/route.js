import { NextResponse } from 'next/server';
import Coupon from '../../../../models/coupons';
import { connectToDatabase } from '../../../../utils/database';

export async function GET(req) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const couponCode = searchParams.get('code');
    
    if (!couponCode) {
      return NextResponse.json({ 
        success: false, 
        message: 'Código de cupón requerido' 
      }, { status: 400 });
    }
    
    const coupon = await Coupon.findOne({ 
      code: couponCode.toUpperCase() 
    });
    
    if (!coupon) {
      return NextResponse.json({ 
        success: false, 
        message: 'Cupón no encontrado' 
      }, { status: 404 });
    }
    
    if (!coupon.active) {
      return NextResponse.json({ 
        success: false, 
        message: 'Este cupón no está activo' 
      }, { status: 400 });
    }
    
    // Verificar cupones con límite de tiempo
    if (coupon.couponType === 'time-limited') {
      const now = new Date();
      if (!coupon.startDate || !coupon.endDate) {
        return NextResponse.json({ 
          success: false, 
          message: 'Cupón no válido' 
        }, { status: 400 });
      }
      
      if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
        return NextResponse.json({ 
          success: false, 
          message: 'Este cupón no está vigente' 
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        value: coupon.value,
        couponType: coupon.couponType,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        active: coupon.active
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error interno del servidor' 
    }, { status: 500 });
  }
}