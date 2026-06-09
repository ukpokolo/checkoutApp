import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/store/Providers";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout powered by Interswitch",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
