import Image from "next/image";
import React from "react";

const History = () => {
  return (
    <section className="border-l border-r border-[#9A9A9A] max-w-[1650px] mx-auto bg-black text-black relative overflow-hidden">
      <div className="flex flex-col md:flex-row h-full">
        {/* Left side - Image */}
        <div className="w-full md:w-1/2 h-[400px] md:h-auto  relative">
          <div className="absolute top-8 right-8 z-10">
            <img
              src="/icons/arrow.svg"
              className="h-6 w-6 lg:w-8 lg:h-8 text-white"
            />
          </div>
          <div
            className="h-full w-full relative"
            style={{ minHeight: "400px" }}
          >
            <Image
              src="/images/section-1.png"
              alt="Drummer performing"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-teal-900/50 via-purple-900/30 to-transparent"></div>
          </div>
        </div>

        {/* Right side - Content */}
        <div
          id="Sobre-Nosotros"
          className="w-full md:w-1/2 bg-white p-5 xl:p-8"
        >
          <div className="max-w-xl mx-auto">
            <h2 className="font-moderniz text-[23px] md:text-[25px] lg:text-[51px] font-bold tracking-tight">
              NUESTRA HISTORIA
            </h2>
            <p className="text-[12px] md:text-[15px] lg:text-[18px] mb-6 leading-relaxed">
              Backline Studios nació antes de la pandemia, pero durante ella
              evolucionamos para convertimos en un estudio de televisión para
              streaming, podcasts, entre mucho otros. Hoy, volvemos a nuestras
              raíces como una sala de ensayo con un modelo de autoservicio.
            </p>

            <h3 className="text-[20px] lg:text-[24px] font-bold mb-3">
              ¿POR QUÉ NOSOTROS?
            </h3>

            <div className="space-y-4 text-[12px] md:text-[15px] lg:text-[18px]">
              <div className="border border-[#9A9A9A] rounded-md p-4 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <img src="/icons/current.svg" alt="" />
                  </div>
                </div>
                <p>
                  Salas de ensayo operando como un Airbnb (sin personal en
                  sitio)
                </p>
              </div>

              <div className="border border-[#9A9A9A] rounded-md p-4 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <img src="/icons/current.svg" alt="" />
                  </div>
                </div>
                <p>Acceso 24/7 con código de ingreso</p>
              </div>

              <div className="border border-[#9A9A9A] rounded-md p-4 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <img src="/icons/current.svg" alt="" />
                  </div>
                </div>
                <p>Equipamiento profesional para músicos exigentes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default History;
