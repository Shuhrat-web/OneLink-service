import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartLink / OneQR Platform",
  description: "Smart redirect platform with QR and analytics",
  // icons: {
  //   icon: [
  //     { url: "/assets/images/favicon.ico" },
  //     { url: "/assets/images/favicon-web-32.png", sizes: "32x32", type: "image/png" },
  //     { url: "/assets/images/favicon-web-16.png", sizes: "16x16", type: "image/png" },
  //   ],
  //   apple: [{ url: "/assets/images/favicon-web-180.png", sizes: "180x180", type: "image/png" }],
  //   shortcut: ["/assets/images/favicon.ico"],
  // },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-50 text-zinc-900">{children}</body>
    </html>
  );
}
