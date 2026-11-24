import type { Metadata } from "next";
import { Fraunces, Inter, Space_Mono } from "next/font/google";
import { CartDrawer } from "@/components/CartDrawer";
import { ContactButton } from "@/components/ContactButton";
import { MobileMenuPanel } from "@/components/MobileMenu";
import { Cursor } from "@/components/Cursor";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Rail } from "@/components/Rail";
import { StoreHydrator } from "@/components/StoreHydrator";
import { Toasts } from "@/components/Toasts";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Tennor & Co. — Leather, carried daily.",
    template: "%s — Tennor & Co.",
  },
  description:
    "Full-grain wallets, key rings and carry goods, hand cut and saddle-stitched in small batches in Dhaka.",
  openGraph: {
    siteName: "Tennor & Co.",
    type: "website",
    locale: "en_BD",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${spaceMono.variable}`}
    >
      <body>
        <Cursor />
        <Rail />
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileMenuPanel />
        <ContactButton />
        <CartDrawer />
        <Toasts />
        <StoreHydrator />
      </body>
    </html>
  );
}
