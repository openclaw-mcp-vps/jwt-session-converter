import type { Metadata } from "next";
import Script from "next/script";

import { Providers } from "@/app/providers";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jwt-session-converter.dev"),
  title: "jwt-session-converter | Convert JWT auth to secure sessions",
  description:
    "Automate JWT-to-session migration with codebase analysis, secure cookie patterns, and generated server-side session code.",
  openGraph: {
    title: "jwt-session-converter",
    description:
      "A CLI that scans JWT usage and generates safe server-session migration code with CSRF and cookie hardening.",
    type: "website",
    url: "/",
    siteName: "jwt-session-converter"
  },
  twitter: {
    card: "summary_large_image",
    title: "jwt-session-converter",
    description: "Convert localStorage JWT auth to secure sessions before your next SOC2 audit."
  },
  alternates: {
    canonical: "/"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Script src="https://assets.lemonsqueezy.com/lemon.js" strategy="afterInteractive" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
