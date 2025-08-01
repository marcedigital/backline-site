import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import WhatsAppButton from "@/components/WhatsAppButton";

// Import fonts from local /fonts directory
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";

// Define Montserrat with Google Fonts
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

// Define Moderniz as local font (assuming font files are in /fonts directory)
const moderniz = localFont({
  src: [
    {
      path: "../public/fonts/Moderniz.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-moderniz",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Backline Studios - Tu espacio de ensayo 24/7",
  description:
    "Estudio de ensayo musical profesional disponible 24/7 con el mejor equipamiento para músicos exigentes.",
  generator: "Aurigital",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${montserrat.variable} font-montserrat ${moderniz.variable}`}
      >
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
