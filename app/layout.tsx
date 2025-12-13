import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "./nprogress.css";
import { Toaster } from "@/components/ui/sonner";
import { ProgressBarProvider } from "@/components/providers/progress-bar-provider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-handdrawn",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const moreSugar = localFont({
  src: [
    {
      path: "../public/font/MoreSugar-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/font/MoreSugar-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Publio - Plateforme d'appels d'offres",
  description:
    "La première plateforme suisse d'appels d'offres équitables et transparents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} ${caveat.variable} ${moreSugar.variable} antialiased`}
      >
        <ProgressBarProvider>{children}</ProgressBarProvider>
        <Toaster />
      </body>
    </html>
  );
}
