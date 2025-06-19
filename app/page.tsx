"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Music,
  Shield,
  Car,
  Globe,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Header from "@/components/header";
import Hero from "@/components/hero";
import Features from "@/components/features";
import History from "@/components/history";
import Footer from "@/components/footer";
import Ahora from "@/components/ahora";
import Regulations from "@/components/regulations";
import Services from "@/components/services";
import Mission from "@/components/mission";
export default function Home() {
  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <Header />
      <main className="bg-black text-white min-h-screen">
        {/* Hero Section */}
        <Hero />
        {/* Features Bar */}
        <Features />
        {/* Nuestra Historia */}
        <History />
        {/* Mission Statement */}
        <Mission />
        {/* Our Services */}
        <Services />
        {/* SALAS DE ENSAYO */}
        
        {/* Regulations Section */}
        <Regulations />
        {/* EMPIEZA AHORA */}
        <Ahora />
        {/* Footer */}
        <Footer scrollToSection={scrollToSection} />
      </main>
    </>
  );
}
