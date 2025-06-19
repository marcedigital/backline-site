"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false); // Close mobile menu after clicking
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="max-w-[1650px] md:px-10 mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link
            href="/"
            className="flex items-center w-[120px] lg:w-[150px] h-auto"
          >
            <Image
              src="/images/logo.png"
              className="w-[150px] h-auto"
              alt="Backline Studios Logo"
              width={120}
              height={40}
            />
          </Link>

          <nav className="hidden text-[14px] lg:text-[16px] md:flex items-center space-x-6">
            <a
              href="#Inicio"
              onClick={(e) => scrollToSection(e, "Inicio")}
              className="text-white hover:text-orange-500 transition-colors"
            >
              Inicio
            </a>
            <a
              href="#Servicios"
              onClick={(e) => scrollToSection(e, "Servicios")}
              className="text-white hover:text-orange-500 transition-colors"
            >
              Servicios
            </a>
            <a
              href="#Reglamento"
              onClick={(e) => scrollToSection(e, "Reglamento")}
              className="text-white hover:text-orange-500 transition-colors"
            >
              Reglamento
            </a>
            <a
              href="#Sobre-Nosotros"
              onClick={(e) => scrollToSection(e, "Sobre-Nosotros")}
              className="text-white hover:text-orange-500 transition-colors"
            >
              Sobre Nosotros
            </a>
            <a
              href="#reservar"
              onClick={(e) => scrollToSection(e, "Tarifas")}
              className="inline-block bg-white hover:bg-transparent border border-white hover:text-white text-[14px] lg:text-[16px] xl:text-[18px] rounded-full px-4 lg:px-6 py-2 lg:py-3 text-sm font-medium transition-all text-black"
            >
              Reservar Ahora
            </a>
          </nav>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Mobile menu */}
        {isMenuOpen && (
          <div
            className={`md:hidden absolute left-0 right-0 bg-black/80 backdrop-blur-sm transition-all duration-300 ease-in-out ${
              isMenuOpen ? "-top-[.35px] opacity-100" : "-top-[500px] opacity-0"
            }`}
          >
            <nav className="container text-center mx-auto px-4 py-6 flex flex-col space-y-8">
              <a
                href="#Inicio"
                onClick={(e) => scrollToSection(e, "Inicio")}
                className="text-white hover:text-orange-500 transition-colors"
              >
                Inicio
              </a>
              <a
                href="#Servicios"
                onClick={(e) => scrollToSection(e, "Servicios")}
                className="text-white hover:text-orange-500 transition-colors"
              >
                Servicios
              </a>
              <a
                href="#Reglamento"
                onClick={(e) => scrollToSection(e, "Reglamento")}
                className="text-white hover:text-orange-500 transition-colors"
              >
                Reglamento
              </a>
              <a
                href="#Sobre-Nosotros"
                onClick={(e) => scrollToSection(e, "Sobre-Nosotros")}
                className="text-white hover:text-orange-500 transition-colors"
              >
                Sobre Nosotros
              </a>
              <a
                href="#reservar"
                onClick={(e) => scrollToSection(e, "Tarifas")}
                className="inline-block bg-white hover:bg-transparent border border-white hover:text-white text-[14px] md:text-[16px] lg:text-[18px] rounded-full px-6 py-3 text-sm font-medium transition-all text-black"
              >
                Reservar Ahora
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
