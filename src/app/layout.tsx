import type { Metadata, Viewport } from "next";
import { Archivo, Geist } from "next/font/google";

import { ThemeSync } from "@/components/ui/theme-toggle";
import { appsLayout } from "@content/apps";
import { SITE_URL } from "@/lib/site";
import { buildInitScript } from "@/lib/theme";
import "./globals.css";

// The UI face: the only font preloaded. Variable, so every weight is one file.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

// Expanded-width display face for the name and the lock-screen clock: swapped in when it lands
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  preload: false,
});

const deepLinkApps = Object.keys(appsLayout.titles).filter(
  (id) => id !== "ask" || process.env.NEXT_PUBLIC_ENABLE_ASK === "true",
);

const title = "Chetan Pujari — AI Educator · 400K+ Students · 21+ Platforms";
const description =
  "Chetan Pujari — AI Educator, Bestselling Instructor on 21+ Platforms, 400K+ Students across 190+ Countries. Making AI, Design & Tech simple for everyone.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title,
  description,
  openGraph: {
    title,
    description:
      "AI Educator, Bestselling Instructor on 21+ Platforms, 400K+ Students across 190+ Countries.",
    url: "/",
    siteName: "Chetan Pujari",
    type: "website",
  },
  // Installed to the home screen it opens full screen; content already respects the safe areas
  appleWebApp: { capable: true, title: "Chetan", statusBarStyle: "black-translucent" },
  twitter: {
    card: "summary_large_image",
    title,
    description:
      "Making AI, Design & Tech simple for everyone. 400K+ students across 190+ countries.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // The keyboard shrinks the layout (Android), so a focused field and Send stay in view
  interactiveWidget: "resizes-content",
  // Blends the browser bar into the wallpaper's top edge; <Phone> keeps it in step with the screen
  themeColor: "#0b0b0d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${archivo.variable} h-full antialiased`}
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
