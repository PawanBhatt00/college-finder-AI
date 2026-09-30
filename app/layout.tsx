import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";
import { Navbar } from "@/components/shared/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CollegeFinder AI — Indian Engineering Admission Guidance",
    template: "%s | CollegeFinder AI",
  },
  description:
    "Discover, compare, and predict your admission chances at IITs, NITs, IIITs, and more. Powered by historical JEE cutoff data and AI-driven insights.",
  keywords: ["JEE", "engineering admissions", "IIT", "NIT", "cutoff predictor", "college finder"],
  openGraph: {
    title: "CollegeFinder AI",
    description: "Predict your engineering college admissions with AI-powered cutoff analysis",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
