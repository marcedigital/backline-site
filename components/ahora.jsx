import React, { useEffect, useState } from "react";

const Ahora = () => {
  const [showCalculator, setShowCalculator] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [calculatorResult, setCalculatorResult] = useState(null);

  // Calculator state
  const [hours, setHours] = useState('');
  const [platillos, setPlatillos] = useState(false);
  const [pedalDoble, setPedalDoble] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [depositConfirmed, setDepositConfirmed] = useState(false);
  const [total, setTotal] = useState(0);

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

  const calculateTotal = () => {
    if (!hours || parseFloat(hours) <= 0) return 0;
    
    const numHours = parseFloat(hours);
    let basePrice = 10000; // Primera hora
    if (numHours > 1) {
      basePrice += (numHours - 1) * 5000; // Horas extra
    }
    
    let extras = 0;
    if (platillos) extras += numHours * 2000;
    if (pedalDoble) extras += numHours * 2000;
    
    const subtotal = basePrice + extras;
    
    // Aquí podrías agregar lógica de cupones más adelante
    // Por ahora solo devolvemos el subtotal
    return subtotal;
  };

  // Recalcular cuando cambien los valores
  React.useEffect(() => {
    setTotal(calculateTotal());
  }, [hours, platillos, pedalDoble, coupon]);

  const handleProceedToBooking = () => {
    if (hours && parseFloat(hours) > 0 && depositConfirmed) {
      setShowCalculator(false);
    }
  };

  const handleConsultOnly = () => {
    setShowCalculator(false);
    setShowDisclaimer(true);
  };

  const handleDisclaimerAccept = () => {
    setShowDisclaimer(false);
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
          {/* EasyWeek Widget */}
          <iframe
            src="https://booking.easyweek.io/backline-studios"
            style={{
              border: "0",
              width: "100%",
              maxWidth: "1800px",
              height: "700px",
              opacity: showCalculator ? 0.3 : 1,
              pointerEvents: showCalculator ? 'none' : 'auto'
            }}
            frameBorder="0"
            referrerPolicy="origin"
            allowFullScreen
          ></iframe>

          {/* Calculator Overlay */}
          {showCalculator && (
            <div className="absolute inset-0 bg-black/15 flex items-center justify-center z-10 p-4">
              <div className="bg-black/70 backdrop-blur-sm border-[0.5px] border-white/70 shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                
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
                        Cantidad de horas: *
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
                    
                    {/* Add-ons */}
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
                            <div className="mb-1">🥁</div>
                            <div>Platillos</div>
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
                            <div className="mb-1">🦶</div>
                            <div>Pedal Doble</div>
                            <div className="text-xs opacity-80">₡2,000/hr</div>
                          </div>
                        </button>
                      </div>
                    </div>
                    
                    {/* Cupón */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Código de cupón (opcional):
                      </label>
                      <input
                        type="text"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="Ingresa tu cupón"
                      />
                    </div>

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
                            ✅ Ya realicé el depósito
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Columna derecha: Factura y acciones */}
                  <div className="flex-1 p-6 bg-none border-[0.5px] border-white/70">
                    
                    {/* Factura */}
                    <div className="bg-gray-800 lg:bg-gray-700 p-4 border border-gray-600 mb-6">
                      <h4 className="font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                        📋 Detalle de la sesión
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
                            
                            <div className="border-t border-gray-600 pt-2 mt-3">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-white">TOTAL</span>
                                <span className="text-xl font-bold text-purple-600">
                                  ₡{total.toLocaleString('es-CR')}
                                </span>
                              </div>
                            </div>
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
                        <h5 className="text-white font-medium mb-2 text-sm">💳 Pago vía SINPE</h5>
                        <p className="text-purple-200 text-sm">
                          Deposita <strong>₡{total.toLocaleString('es-CR')}</strong> al número <strong className="text-purple-300">#####</strong>
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
                            ✅ Ya realicé el depósito
                          </label>
                        </div>
                      </div>
                    )}
                    
                    {/* Botones */}
                    <div className="space-y-3">
                      <button
                        onClick={handleProceedToBooking}
                        disabled={!hours || parseFloat(hours) <= 0 || !depositConfirmed}
                        className={`w-full py-3 px-4 font-bold transition-all ${
                          hours && parseFloat(hours) > 0 && depositConfirmed
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg transform hover:scale-105'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        🚀 Continuar con la reserva
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
        </div>
      </div>
    </div>
  );
};

export default Ahora;