import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { NotOnLogin } from "@/components/not-on-login";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { getSetNames } from "@/lib/collection";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ash's Card Album",
  description: "Ash's Pokémon TCG card album",
};

export default function RootLayout({ children, modal }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* usePathname is dynamic on dynamic routes; the fallback keeps the header in their shell. */}
        <Suspense fallback={<SiteHeader />}>
          <NotOnLogin>
            <SiteHeader />
          </NotOnLogin>
        </Suspense>
        {children}
        {modal}
        <Suspense>
          <NotOnLogin>
            <KeyboardShortcuts sets={getSetNames()} />
          </NotOnLogin>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
