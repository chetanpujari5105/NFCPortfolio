import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";

import { ThemeSync } from "@/components/ui/theme-toggle";
import { appsLayout } from "@content/apps";
import { buildInitScript } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Expanded-width display face for the name
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const deepLinkApps = Object.keys(appsLayout.titles).filter(
  (id) => id !== "ask" || process.env.NEXT_PUBLIC_ENABLE_ASK === "true",
);

const title = "Chetan Pujari — AI Educator · 400K+ Students · 21+ Platforms";
const description =
  "Chetan Pujari — AI Educator, Bestselling Instructor on 21+ Platforms, 400K+ Students across 190+ Countries. Making AI, Design & Tech simple for everyone.";

export const metadata: Metadata = {
  metadataBase: new URL("https://chetanpujari.com"),
  title,
  description,
  openGraph: {
    title,
    description:
      "AI Educator, Bestselling Instructor on 21+ Platforms, 400K+ Students across 190+ Countries.",
    url: "https://chetanpujari.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description:
      "Making AI, Design & Tech simple for everyone. 400K+ students across 190+ countries.",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#151619" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: buildInitScript(deepLinkApps) }} />
      </head>
      <body className="min-h-full">
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
