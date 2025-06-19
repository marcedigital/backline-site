// app/api/admin/coupons/route.js
import { NextResponse } from 'next/server';
import Coupon from '../../../../models/coupons';
import { connectToDatabase } from '../../../../utils/database';
import { verifyAdminToken } from '../../../../utils/auth';

// GET - Listar todos los cupones
export async function GET(req) {
  try {
    console.log('🔍 GET /api/admin/coupons - Obteniendo cupones...');
    
    // Verificar autenticación admin
    const adminUser = await verifyAdminToken(req);
    if (!adminUser) {
      console.log('❌ Token admin inválido');
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    
    console.log('✅ Admin autenticado:', adminUser.username);
    
    // Conectar a la base de datos
    await connectToDatabase();
    console.log('✅ Conectado a MongoDB');
    
    // Obtener todos los cupones ordenados por fecha de creación (más recientes primero)
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    console.log(`📄 Encontrados ${coupons.length} cupones`);
    
    return NextResponse.json({ 
      success: true, 
      coupons: coupons,
      count: coupons.length 
    });
    
  } catch (error) {
    console.error('❌ Error en GET /api/admin/coupons:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error al obtener cupones',
      error: error.message 
    }, { status: 500 });
  }
}

// POST - Crear nuevo cupón
export async function POST(req) {
  try {
    console.log('➕ POST /api/admin/coupons - Creando cupón...');
    
    // Verificar autenticación admin
    const adminUser = await verifyAdminToken(req);
    if (!adminUser) {
      console.log('❌ Token admin inválido');
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    
    console.log('✅ Admin autenticado:', adminUser.username);
    
    // Obtener datos del cuerpo de la petición
    const couponData = await req.json();
    console.log('📝 Datos del cupón recibidos:', {
      code: couponData.code,
      discountType: couponData.discountType,
      value: couponData.value,
      couponType: couponData.couponType
    });
    
    // Validar datos requeridos
    const { code, discountType, value, couponType } = couponData;
    
    if (!code || !discountType || !value || !couponType) {
      console.log('❌ Faltan datos requeridos');
      return NextResponse.json({ 
        success: false, 
        message: 'Faltan datos requeridos: code, discountType, value, couponType' 
      }, { status: 400 });
    }
    
    // Validar valores
    if (discountType === 'percentage' && (value < 0 || value > 100)) {
      return NextResponse.json({ 
        success: false, 
        message: 'El porcentaje debe estar entre 0 y 100' 
      }, { status: 400 });
    }
    
    if (discountType === 'fixed' && value <= 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'El valor fijo debe ser mayor a 0' 
      }, { status: 400 });
    }
    
    if (discountType === 'hours' && (value <= 0 || value > 24)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Las horas deben estar entre 1 y 24' 
      }, { status: 400 });
    }
    
    // Conectar a la base de datos
    await connectToDatabase();
    console.log('✅ Conectado a MongoDB');
    
    // Verificar que no exista un cupón con el mismo código
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      console.log('❌ Código de cupón ya existe:', code);
      return NextResponse.json({ 
        success: false, 
        message: `Ya existe un cupón con el código ${code}` 
      }, { status: 409 });
    }
    
    // Preparar datos del cupón
    const newCouponData = {
      code: code.toUpperCase(),
      discountType,
      value: parseFloat(value),
      couponType,
      active: couponData.active !== undefined ? couponData.active : true,
      usageCount: 0
    };
    
    // Agregar fechas si es de tiempo limitado
    if (couponType === 'time-limited') {
      if (!couponData.startDate || !couponData.endDate) {
        return NextResponse.json({ 
          success: false, 
          message: 'Los cupones de tiempo limitado requieren fechas de inicio y fin' 
        }, { status: 400 });
      }
      
      const startDate = new Date(couponData.startDate);
      const endDate = new Date(couponData.endDate);
      
      if (startDate >= endDate) {
        return NextResponse.json({ 
          success: false, 
          message: 'La fecha de inicio debe ser anterior a la fecha de fin' 
        }, { status: 400 });
      }
      
      newCouponData.startDate = startDate;
      newCouponData.endDate = endDate;
    }
    
    console.log('💾 Creando cupón:', newCouponData);
    
    // Crear el cupón
    const coupon = new Coupon(newCouponData);
    const savedCoupon = await coupon.save();
    
    console.log('✅ Cupón creado exitosamente:', savedCoupon._id);
    
    return NextResponse.json({ 
      success: true, 
      coupon: savedCoupon,
      message: 'Cupón creado exitosamente'
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error en POST /api/admin/coupons:', error);
    
    // Manejar errores específicos de MongoDB
    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        message: 'Ya existe un cupón con ese código' 
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Error al crear cupón',
      error: error.message 
    }, { status: 500 });
  }
}

