import React from 'react'

const Features = () => {
  return (
    <section className="bg-black text-[16px] md:text-[20px] lg:text-[24px] min-h-[150px] border-t border-b border-[#9A9A9A]">
      <div className="max-w-[1650px] h-full mx-auto flex flex-nowrap overflow-x-auto md:grid md:grid-cols-3 md:overflow-x-hidden snap-x snap-mandatory">
        <div className="min-w-[80vw] md:min-w-0 py-4 px-6 text-center snap-center">
          <p className="min-h-[150px] font-[500] flex items-center justify-center uppercase tracking-wider">
            MÁS DE 5 AÑOS DE EXPERIENCIA
          </p>
        </div>
        <div className="min-w-[80vw] md:min-w-0 py-4 px-6 text-center snap-center">
          <p className="min-h-[150px] font-[500] flex items-center justify-center uppercase tracking-wider">
            EQUIPAMIENTO PROFESIONAL Y AMBIENTE PARA ÉXITO
          </p>
        </div>
        <div className="min-w-[80vw] md:min-w-0 py-4 px-6 text-center snap-center">
          <p className="min-h-[150px] font-[500] flex items-center justify-center uppercase tracking-wider">
            EN COSTA RICA & DISPONIBLE 24/7
          </p>
        </div>
      </div>
    </section>
  );
}

export default Features
