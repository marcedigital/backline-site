import { Globe } from "lucide-react";
import Image from "next/image";
import React from "react";

const Salas = () => {
  return (
    <section className="border-l border-r border-[#9A9A9A] max-w-[1650px] mx-auto min-h-screen xl:min-h-auto text-black relative overflow-hidden">
      <div className="flex flex-col md:flex-row h-full">
        {/* Content Section */}
        <div className="w-full md:w-1/2 bg-white p-5 xl:p-8 xl:bg-opacity-90 relative z-20">
          <div className="max-w-xl mx-auto">
            <h2 className="font-moderniz text-[23px] md:text-[25px] lg:text-[51px] font-[900] tracking-tight">
              SALAS DE ENSAYO
            </h2>
            <p className="text-[12px] md:text-[15px] lg:text-[18px] mb-6 leading-relaxed">
              Contamos con dos salas de ensayo totalmente equipadas, pensadas
              para brindarte la mejor calidad de sonido y comodidad. Cada
              espacio ha sido diseñado para que puedas concentrarte únicamente
              en tu música, sin distracciones ni complicaciones.
            </p>
            <h3 className="font-moderniz text-[20px] lg:text-[24px] font-[900] mb-3 xl:mb-6">
              EQUIPAMIENTO
            </h3>
            <div className="space-y-4 text-[12px] md:text-[15px] lg:text-[18px]">
              <div className="border border-[#9A9A9A] rounded-md p-4 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <img src="/icons/current-purple.svg" alt="Checkmark icon" />
                  </div>
                </div>
                <p>Batería PDP Custom Maple / Yamaha Custom Stage</p>
              </div>
              <div className="border border-[#9A9A9A] rounded-md p-4 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <img src="/icons/current-purple.svg" alt="Checkmark icon" />
                  </div>
                </div>
                <p>
                  Amplificadores (VOX AC15 / Boss Katana / Marshall Valvestate)
                </p>
              </div>
              <div className="border border-[#9A9A9A] rounded-md p-4 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <img src="/icons/current-purple.svg" alt="Checkmark icon" />
                  </div>
                </div>
                <p>3 Micrófonos Shure + cables XLR</p>
              </div>
              <div className="border border-[#9A9A9A] rounded-md p-4 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <img src="/icons/current-purple.svg" alt="Checkmark icon" />
                  </div>
                </div>
                <p>Mixer Yamaha MG12 (12 canales)</p>
              </div>
              <div className="border border-[#9A9A9A] rounded-md p-4 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <img src="/icons/current-purple.svg" alt="Checkmark icon" />
                  </div>
                </div>
                <p>Bose L1 para monitoreo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="w-full md:w-1/2 h-[400px] md:h-auto relative">
          <div className="h-full w-full">
            <Image
              src="/images/section-2.png"
              alt="Guitarist performing"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 to-yellow-600/30"></div>
          </div>
          <div className="absolute top-8 right-8 z-10">
            <Globe className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Salas;
