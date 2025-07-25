import Image from "next/image";
import React from "react";

const Regulations = () => {
  return (
    <>
      <div id="Reglamento" className="border-t text-center border-[#9A9A9A]">
        <div className=" mx-auto py-2 md:py-4 lg:py-6 md:px-10 border-l border-r border-[#9A9A9A] max-w-[1650px]  px-4">
          <section className="relative py-6 px-8 flex justify-center items-center">
            <h2 className="font-moderniz text-[20px] md:text-[30px] lg:text-[64px] font-[900] tracking-wider">
              REGLAMENTO
            </h2>
            <img
              src="/icons/alert.svg"
              className="absolute right-0 top-0 hidden md:block h-12 w-12 lg:h-16 lg:w-16"
            />
          </section>
        </div>
      </div>
      <div className=" border-t border-b border-[#9A9A9A]">
        <section className=" md:px-10 border-l border-r border-[#9A9A9A] min-h-[500px] max-w-[1650px] mx-auto  bg-black ">
          <div className="flex flex-col min-h-full">
            <div className="flex flex-col md:flex-row flex-1 ">
              {/* Left side - Image */}
              <div className="md:w-1/2 relative border-r border-gray-800">
                <div className="relative h-[400px] md:h-full">
                  <Image
                    src="/images/section-3.png"
                    alt="Band performing"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-yellow-900/30"></div>

                  {/* Music note icon */}
                  <div className="absolute top-4 right-4">
                    <img
                      src="/icons/music.svg"
                      className="w-8 h-8 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Right side - Rules */}
              <div className="md:w-1/2 p-3 lg:p-6 flex flex-col justify-center">
                <div className="space-y-3 text-[16px] md:text-[14px] lg:text-[18px]">
                  <div className="border border-[#9A9A9A] p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-500 font-bold">[01]</span>
                      <p className="">
                        Dejá los cables y micrófonos en su caja.
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#9A9A9A] p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-500 font-bold">[02]</span>
                      <p className="">Acomodá los pedestales y equipos.</p>
                    </div>
                  </div>


                  <div className="border border-[#9A9A9A] p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-500 font-bold">[03]</span>
                      <p className="">No dejés basura dentro de las salas.</p>
                    </div>
                  </div>

                  <div className="border border-[#9A9A9A] p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-500 font-bold">[04]</span>
                      <p className="">
                        Asegurate de cerrar la puerta al salir. Presionar el
                        botón de candado para bloquear.
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#9A9A9A] p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-500 font-bold">[05]</span>
                      <p className="">
                        Si tenés problemas, contactá al guardia en turno o a
                        Andrés Bustamante.
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#9A9A9A] p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-500 font-bold">[06]</span>
                      <p className="">
                        Si cancelás tu ensayo con menos de 24 horas de 
                        anticipación, tenés que pagar la tarifa completa.
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#9A9A9A] p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-500 font-bold">[07]</span>
                      <p className="">
                        Si no llegás a tu ensayo después de confirmar 
                        tu reserva, tenés que pagar la tarifa completa.
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#9A9A9A] p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-500 font-bold">[08]</span>
                      <p className="">
                        Para casos especiales de cancelación, contactanos 
                        únicamente por WhatsApp.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Regulations;
