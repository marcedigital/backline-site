import React from "react";

const Services = () => {
  return (
    <section className="bg-black border-b border-[#9A9A9A]">
      <div className="max-w-[1650px] border-l border-r border-[#9A9A9A] md:px-10 mx-auto  ">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Service 1 */}
          <div className="border-b px-8 md:border-r border-[#9A9A9A] py-10  md:p-8 lg:p-16">
            <div className="mb-10 md:mb-20">
              <div className="w-16 h-16 p-1 rounded-full border border-purple-600 flex items-center justify-center">
                <img src="/icons/car.svg" />
              </div>
            </div>

            <h3 className="font-moderniz lg:text-[32px] font-[900] text-[20px] mb-4">
              PARQUEO
            </h3>
            <p className="text-gray-400 text-[16px] lg:text-[18px] leading-relaxed">
              Contamos con estacionamiento para hasta 30 vehículos, asegurando
              comodidad y facilidad de acceso para todos los músicos y su
              equipo.
            </p>
          </div>

          {/* Service 2 */}
          <div className="border-b md:border-b-0 md:border-r border-[#9A9A9A] py-10 px-8 md:p-8 lg:p-16">
            <div className="mb-10 lg:mb-20">
              <div className="w-16 h-16 p-1 rounded-full border border-purple-600 flex items-center justify-center">
                <img src="/icons/eye.svg" />
              </div>
            </div>

            <h3 className="font-moderniz lg:text-[32px] font-[900] text-[20px] mb-4">
              SEGURIDAD 24/7
            </h3>
            <p className="text-gray-400 text-[16px] lg:text-[18px] leading-relaxed">
              Nuestras instalaciones están monitoreadas con cámaras de
              vigilancia y seguridad privada, para que ensayes sin
              preocupaciones.
            </p>
          </div>

          {/* Service 3 */}
          <div className="py-10 px-8 md:p-8 lg:p-16">
            <div className="mb-10 md:mb-20">
              <div className="w-16 h-16 p-3 rounded-full border border-purple-600 flex items-center justify-center">
                <img src="/icons/scale.svg" />
              </div>
            </div>

            <h3 className="font-moderniz  lg:text-[32px] font-[900] text-[20px] mb-4">
              ESPACIOS
            </h3>
            <p className="text-gray-400 text-[16px] lg:text-[18px] leading-relaxed">
              Cada sala tiene 30m² de espacio, ideal para que bandas y músicos
              individuales ensayen con total libertad y comodidad.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