// PUT - Actualizar cupón existente
export async function PUT(req) {
  try {
    console.log('✏️ PUT /api/admin/coupons - Actualizando cupón...');
    
    // Verificar autenticación admin
    const adminUser = await verifyAdminToken(req);
    if (!adminUser) {
      console.log('❌ Token admin inválido');
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    
    console.log('✅ Admin autenticado:', adminUser.username);
    
    // Obtener datos del cuerpo de la petición
    const updateData = await req.json();
    const { id, ...fieldsToUpdate } = updateData;
    
    console.log('📝 Actualizando cupón ID:', id);
    console.log('📝 Campos a actualizar:', Object.keys(fieldsToUpdate));
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID del cupón es requerido' 
      }, { status: 400 });
    }
    
    // Conectar a la base de datos
    await connectToDatabase();
    console.log('✅ Conectado a MongoDB');
    
    // Verificar que el cupón existe
    const existingCoupon = await Coupon.findById(id);
    if (!existingCoupon) {
      console.log('❌ Cupón no encontrado:', id);
      return NextResponse.json({ 
        success: false, 
        message: 'Cupón no encontrado' 
      }, { status: 404 });
    }
    
    // Si se está actualizando el código, verificar que no exista otro con el mismo código
    if (fieldsToUpdate.code && fieldsToUpdate.code.toUpperCase() !== existingCoupon.code) {
      const duplicateCoupon = await Coupon.findOne({ 
        code: fieldsToUpdate.code.toUpperCase(),
        _id: { $ne: id } 
      });
      
      if (duplicateCoupon) {
        return NextResponse.json({ 
          success: false, 
          message: `Ya existe otro cupón con el código ${fieldsToUpdate.code}` 
        }, { status: 409 });
      }
      
      fieldsToUpdate.code = fieldsToUpdate.code.toUpperCase();
    }
    
    // Validar tipos y valores si se están actualizando
    if (fieldsToUpdate.discountType === 'percentage' && fieldsToUpdate.value && 
        (fieldsToUpdate.value < 0 || fieldsToUpdate.value > 100)) {
      return NextResponse.json({ 
        success: false, 
        message: 'El porcentaje debe estar entre 0 y 100' 
      }, { status: 400 });
    }
    
    if (fieldsToUpdate.discountType === 'fixed' && fieldsToUpdate.value && 
        fieldsToUpdate.value <= 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'El valor fijo debe ser mayor a 0' 
      }, { status: 400 });
    }
    
    if (fieldsToUpdate.discountType === 'hours' && fieldsToUpdate.value && 
        (fieldsToUpdate.value <= 0 || fieldsToUpdate.value > 24)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Las horas deben estar entre 1 y 24' 
      }, { status: 400 });
    }
    
    // Manejar fechas para cupones de tiempo limitado
    if (fieldsToUpdate.couponType === 'time-limited' || existingCoupon.couponType === 'time-limited') {
      if (fieldsToUpdate.startDate && fieldsToUpdate.endDate) {
        const startDate = new Date(fieldsToUpdate.startDate);
        const endDate = new Date(fieldsToUpdate.endDate);
        
        if (startDate >= endDate) {
          return NextResponse.json({ 
            success: false, 
            message: 'La fecha de inicio debe ser anterior a la fecha de fin' 
          }, { status: 400 });
        }
        
        fieldsToUpdate.startDate = startDate;
        fieldsToUpdate.endDate = endDate;
      }
    }
    
    // Convertir value a número si se proporciona
    if (fieldsToUpdate.value) {
      fieldsToUpdate.value = parseFloat(fieldsToUpdate.value);
    }
    
    // Actualizar el cupón
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id, 
      { 
        ...fieldsToUpdate,
        updatedAt: new Date()
      }, 
      { 
        new: true, // Devolver el documento actualizado
        runValidators: true // Ejecutar validaciones del esquema
      }
    );
    
    console.log('✅ Cupón actualizado exitosamente:', updatedCoupon._id);
    
    return NextResponse.json({ 
      success: true, 
      coupon: updatedCoupon,
      message: 'Cupón actualizado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error en PUT /api/admin/coupons:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error al actualizar cupón',
      error: error.message 
    }, { status: 500 });
  }
}

// DELETE - Eliminar cupón
export async function DELETE(req) {
  try {
    console.log('🗑️ DELETE /api/admin/coupons - Eliminando cupón...');
    
    // Verificar autenticación admin
    const adminUser = await verifyAdminToken(req);
    if (!adminUser) {
      console.log('❌ Token admin inválido');
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    
    console.log('✅ Admin autenticado:', adminUser.username);
    
    // Obtener ID del cupón desde los query parameters
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    console.log('🗑️ Eliminando cupón ID:', id);
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID del cupón es requerido' 
      }, { status: 400 });
    }
    
    // Conectar a la base de datos
    await connectToDatabase();
    console.log('✅ Conectado a MongoDB');
    
    // Verificar que el cupón existe
    const existingCoupon = await Coupon.findById(id);
    if (!existingCoupon) {
      console.log('❌ Cupón no encontrado:', id);
      return NextResponse.json({ 
        success: false, 
        message: 'Cupón no encontrado' 
      }, { status: 404 });
    }
    
    console.log('📄 Cupón a eliminar:', existingCoupon.code);
    
    // Eliminar el cupón
    await Coupon.findByIdAndDelete(id);
    
    console.log('✅ Cupón eliminado exitosamente:', existingCoupon.code);
    
    return NextResponse.json({ 
      success: true, 
      message: `Cupón ${existingCoupon.code} eliminado exitosamente`
    });
    
  } catch (error) {
    console.error('❌ Error en DELETE /api/admin/coupons:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error al eliminar cupón',
      error: error.message 
    }, { status: 500 });
  }
}