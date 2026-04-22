import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jwt-session-converter.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JWT Session Converter | Stop localStorage token risk",
    template: "%s | JWT Session Converter"
  },
  description:
    "Upload your codebase, detect JWT anti-patterns, and download a secure session-based migration with CSRF protection in minutes.",
  keywords: [
    "JWT migration",
    "session authentication",
    "SOC 2 remediation",
    "developer security tool",
    "XSS token storage"
  ],
  openGraph: {
    title: "JWT Session Converter",
    description:
      "Convert JWT auth to secure server-side sessions with automated code analysis and migration scaffolding.",
    url: siteUrl,
    siteName: "JWT Session Converter",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "JWT Session Converter",
    description:
      "Find localStorage JWT risks and generate secure session migration code before your next security audit."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0d1117] text-[#e6edf3] antialiased">{children}</body>
    </html>
  );
}
