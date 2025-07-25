'use client';
import React, { useEffect, useState } from "react";

const Ahora = () => {
  const [showCalculator, setShowCalculator] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showPersistentBanner, setShowPersistentBanner] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false); // NUEVO
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para prevenir múltiples envíos

  // Calculator state
  const [hours, setHours] = useState('');
  const [platillos, setPlatillos] = useState(false);
  const [pedalDoble, setPedalDoble] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  
  // Estados de imagen - NUEVO: Reemplaza receiptDetail
  const [receiptImage, setReceiptImage] = useState(null);
  const [receiptImagePreview, setReceiptImagePreview] = useState(null);
  const [receiptImageError, setReceiptImageError] = useState('');
  
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
      basePrice += (numHours - 1) * 8000; // Horas adicionales
    }
    
    let serviceCost = 0;
    if (platillos) serviceCost += 2000;
    if (pedalDoble) serviceCost += 2000;
    
    return basePrice + serviceCost;
  };

  // FUNCIÓN ACTUALIZADA - Calcular descuento incluyendo horas gratis
  const calculateDiscount = (subtotal, appliedCoupon, hours) => {
    if (!appliedCoupon || !hours || parseFloat(hours) <= 0) return 0;
    
    const numHours = parseFloat(hours);
    
    if (appliedCoupon.discountType === 'percentage') {
      return subtotal * (appliedCoupon.value / 100);
    } 
    
    if (appliedCoupon.discountType === 'fixed') {
      return Math.min(appliedCoupon.value, subtotal);
    }
    
    // NUEVO: Manejo para cupones de horas gratis
    if (appliedCoupon.discountType === 'hours') {
      const freeHours = appliedCoupon.value;
      
      // Calcular descuento basado en horas gratuitas
      let hoursDiscount = 0;
      
      if (freeHours >= numHours) {
        // Las horas gratis cubren toda la sesión
        hoursDiscount = 10000; // Primera hora gratis
        if (numHours > 1) {
          hoursDiscount += Math.min(freeHours - 1, numHours - 1) * 8000;
        }
      } else {
        // Las horas gratis cubren parcialmente
        hoursDiscount = 10000; // Primera hora gratis
        if (freeHours > 1) {
          hoursDiscount += (freeHours - 1) * 8000; // Horas adicionales gratis
        }
      }
      
      // No puede ser mayor al subtotal
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
      setReceiptImageError('Por favor seleccioná una imagen válida (JPG, PNG o WebP)');
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
    if (hours && parseFloat(hours) > 0 && reservationDate && receiptImage && !isSubmitting) {
      setIsSubmitting(true);
      
      try {
        console.log('📝 Creando reserva...');
        
        // Preparar datos de la reserva
        const bookingData = {
          hours: parseFloat(hours),
          reservationDate: reservationDate,
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
          
          // Mostrar modal de éxito personalizado
          setShowSuccessModal(true);
          
        } else {
          console.error('❌ Error creando reserva:', result.message);
          alert('Error al registrar la reserva: ' + result.message);
        }
        
      } catch (error) {
        console.error('❌ Error de red:', error);
        alert('Error de conexión. Por favor intenta nuevamente.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleConsultOnly = () => {
    setShowCalculator(false);
    setShowDisclaimer(true);
    
    // Scroll to the Easy div
    setTimeout(() => {
      const easyElement = document.getElementById('Easy');
      if (easyElement) {
        easyElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100); // Small delay to ensure state updates are processed
  };

  // FUNCIÓN ACTUALIZADA - Disclaimer con timer
  const handleDisclaimerAccept = () => {
    setShowDisclaimer(false);
    setShowPersistentBanner(true);
    setShowContinueButton(false);
    
    // Mostrar botón "Continuar con el pago" después de 6 segundos
    setTimeout(() => {
      setShowContinueButton(true);
    }, 10000);
  };

  const handleBackToCalculator = () => {
    setShowPersistentBanner(false);
    setShowCalculator(true);
    setShowContinueButton(false);
  };

  const handleReloadWidget = () => {
    // Encontrar el iframe de EasyWeek y recargarlo
    const iframe = document.querySelector('iframe[src*="booking.easyweek.io"]');
    if (iframe) {
      // Recargar el iframe cambiando su src temporalmente
      const originalSrc = iframe.src;
      iframe.src = 'about:blank';
      setTimeout(() => {
        iframe.src = originalSrc;
      }, 100);
    }
    
    // Resetear el estado del botón de continuar
    setShowContinueButton(false);
    
    // Volver a mostrar el botón después del timeout habitual
    setTimeout(() => {
      setShowContinueButton(true);
    }, 10000);
  };

  const handleSuccessModalContinue = () => {
    setShowSuccessModal(false);
    setShowCalculator(false);
    setShowPersistentBanner(false);
  };

  // Funciones para el popup flotante de EasyWeek
  const openEasyWeekPopup = () => {
    setShowEasyWeekPopup(true);
    setShowEasyWeekDisclaimer(true);
    setShowContinueReservation(false);
  };

  const closeEasyWeekPopup = () => {
    setShowEasyWeekPopup(false);
    setShowEasyWeekDisclaimer(false);
    setShowContinueReservation(false);
  };

  const handleEasyWeekDisclaimerAccept = () => {
    setShowEasyWeekDisclaimer(false);
    setTimeout(() => {
      setShowContinueReservation(true);
    }, 6000);
  };

  const handleContinueReservation = () => {
    closeEasyWeekPopup();
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
      {/* Importar Font Awesome a nivel global del componente */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      
      <div className="mx-auto py-24 md:py-16 lg:py-24 border-l border-r border-[#9A9A9A] md:px-10 max-w-[1650px] px-4">
        <section className="relative py-16 px-8 flex justify-center items-center">
          <h2 className="font-moderniz text-[23px] md:text-[38px] lg:text-[92px] font-[900] tracking-wider">
            EMPEZAR AHORA
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
                  <span className="mr-2">💡</span>
                  <span className="font-medium text-sm">
                    <strong>Importante:</strong> Las reservas se confirman únicamente con depósito previo.
                    Las reservas sin comprobante serán eliminadas.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Container del widget con botón integrado */}
          <div className="relative w-full max-w-[1800px]">
            {/* EasyWeek Widget - ANCHO LIMITADO A 750px EN MODO CONSULTA */}
            <div 
              id="Easy"
              className="mx-auto"
              style={{
                maxWidth: showPersistentBanner ? '750px' : '100%',
                transition: 'max-width 0.3s ease'
              }}
            >
              <iframe
                src="https://booking.easyweek.io/backline-studios"
                style={{
                  border: "0",
                  width: "100%",
                  height: "680px",
                  opacity: showCalculator ? 0.3 : 1,
                  pointerEvents: showCalculator ? 'none' : 'auto',
                  marginTop: showPersistentBanner ? '65px' : '0px',
                  boxSizing: 'border-box',
                  display: 'block'
                }}
                className="transition-opacity duration-300"
              />
            </div>
            
            {/* Botones integrados - ANCHO COMPLETO DEL WIDGET CON MAX-WIDTH */}
            {showPersistentBanner && showContinueButton && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-20 w-full" style={{ maxWidth: '750px' }}>
                <div className="flex gap-0">
                  {/* Botón de reload */}
                  <button
                    onClick={handleReloadWidget}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white py-10 px-6 font-bold text-lg shadow-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center animate-fade-in-up"
                    style={{ 
                      borderRadius: '0px',
                      animation: 'fadeInUp 0.5s ease-out',
                      width: '120px' // Botón más ancho
                    }}
                    title="Recargar widget"
                  >
                    <span className="text-white text-lg">←</span>
                  </button>
                  
                  {/* Botón principal de continuar con el pago */}
                  <button
                    onClick={handleBackToCalculator}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-10 px-6 font-bold text-lg shadow-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center justify-center gap-3 animate-fade-in-up"
                    style={{ 
                      borderRadius: '0px',
                      animation: 'fadeInUp 0.5s ease-out'
                    }}
                  >
                    <i className="fas fa-credit-card text-lg"></i>
                    <span>Continuar con el pago</span>
                  </button>
                </div>
                
                {/* Keyframes CSS para la animación */}
                <style jsx>{`
                  @keyframes fadeInUp {
                    from {
                      opacity: 0;
                      transform: translateY(20px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                  
                  .animate-fade-in-up {
                    animation: fadeInUp 0.5s ease-out;
                  }
                `}</style>
              </div>
            )}
          </div>

          {/* Calculator Overlay */}
          {showCalculator && (
            <div className="absolute inset-0 bg-black/15 flex items-center justify-center z-10 md:p-4">
              <div className="bg-black/70 backdrop-blur-sm border-[0.5px] border-white/70 shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                
                {/* Agregar Font Awesome */}
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
                
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-xl md:text-2xl font-bold text-center text-white">
                    Calculá tu sesión y aplicá tus cupones
                  </h3>
                </div>

                {/* Layout responsivo: vertical en mobile, horizontal en desktop */}
                <div className="flex flex-col lg:flex-row">
                  
                  {/* Columna izquierda: Inputs y configuración */}
                  <div className="flex-1 p-6 lg:border-r border-gray-700">
                    
                    {/* Paso a paso visual */}
                    <div className="mb-6 bg-gray-800/50 border border-gray-600 p-4">
                      <h4 className="text-white font-medium mb-3 text-center text-sm">Proceso de reserva</h4>
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 border-2 border-green-500 bg-transparent text-green-500 flex items-center justify-center font-bold text-xs rounded-full">1</div>
                          <span className="text-gray-300 text-start">Consultá horarios disponibles</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 border-2 border-green-500 bg-transparent text-green-500 flex items-center justify-center font-bold text-xs rounded-full">2</div>
                          <span className="text-gray-300 text-start">Calculá costos y envía comprobante</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 border-2 border-green-500 bg-transparent text-green-500 flex items-center justify-center font-bold text-xs rounded-full">3</div>
                          <span className="text-gray-300 text-start">Seleccioná tu horario</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 border-2 border-green-500 bg-transparent text-green-500 flex items-center justify-center font-bold text-xs rounded-full">4</div>
                          <span className="text-gray-300 text-start">Llená el formulario y reservá!</span>
                        </div>
                      </div>
                    </div>

                    {/* Botón "Solo consultar horarios" */}
                    <div className="mb-6">
                      <button
                        onClick={handleConsultOnly}
                        className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-calendar-alt text-sm"></i>
                        Solo consultar horarios
                      </button>
                    </div>

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

                    {/* Fecha de la reserva */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Fecha de la reserva: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={reservationDate}
                        onChange={(e) => setReservationDate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        💡 Así vinculamos tu depósito con tu reserva
                      </p>
                    </div>
                    
                    {/* Add-ons */}
                    <div className="mb-6">
                      <h5 className="text-white font-medium mb-3">Servicios adicionales:</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          onClick={() => setPlatillos(!platillos)}
                          className={`p-3 border-2 transition-all text-sm font-medium ${
                            platillos
                              ? 'bg-purple-600/20 border-purple-600 text-purple-300'
                              : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>Platillos {platillos ? '✓' : ''}</span>
                            <span className="text-xs">+₡2,000</span>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => setPedalDoble(!pedalDoble)}
                          className={`p-3 border-2 transition-all text-sm font-medium ${
                            pedalDoble
                              ? 'bg-purple-600/20 border-purple-600 text-purple-300'
                              : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>Pedal doble {pedalDoble ? '✓' : ''}</span>
                            <span className="text-xs">+₡2,000</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Sección de cupones */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Código de cupón (opcional):
                      </label>
                      <div className="flex flex-col md:flex-row gap-2">
                        <input
                          type="text"
                          value={coupon}
                          onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent placeholder-gray-400"
                          placeholder="Ej: PRIMERA20"
                          disabled={couponValidating}
                        />
                        <button
                          onClick={validateCoupon}
                          disabled={!coupon.trim() || couponValidating}
                          className={`px-4 py-2 font-medium transition-colors ${
                            couponValidating
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : coupon.trim()
                              ? 'bg-purple-600 hover:bg-purple-700 text-white'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {couponValidating ? '...' : 'Aplicar'}
                        </button>
                      </div>
                      
                      {/* Mensaje de cupón */}
                      {couponMessage && (
                        <p className={`text-xs mt-2 ${
                          couponMessage.startsWith('✅') ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {couponMessage}
                        </p>
                      )}
                      
                      {/* Cupón aplicado */}
                      {appliedCoupon && (
                        <div className="mt-3 p-3 bg-green-600/20 border border-green-600/50">
                          <div className="flex items-center justify-between">
                            <span className="text-green-300 text-sm font-medium">
                              ✅ {appliedCoupon.code}{getDiscountDescription(appliedCoupon)}
                            </span>
                            <button
                              onClick={removeCoupon}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              Remover
                            </button>
                          </div>
                          {appliedCoupon.discountType === 'hours' && (
                            <span className="text-green-400 text-xs block mt-1">
                              {appliedCoupon.value} hr{appliedCoupon.value > 1 ? 's' : ''} gratis
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Columna derecha: Factura y acciones */}
                  <div className="flex-1 p-6 bg-none border-[0.5px] border-white/70">
                    
                    {/* Factura */}
                    <div className="bg-gray-800 lg:bg-gray-700 p-4 border border-gray-600 mb-6">
                      <h4 className="font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                        Detalle de la sesión
                      </h4>
                      
                      {/* Líneas de factura */}
                      <div className="space-y-2 text-sm">
                        {hours && parseFloat(hours) > 0 ? (
                          <>
                            {/* Primera hora */}
                            <div className="flex justify-between">
                              <span className="text-gray-300">Primera hora de ensayo</span>
                              <span className="text-white">₡10,000</span>
                            </div>
                            
                            {/* Horas adicionales */}
                            {parseFloat(hours) > 1 && (
                              <div className="flex justify-between">
                                <span className="text-gray-300">
                                  {parseFloat(hours) - 1} hora{parseFloat(hours) - 1 !== 1 ? 's' : ''} adicional{parseFloat(hours) - 1 !== 1 ? 'es' : ''} (₡8,000 c/u)
                                </span>
                                <span className="text-white">
                                  ₡{((parseFloat(hours) - 1) * 8000).toLocaleString('es-CR')}
                                </span>
                              </div>
                            )}
                            
                            {/* Servicios adicionales */}
                            {platillos && (
                              <div className="flex justify-between">
                                <span className="text-gray-300">Platillos</span>
                                <span className="text-white">₡2,000</span>
                              </div>
                            )}
                            
                            {pedalDoble && (
                              <div className="flex justify-between">
                                <span className="text-gray-300">Pedal doble</span>
                                <span className="text-white">₡2,000</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-gray-400 text-center py-4">
                            Ingresa las horas para calcular
                          </div>
                        )}
                      </div>
                      
                      {/* Subtotal */}
                      {hours && parseFloat(hours) > 0 && (
                        <>
                          <div className="border-t border-gray-600 mt-4 pt-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-300">Subtotal</span>
                              <span className="text-white">₡{calculateSubtotal().toLocaleString('es-CR')}</span>
                            </div>
                          </div>
                          
                          {/* Descuento */}
                          {discount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-green-400">
                                Descuento {appliedCoupon ? `(${appliedCoupon.code})` : ''}
                              </span>
                              <span className="text-green-400">-₡{discount.toLocaleString('es-CR')}</span>
                            </div>
                          )}
                          
                          {/* Total */}
                          <div className="border-t border-gray-600 mt-3 pt-3">
                            <div className="flex justify-between text-lg font-semibold">
                              <span className="text-white">Total</span>
                              <span className="text-white">₡{total.toLocaleString('es-CR')}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Instrucciones de pago SINPE */}
                    {total > 0 && (
                      <div className="bg-purple-900/50 border border-purple-600 p-4 mb-6">
                        <h5 className="text-white font-medium mb-2 text-center">Pago vía SINPE</h5>
                        <p className="text-purple-200 text-center">
                          Deposita <strong className="text-white">₡{total.toLocaleString('es-CR')}</strong> al número{' '}
                          <strong className="text-purple-300">8340-8304</strong>
                        </p>
                      </div>
                    )}

                    {/* Campo de carga de comprobante */}
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

                    {/* Botones de acción */}
                    <div className="space-y-3">
                      <button
                        onClick={handleProceedToBooking}
                        disabled={!hours || parseFloat(hours) <= 0 || !reservationDate || !receiptImage || isSubmitting}
                        className={`w-full py-4 px-6 font-bold text-lg transition-all ${
                          hours && parseFloat(hours) > 0 && reservationDate && receiptImage && !isSubmitting
                            ? 'bg-gradient-to-r from-cyan-200 to-cyan-300 text-purple-900 hover:from-cyan-300 hover:to-cyan-400 shadow-lg transform hover:scale-105'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isSubmitting ? 'Procesando...' : 'Continuar con la reserva'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="absolute inset-0 bg-black bg-opacity-85 backdrop-blur-sm flex items-center justify-center z-30">
              <div className="bg-black/70 backdrop-blur-sm border-[0.5px] border-white/70 p-8 max-w-lg w-full mx-4 shadow-2xl">
                <div className="text-center">
                  <div className="mb-6">
                    <div className="mx-auto w-20 h-20 bg-green-500 bg-opacity-20 flex items-center justify-center mb-6">
                      <span className="text-4xl">✅</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      ¡Gracias por completar el pago!
                    </h3>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      Ahora podés <strong className="text-white">continuar con el proceso de reserva</strong>.
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                      Seleccioná la sala y el horario que te convengan según la cantidad de horas que adquiriste y completá el formulario final para reservar tu espacio.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleSuccessModalContinue}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg transform hover:scale-105"
                  >
                    Continuar al calendario
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer Popup - MENSAJE ACTUALIZADO */}
          {showDisclaimer && (
            <div className="absolute inset-0 bg-black bg-opacity-85 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="bg-black/70 backdrop-blur-sm border-[0.5px] border-white/70 p-8 max-w-md w-full mx-4 shadow-2xl">
                <div className="text-center">
                  <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-blue-500 bg-opacity-20 flex items-center justify-center mb-4">
                      <span className="text-3xl">📅</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">
                      Consulta de Horarios
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Esta ventana es para que podás <strong className="text-white">consultar los horarios disponibles solamente</strong>. Una vez sepás la cantidad de horas que necesitás, iniciá al proceso de reserva en la página principal.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleDisclaimerAccept}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ahora;