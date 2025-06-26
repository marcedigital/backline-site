import React from 'react'

const Mission = () => {
  return (
    <>
      <section className="  bg-black lg:min-h-[600px] border-t border-b border-[#9A9A9A]">
        <div className="relative py-16 md:px-10 border-l border-r border-[#9A9A9A] max-w-[1650px] mx-auto flex flex-col justify-center items-center">
          <div className=" min-h-[250px] lg:min-h-[600px]  flex flex-col justify-center  px-4 max-w-5xl text-justify">
            <p className="text-center text-white/80 text-[14px] md:text-[22px] lg:text-[40px] leading-relaxed">
              Nuestro objetivo es{" "}
              <span className="font-bold text-white">romper barreras</span> y
              ofrecerte un estudio donde podás enfocarte en lo que realmente
              importa:
              <span className="font-bold text-white">
                {" "}
                hacer música sin preocupaciones
              </span>
              . Tú traes el talento, nosotros el espacio perfecto para que
              <span className="font-bold text-white">
                {" "}
                tu sonido cobre vida
              </span>
              .
            </p>

            <div className="absolute md:px-20 font-moderniz bottom-5 md:bottom-10 lg:bottom-20 md:right-0 left-3 right-3 md:left-0 flex justify-between mt-24">
              <div className="flex items-end gap-2">
                <img src="/icons/lock.svg" />
                <span className="uppercase font-[900] text-[12px] md:text-[15px] lg:text-[20px] tracking-wider">
                  LIBERTAD
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="uppercase font-[900] text-[12px] md:text-[15px] lg:text-[20px] tracking-wider">
                  CREATIVIDAD
                </span>
                <img src="/icons/bulb.svg" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <div
        id="Servicios"
        className="border-t border-b text-center border-[#9A9A9A]"
      >
        <div className=" py-2 md:py-4 lg:py-6 mx-auto md:px-10 border-l border-r border-[#9A9A9A] max-w-[1650px]  px-4">
          <section className="relative  py-6 px-8 flex justify-center items-center">
            <h2 className="font-moderniz text-[20px] md:text-[30px] lg:text-[64px] font-[900] tracking-wider">
              NUESTROS SERVICIOS
            </h2>
            <img
              src="/icons/arrow-down.svg"
              className="absolute md:block right-0 top-0 hidden h-6 w-6 lg:h-8 lg:w-8 "
            />
          </section>
        </div>
      </div>
    </>
  );
}

export default Mission;
