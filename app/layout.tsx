import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Crisis.land — Mapa global de eventos y zonas de riesgo en tiempo real",
  description: "Crisis.land es un mapa interactivo que muestra eventos, conflictos y situaciones críticas en tiempo real, basados en ubicación geográfica.",
  keywords: "crisis, mapa, conflictos, eventos, emergencias, noticias, riesgo, geolocalización",
  robots: "index, follow",
  openGraph: {
    type: "website",
    title: "Crisis.land — Mapa global de crisis en tiempo real",
    description: "Explora eventos, conflictos y situaciones críticas en un mapa interactivo basado en ubicación.",
    url: "https://crisis.land",
    siteName: "Crisis.land",
    images: [
      {
        url: "https://crisis.land/og-image.jpg",
        width: 1200,
        height: 630,
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Crisis.land — Mapa global de crisis en tiempo real",
    description: "Mapa interactivo con eventos y zonas de riesgo en tiempo real.",
    images: ["https://crisis.land/og-image.jpg"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "https://crisis.land"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-GQ4XRB85RT" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GQ4XRB85RT');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
