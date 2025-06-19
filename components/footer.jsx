import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = ({ scrollToSection }) => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-[1650px] border-l border-r border-[#9A9A9A] md:px-10 mx-auto">
        <div className="flex flex-col gap-10 md:flex-row items-center text-center md:text-start md:items-start  space-x-8 py-12 px-6">
          {/* Logo and Description */}
          <div className="w-full flex flex-col  items-center md:items-start md:w-1/3 lg:w-2/5">
            <Image
              src="/images/logo.png"
              alt="Backline Studios Logo"
              width={180}
              height={40}
              className="mb-4"
            />
            <p className="text-[16px] lg:text-[18px] text-gray-400 leading-relaxed">
              Espacio de ensayo 24/7 con autoservicio y equipamiento
              profesional. Reserva, accede y crea sin límites.
            </p>
          </div>

          {/* Information */}
          <div className="w-full md:w-1/3 lg:w-1/5 text-[16px] lg:text-[18px]">
            <h3 className="font-bold text-orange-500  mb-4 uppercase text-[18px] lg:text-[20px] tracking-wide">
              Información
            </h3>
            <ul className="flex flex-col gap-2">
              <a
                href="#Reglamento"
                onClick={(e) => scrollToSection(e, "Reglamento")}
                className=" text-gray-400 hover:text-white transition-colors"
              >
                Reglamento
              </a>
              <a
                href="#Sobre-Nosotros"
                onClick={(e) => scrollToSection(e, "Sobre-Nosotros")}
                className=" text-gray-400 hover:text-white transition-colors"
              >
                Sobre Nosotros
              </a>
              <a
                href="#Tarifas"
                onClick={(e) => scrollToSection(e, "Tarifas")}
                className=" text-gray-400 hover:text-white transition-colors"
              >
                Tarifas
              </a>
              <a
                href="#Servicios"
                onClick={(e) => scrollToSection(e, "Servicios")}
                className=" text-gray-400 hover:text-white transition-colors"
              >
                Servicios
              </a>
            </ul>
          </div>

          {/* Social Media */}
          <div className="lg:w-1/5 hidden lg:block text-[16px] lg:text-[18px]">
            <h3 className="text-orange-500 font-bold mb-4 uppercase text-[18px] lg:text-[20px] tracking-wide">
              Redes Sociales
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="https://www.instagram.com/backlinestudioscr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Instagram
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.facebook.com/backlinestudios/?locale=es_LA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Facebook
                </Link>
              </li>
              <li>
                <Link
                  href="https://ul.waze.com/ul?place=ChIJ9QQLlir9oI8RAGrr5bC2on0&ll=9.9293972,-84.13384620&navigate=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Waze
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:w-1/3 lg:w-1/5 text-[16px] lg:text-[18px]">
            <h3 className=" text-orange-500 font-bold mb-4 uppercase text-[18px] lg:text-[20px] tracking-wide">
              Contacto
            </h3>
            <ul className="space-y-2">
              <li className=" text-gray-400">Correo Electrónico:</li>
              <li className=" text-gray-400">Teléfono: 8340-8304</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright and Social Icons */}
      <div className="border-t border-[#9A9A9A]">
        <div className="max-w-[1650px] mx-auto px-6 py-4 gap-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-center md:text-start text-[16px] lg:text-[18px] text-gray-500">
            © 2025 Backline Studios. Todos los derechos reservados.
          </p>
          <div className="flex gap-3 mb-6">
            <Link
              href="https://www.facebook.com/backlinestudios/?locale=es_LA"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-8 h-8 p-1 rounded-full border border-white flex items-center justify-center"
            >
              <img src="/icons/facebook.svg" alt="Facebook" />
            </Link>
            <Link
              href="https://www.instagram.com/backlinestudioscr/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-8 h-8 p-1 rounded-full border border-white flex items-center justify-center"
            >
              <img src="/icons/instagram.svg" alt="Instagram" />
            </Link>
            <Link
              href="https://ul.waze.com/ul?place=ChIJ9QQLlir9oI8RAGrr5bC2on0&ll=9.9293972,-84.13384620&navigate=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Waze"
              className="w-8 h-8 p-1 rounded-full border border-white flex items-center justify-center"
            >
              <img src="/icons/waze.svg" alt="Waze" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
