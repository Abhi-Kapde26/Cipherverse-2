import type { Metadata } from "next";
import "./globals.css";
import { AtmosphereProvider } from "@/components/AtmosphereContext";
import AtmosphereBackground from "@/components/AtmosphereBackground";

export const metadata: Metadata = {
  title: "Operation Janus: The Trust Paradox | Hut 99",
  description:
    "Stateless Cold War cryptanalysis mission. Decrypt wartime intercepts, endure 180s moral dilemmas, assemble the Master Key, and survive the Burn Meter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=Special+Elite&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="text-stone-200 min-h-screen relative font-mono antialiased selection:bg-amber-500 selection:text-black">
        <AtmosphereProvider>
          {/* Atmosphere Frosted Glass & Archival Backdrop */}
          <AtmosphereBackground />

          {/* Subtle Scanline Overlay */}
          <div className="fixed inset-0 scanline-overlay pointer-events-none z-30 opacity-40" />

          {/* Subtle Vignette Background */}
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none z-20" />

          <div className="relative z-10 min-h-screen flex flex-col">
            {children}
          </div>
        </AtmosphereProvider>
      </body>
    </html>
  );
}
