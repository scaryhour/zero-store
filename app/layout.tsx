import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { LanguageProvider } from "./context/LanguageContext";
import CartDrawer from "./components/CartDrawer";
import WishlistDrawer from "./components/WishlistDrawer";
import Footer from "./components/Footer";
import SupportBubble from "./components/SupportBubble";
import { AuthProvider } from "./context/AuthContext";

import type { Metadata } from "next";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: {
    default: "ZERO / ARCHIVE - Wearable Engineering",
    template: "%s | ZERO / ARCHIVE"
  },
  description: "Advanced industrial apparel and archive prototypes. Engineered for technical durability and minimal interference.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://zero-store.com',
    siteName: 'ZERO / ARCHIVE',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased font-sans`}>
        <AuthProvider>
          <CartProvider>
            <LanguageProvider>
              <WishlistProvider>
                {children}
                <CartDrawer />
                <WishlistDrawer />
                <Footer />
                <SupportBubble />
              </WishlistProvider>
            </LanguageProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}