import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Celerey Financial Dashboard",
    template: "%s • Celerey Financial Dashboard",
  },
  description:
    "Celerey Financial Dashboard provides clients with a clear overview of their financial health, assets, and long-term goals. Track your progress, monitor key metrics, and stay aligned with your financial plan.",
  applicationName: "Celerey Financial Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="antialiased">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
