import Link from "next/link";
import React from "react";

const Hero = () => {
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="Inicio" className="relative h-[90vh] md:h-[80vh] lg:h-screen">
      {/* <div className="absolute inset-0 bg-gradient-to-b from-red-900/70 to-black/80 z-10"></div> */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          src="/hero.mp4"
          alt="Musician performing"
          className="w-full h-full object-cover opacity-70"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
      <div className="relative flex flex-col items-center pt-40 text-center md:items-start md:text-start top-24 md:px-10 gap-2 z-20 max-w-[1650px] mx-auto px-4 md:pt-24 lg:pt-40">
        <div className="flex gap-3 mb-6">
          <Link
            href="https://www.facebook.com/backlinestudios/?locale=es_LA"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="p-1 rounded-full h-10 lg:h-auto lg:w-auto w-10 border-2 border-white flex items-center justify-center"
          >
            <img src="/icons/facebook.svg" alt="Facebook" />
          </Link>
          <Link
            href="https://www.instagram.com/backlinestudioscr/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="p-1 rounded-full border-2 h-10 lg:h-auto lg:w-auto w-10 border-white flex items-center justify-center"
          >
            <img src="/icons/instagram.svg" alt="Instagram" />
          </Link>
          <Link
            href="https://ul.waze.com/ul?place=ChIJ9QQLlir9oI8RAGrr5bC2on0&ll=9.9293972,-84.13384620&navigate=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Waze"
            className="p-1 rounded-full border-2 h-10 lg:h-auto lg:w-auto w-10 border-white flex items-center justify-center"
          >
            <img src="/icons/waze.svg" alt="Waze" />
          </Link>
        </div>

        <h1 className="text-[32px] md:text-[40px] leading-[35px] md:leading-[46px] lg:leading-[66px] lg:text-[64px] font-[900] font-moderniz mb-4">
          TU ESPACIO DE
          <br />
          ENSAYO 24/7
        </h1>
        <p className="max-w-md text-[14px] md:text-[15px] lg:text-[18px] mb-8">
          Bienvenido a tu estudio de música, donde podés practicar en un
          ambiente profesional y confortable con el mejor equipamiento.
        </p>
        <a
          href="#reservar"
          onClick={(e) => scrollToSection(e, "Tarifas")}
          className="inline-block bg-[#40F03F] hover:bg-transparent hover:border hover:border-white hover:text-white text-[14px] md:text-[15px] lg:text-[18px] rounded-full px-6 py-4 text-sm font-semibold transition-all text-black"
        >
          Reservar espacio
        </a>
      </div>
    </section>
  );
};

export default Hero;