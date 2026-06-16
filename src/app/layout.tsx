import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { AuthProvider } from "@/components/AuthProvider";
import { AppGate } from "@/components/AppGate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mise",
  description: "Your personal recipe collection",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AppGate nav={<Nav />}>
            {children}
          </AppGate>
        </AuthProvider>
      </body>
    </html>
  );
}
