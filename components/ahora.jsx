'use client';
import React, { useEffect, useState } from "react";

const Ahora = () => {
  const [showCalculator, setShowCalculator] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showPersistentBanner, setShowPersistentBanner] = useState(false);

  // Calculator state
  const [hours, setHours] = useState('');
  const [platillos, setPlatillos] = useState(false);
  const [pedalDoble, setPedalDoble] = useState(false);
  const [coupon, setCoupon] = useState('');
  
  // Estados de imagen - NUEVO: Reemplaza receiptDetail
  const [receiptImage, setReceiptImage] = useState(null);
  const [receiptImagePreview, setReceiptImagePreview] = useState(null);
  const [receiptImageError, setReceiptImageError] = useState('');
  
  const [depositConfirmed, setDepositConfirmed] = useState(false);
  const [total, setTotal] = useState(0);

  // Coupon state - ESTADOS ACTUALIZADOS
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://booking.easyweek.io/widget.js";
    script.async = true;
    script.onload = () => {
      
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup (opcional, por si necesitás destruir widget manualmente)
      const container = document.getElementById("easyweek-widget-container");
      if (container) container.innerHTML = "";
    };
  }, []);

  // FUNCIÓN ACTUALIZADA - Separar subtotal y total
  const calculateSubtotal = () => {
    if (!hours || parseFloat(hours) <= 0) return 0;
    
    const numHours = parseFloat(hours);
    let basePrice = 10000; // Primera hora
    if (numHours > 1) {
      basePrice += (numHours - 1) * 5000; // Horas extra
    }
    
    let extras = 0;
    if (platillos) extras += numHours * 2000;
    if (pedalDoble) extras += numHours * 2000;
    
    return basePrice + extras;
  };

  // NUEVA FUNCIÓN - Calcular descuento ACTUALIZADA PARA INCLUIR HORAS
  const calculateDiscount = (subtotal, coupon, currentHours) => {
    if (!coupon) return 0;
    
    if (coupon.discountType === 'percentage') {
      return Math.round(subtotal * (coupon.value / 100));
    } else if (coupon.discountType === 'fixed') {
      return Math.min(coupon.value, subtotal); // No puede ser mayor al subtotal
    } else if (coupon.discountType === 'hours') {
      // Cupón de horas gratis - calcular descuento basado en las horas del cupón
      const numHours = parseFloat(currentHours) || 0;
      const freeHours = Math.min(coupon.value, numHours);
      
      if (freeHours <= 0) return 0;
      
      // Calcular el costo de las horas gratis
      let hoursDiscount = 0;
      
      if (freeHours <= 1) {
        // Si son 1 hora o menos, descontar proporcionalmente la primera hora
        hoursDiscount = 10000 * freeHours;
      } else {
        // Si son más de 1 hora, descontar primera hora completa + horas adicionales
        hoursDiscount = 10000; // Primera hora
        hoursDiscount += (freeHours - 1) * 5000; // Horas adicionales
      }
      
      // También descontar servicios adicionales proporcionalmente
      if (numHours > 0) {
        const proportionalExtras = (freeHours / numHours);
        
        // Calcular extras actuales
        let currentExtras = 0;
        if (platillos) currentExtras += numHours * 2000;
        if (pedalDoble) currentExtras += numHours * 2000;
        
        const extrasDiscount = Math.round(currentExtras * proportionalExtras);
        hoursDiscount += extrasDiscount;
      }
      
      return Math.min(hoursDiscount, subtotal);
    }
    
    return 0;
  };

  // FUNCIÓN ACTUALIZADA - Calcular total con descuento
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount(subtotal, appliedCoupon, hours);
    return subtotal - discountAmount;
  };

  // NUEVA FUNCIÓN - Validar cupón
  const validateCoupon = async () => {
    if (!coupon.trim()) {
      setCouponMessage('');
      return;
    }

    setCouponValidating(true);
    setCouponMessage('');

    try {
      const response = await fetch(`/api/coupons/validate?code=${encodeURIComponent(coupon.trim())}`);
      const data = await response.json();

      if (data.success) {
        setAppliedCoupon(data.coupon);
        setCouponMessage('✅ Cupón aplicado exitosamente');
      } else {
        setAppliedCoupon(null);
        setCouponMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setAppliedCoupon(null);
      setCouponMessage('❌ Error al validar el cupón');
    } finally {
      setCouponValidating(false);
    }
  };

  // NUEVA FUNCIÓN - Remover cupón
  const removeCoupon = () => {
    setCoupon('');
    setAppliedCoupon(null);
    setCouponMessage('');
    setDiscount(0);
  };

  // NUEVA FUNCIÓN: Manejar upload de imagen
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setReceiptImageError('');
    
    if (!file) {
      setReceiptImage(null);
      setReceiptImagePreview(null);
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setReceiptImageError('Por favor selecciona una imagen válida (JPG, PNG o WebP)');
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setReceiptImageError('La imagen debe ser menor a 5MB');
      return;
    }

    // Convertir a base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setReceiptImage({
        data: base64,
        type: file.type,
        size: file.size,
        name: file.name
      });
      setReceiptImagePreview(base64);
    };
    reader.onerror = () => {
      setReceiptImageError('Error al procesar la imagen');
    };
    reader.readAsDataURL(file);
  };

  // NUEVA FUNCIÓN: Remover imagen
  const removeImage = () => {
    setReceiptImage(null);
    setReceiptImagePreview(null);
    setReceiptImageError('');
    // Reset file input
    const fileInput = document.getElementById('receipt-image-input');
    if (fileInput) fileInput.value = '';
  };

  // EFECTO ACTUALIZADO - Recalcular cuando cambien los valores
  React.useEffect(() => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount(subtotal, appliedCoupon, hours);
    setDiscount(discountAmount);
    setTotal(subtotal - discountAmount);
  }, [hours, platillos, pedalDoble, appliedCoupon]);

  const handleProceedToBooking = async () => {
    if (hours && parseFloat(hours) > 0 && receiptImage && depositConfirmed) {
      try {
        console.log('📝 Creando reserva...');
        
        // Preparar datos de la reserva
        const bookingData = {
          hours: parseFloat(hours),
          services: {
            platillos,
            pedalDoble
          },
          subtotal: calculateSubtotal(),
          discount: discount,
          total: total,
          receiptImage: receiptImage.data, // Base64 de la imagen
          receiptImageType: receiptImage.type,
          receiptImageSize: receiptImage.size,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          appliedCoupon: appliedCoupon
        };
        
        console.log('📋 Datos de reserva:', {
          ...bookingData,
          receiptImage: '[IMAGE_DATA]' // No logear la imagen completa
        });
        
        // Enviar al backend
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bookingData)
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Reserva creada exitosamente:', result.booking.id);
          
          // Mostrar mensaje de éxito (opcional)
          alert('¡Reserva registrada exitosamente! Procede con la reserva en el calendario.');
          
          // Continuar con el flujo original
          setShowCalculator(false);
          setShowPersistentBanner(false);
        } else {
          console.error('❌ Error creando reserva:', result.message);
          alert('Error al registrar la reserva: ' + result.message);
        }
        
      } catch (error) {
        console.error('❌ Error de red:', error);
        alert('Error de conexión. Por favor intenta nuevamente.');
      }
    }
  };

  const handleConsultOnly = () => {
    setShowCalculator(false);
    setShowDisclaimer(true);
  };

  const handleDisclaimerAccept = () => {
    setShowDisclaimer(false);
    setShowPersistentBanner(true);
  };

  const handleBackToCalculator = () => {
    setShowPersistentBanner(false);
    setShowCalculator(true);
  };

  // NUEVA FUNCIÓN - Obtener descripción del descuento
  const getDiscountDescription = (coupon) => {
    if (!coupon) return '';
    
    switch (coupon.discountType) {
      case 'percentage':
        return ` - ${coupon.value}%`;
      case 'fixed':
        return ` - ₡${coupon.value.toLocaleString('es-CR')}`;
      case 'hours':
        return ` - ${coupon.value} hr${coupon.value > 1 ? 's' : ''} gratis`;
      default:
        return '';
    }
  };

  return (
    <div id="Tarifas" className="border-b text-center border-[#9A9A9A] relative">
      <div className="mx-auto py-3 md:py-5 lg:py-8 border-l border-r border-[#9A9A9A] md:px-10 max-w-[1650px] px-4">
        <section className="relative py-6 px-8 flex justify-center items-center">
          <h2 className="font-moderniz text-[24px] md:text-[40px] lg:text-[96px] font-[900] tracking-wider">
            EMPIEZA AHORA
          </h2>
          <img
            src="/icons/expand.svg"
            className="absolute right-0 top-0 hidden md:block h-16 w-16 lg:w-auto lg:h-auto"
            alt=""
          />
        </section>

        <div className="mt-8 w-full flex justify-center relative">
          {/* Banner persistente */}
          {showPersistentBanner && (
            <div className="absolute top-0 left-0 right-0 z-10 bg-yellow-600 border-b-2 border-yellow-500 px-4 py-3">
              <div className="flex items-center justify-between max-w-[1800px] mx-auto">
                <div className="flex items-center text-black">
                  <span className="mr-2">⚠️</span>
                  <span className="font-medium text-sm">
                    <strong>Importante:</strong> Las reservas se confirman únicamente con depósito previo. Las reservas sin comprobante serán canceladas.
                  </span>
                </div>
                <button
                  onClick={handleBackToCalculator}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm font-medium transition-colors ml-4"
                >
                  Calcular sesión
                </button>
              </div>
            </div>
          )}

          {/* EasyWeek Widget */}
          <iframe
            src="https://booking.easyweek.io/backline-studios"
            style={{
              border: "0",
              width: "100%",
              maxWidth: "1800px",
              height: "700px",
              opacity: showCalculator ? 0.3 : 1,
              pointerEvents: showCalculator ? 'none' : 'auto',
              marginTop: showPersistentBanner ? '60px' : '0px'
            }}
            frameBorder="0"
            referrerPolicy="origin"
            allowFullScreen
          ></iframe>

          {/* Calculator Overlay - RESTAURADO AL ORIGINAL */}
          {showCalculator && (
            <div className="absolute inset-0 bg-black/15 flex items-center justify-center z-10 p-4">
              <div className="bg-black/70 backdrop-blur-sm border-[0.5px] border-white/70 shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                
                {/* Agregar Font Awesome */}
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
                
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-xl md:text-2xl font-bold text-center text-white">
                    Calcula tu sesión y aplica tus cupones
                  </h3>
                </div>

                {/* Layout responsivo: vertical en mobile, horizontal en desktop */}
                <div className="flex flex-col lg:flex-row">
                  
                  {/* Columna izquierda: Inputs y configuración */}
                  <div className="flex-1 p-6 lg:border-r border-gray-700">
                    
                    {/* Cantidad de horas */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Cantidad de horas: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="Ej: 2"
                        min="1"
                        step="1"
                        required
                      />
                    </div>
                    
                    {/* Add-ons - RESTAURADO COMO BOTONES */}
                    <div className="mb-6">
                      <h5 className="text-white font-medium mb-3">Servicios adicionales:</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          onClick={() => setPlatillos(!platillos)}
                          className={`p-3 border-2 transition-all text-sm font-medium ${
                            platillos
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'bg-gray-900 border-gray-600 text-gray-300 hover:border-purple-600 hover:text-purple-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className="mb-1">Platillos</div>
                            <div className="text-xs opacity-80">₡2,000/hr</div>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => setPedalDoble(!pedalDoble)}
                          className={`p-3 border-2 transition-all text-sm font-medium ${
                            pedalDoble
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'bg-gray-900 border-gray-600 text-gray-300 hover:border-purple-600 hover:text-purple-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className="mb-1">Pedal Doble</div>
                            <div className="text-xs opacity-80">₡2,000/hr</div>
                          </div>
                        </button>
                      </div>
                    </div>
                    
                    {/* SECCIÓN DE CUPÓN ACTUALIZADA */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Código de cupón (opcional):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={coupon}
                          onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                          onKeyPress={(e) => e.key === 'Enter' && validateCoupon()}
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                          placeholder="DESCUENTO10 o 2HRSFREE"
                          disabled={couponValidating}
                        />
                        {appliedCoupon ? (
                          <button
                            onClick={removeCoupon}
                            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors"
                            title="Remover cupón"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        ) : (
                          <button
                            onClick={validateCoupon}
                            disabled={!coupon.trim() || couponValidating}
                            className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                          >
                            {couponValidating ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              'Aplicar'
                            )}
                          </button>
                        )}
                      </div>
                      
                      {/* Mensaje del cupón */}
                      {couponMessage && (
                        <p className={`text-xs mt-2 ${couponMessage.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                          {couponMessage}
                        </p>
                      )}
                      
                      {/* Mostrar cupón aplicado */}
                      {appliedCoupon && (
                        <div className="mt-2 p-2 bg-green-900/20 border border-green-600/30 rounded text-xs text-green-300">
                          <div className="flex items-center justify-between">
                            <span>
                              <strong>{appliedCoupon.code}</strong>
                              {appliedCoupon.discountType === 'percentage' && ` - ${appliedCoupon.value}%`}
                              {appliedCoupon.discountType === 'fixed' && ` - ₡${appliedCoupon.value.toLocaleString('es-CR')}`}
                              {appliedCoupon.discountType === 'hours' && ` - ${appliedCoupon.value} hr${appliedCoupon.value > 1 ? 's' : ''} gratis`}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NUEVA SECCIÓN: Upload de imagen del comprobante */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Carga tu comprobante: <span className="text-red-500">*</span>
                      </label>
                      
                      {/* Input de archivo */}
                      <div className="mb-3">
                        <input
                          id="receipt-image-input"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageUpload}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent file:mr-4 file:py-1 file:px-3 file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                          required
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Formatos: JPG, PNG, WebP (máx. 5MB)
                        </p>
                      </div>

                      {/* Error de imagen */}
                      {receiptImageError && (
                        <p className="text-red-400 text-xs mb-2">
                          {receiptImageError}
                        </p>
                      )}

                      {/* Preview de imagen */}
                      {receiptImagePreview && (
                        <div className="relative bg-gray-800 border border-gray-600 p-3 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-green-400 text-xs font-medium">
                              ✅ Comprobante cargado
                            </span>
                            <button
                              onClick={removeImage}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Eliminar
                            </button>
                          </div>
                          <div className="relative max-h-32 overflow-hidden border border-gray-600">
                            <img
                              src={receiptImagePreview}
                              alt="Preview del comprobante"
                              className="w-full h-auto object-contain"
                            />
                          </div>
                          {receiptImage && (
                            <p className="text-xs text-gray-400 mt-1">
                              {receiptImage.name} ({(receiptImage.size / 1024).toFixed(1)} KB)
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Botón de WhatsApp */}
                    {total > 0 && (
                      <div className="mb-6">
                        <a
                          href="https://wa.me/50683408304?text=Hola%21%20Este%20es%20el%20comprobante%20de%20pago%20para%20mi%20sesi%C3%B3n%20de%20ensayo"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <i className="fab fa-whatsapp text-lg"></i>
                          Enviar por WhatsApp
                        </a>
                      </div>
                    )}

                    {/* Confirmación de depósito - Solo en mobile */}
                    {total > 0 && (
                      <div className="lg:hidden mb-6">
                        <div className="flex items-center bg-gray-800 p-3 border border-gray-600">
                          <input
                            type="checkbox"
                            id="depositConfirmed-mobile"
                            checked={depositConfirmed}
                            onChange={(e) => setDepositConfirmed(e.target.checked)}
                            className="h-4 w-4 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-600"
                          />
                          <label htmlFor="depositConfirmed-mobile" className="ml-3 text-white text-sm">
                            Ya realicé el depósito
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Columna derecha: Factura y acciones */}
                  <div className="flex-1 p-6 bg-none border-[0.5px] border-white/70">
                    
                    {/* FACTURA ACTUALIZADA CON DESCUENTOS DE HORAS */}
                    <div className="bg-gray-800 lg:bg-gray-700 p-4 border border-gray-600 mb-6">
                      <h4 className="font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                        Detalle de la sesión
                      </h4>
                      
                      {/* Líneas de factura */}
                      <div className="space-y-2 text-sm">
                        {hours && parseFloat(hours) > 0 ? (
                          <>
                            <div className="flex justify-between text-gray-300">
                              <span>Primera hora</span>
                              <span>₡10,000</span>
                            </div>
                            
                            {parseFloat(hours) > 1 && (
                              <div className="flex justify-between text-gray-300">
                                <span>{(parseFloat(hours) - 1)} hrs adicionales</span>
                                <span>₡{((parseFloat(hours) - 1) * 5000).toLocaleString('es-CR')}</span>
                              </div>
                            )}
                            
                            {platillos && (
                              <div className="flex justify-between text-gray-300">
                                <span>Platillos ({parseFloat(hours)} hrs)</span>
                                <span>₡{(parseFloat(hours) * 2000).toLocaleString('es-CR')}</span>
                              </div>
                            )}
                            
                            {pedalDoble && (
                              <div className="flex justify-between text-gray-300">
                                <span>Pedal doble ({parseFloat(hours)} hrs)</span>
                                <span>₡{(parseFloat(hours) * 2000).toLocaleString('es-CR')}</span>
                              </div>
                            )}

                            {/* Mostrar subtotal si hay descuento */}
                            {discount > 0 && (
                              <>
                                <div className="border-t border-gray-600 pt-2 mt-3">
                                  <div className="flex justify-between text-gray-300">
                                    <span>Subtotal</span>
                                    <span>₡{calculateSubtotal().toLocaleString('es-CR')}</span>
                                  </div>
                                  <div className="flex justify-between text-green-400">
                                    <span>
                                      Descuento ({appliedCoupon.code}){getDiscountDescription(appliedCoupon)}
                                    </span>
                                    <span>-₡{discount.toLocaleString('es-CR')}</span>
                                  </div>
                                </div>
                              </>
                            )}
                            
                            <div className="border-t border-gray-600 pt-2 mt-3">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-white">TOTAL</span>
                                <span className="text-xl font-bold text-purple-600">
                                  ₡{total.toLocaleString('es-CR')}
                                </span>
                              </div>
                            </div>

                            {/* Mostrar información adicional para cupones de horas */}
                            {appliedCoupon && appliedCoupon.discountType === 'hours' && (
                              <div className="mt-3 p-2 bg-green-900/20 border border-green-600/30 rounded text-xs text-green-300">
                                <i className="fas fa-info-circle mr-1"></i>
                                Tienes {appliedCoupon.value} hora{appliedCoupon.value > 1 ? 's' : ''} gratis incluida{appliedCoupon.value > 1 ? 's' : ''} en tu sesión
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-gray-400 text-center py-4">
                            Ingresa las horas para ver el detalle
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Instrucciones de pago */}
                    {total > 0 && (
                      <div className="bg-purple-900 bg-opacity-50 border border-purple-600 p-4 mb-6">
                        <h5 className="text-white font-medium mb-2 text-sm">Pago vía SINPE</h5>
                        <p className="text-purple-200 text-sm">
                          Deposita <strong>₡{total.toLocaleString('es-CR')}</strong> al número <strong className="text-purple-300">8340-8304</strong>
                        </p>
                      </div>
                    )}
                    
                    {/* Confirmación - Solo desktop */}
                    {total > 0 && (
                      <div className="hidden lg:block mb-6">
                        <div className="flex items-center bg-gray-800 p-3 border border-gray-600">
                          <input
                            type="checkbox"
                            id="depositConfirmed-desktop"
                            checked={depositConfirmed}
                            onChange={(e) => setDepositConfirmed(e.target.checked)}
                            className="h-4 w-4 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-600"
                          />
                          <label htmlFor="depositConfirmed-desktop" className="ml-3 text-white text-sm">
                            Ya realicé el depósito
                          </label>
                        </div>
                      </div>
                    )}
                    
                    {/* Botones */}
                    <div className="space-y-3">
                      <button
                        onClick={handleProceedToBooking}
                        disabled={!hours || parseFloat(hours) <= 0 || !receiptImage || !depositConfirmed}
                        className={`w-full py-3 px-4 font-bold transition-all ${
                          hours && parseFloat(hours) > 0 && receiptImage && depositConfirmed
                            ? 'bg-gradient-to-r from-cyan-200 to-cyan-300 text-purple-900 hover:from-cyan-300 hover:to-cyan-400 shadow-lg transform hover:scale-105'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Continuar con la reserva
                      </button>
                      
                      <button
                        onClick={handleConsultOnly}
                        className="w-full py-2 text-purple-300 hover:text-purple-200 text-sm transition-colors border-2 border-purple-600 hover:border-purple-400 hover:bg-purple-900 hover:bg-opacity-20"
                      >
                        Solo consultar horarios
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer Popup */}
          {showDisclaimer && (
            <div className="absolute inset-0 bg-black bg-opacity-85 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="bg-black/70 backdrop-blur-sm border-[0.5px] border-white/70 p-8 max-w-md w-full mx-4 shadow-2xl">
                <div className="text-center">
                  <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-yellow-500 bg-opacity-20 flex items-center justify-center mb-4">
                      <span className="text-3xl">⚠️</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">
                      Importante
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Recuerda que <strong className="text-white">las reservas se confirman únicamente con depósito previo</strong>, las reservas sin comprobante de pago serán canceladas.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleDisclaimerAccept}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 font-semibold hover:from-purple-700 hover:to-purple-800 transition-all"
                  >
                    Entiendo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Botón flotante - SOLO cuando está en "Solo consultar horarios" */}
          {showPersistentBanner && (
            <div className="fixed bottom-8 right-8 z-30">
              <button
                onClick={handleBackToCalculator}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all flex items-center gap-2 animate-pulse"
              >
                <i className="fas fa-calculator"></i>
                Calcular Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ahora;