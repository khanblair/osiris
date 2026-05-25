import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://nira-intel.vercel.app";
const SITE_NAME = "NIRA-INTEL";
const SITE_TITLE = "NIRA-INTEL — Uganda Civil Registration Intelligence Dashboard";
const SITE_DESCRIPTION = "Uganda Civil Registration Intelligence Platform for NIRA. Monitor NID coverage, birth, death and marriage registration rates across all 57 districts. Identify underserved communities, prioritise mobile registration drives, and track CRVS performance in real-time.";

export const viewport: Viewport = {
  themeColor: "#1B3A6B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | OSIRIS Intelligence",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "NIRA Uganda", "civil registration Uganda", "CRVS Uganda",
    "NID coverage", "birth registration Uganda", "death registration",
    "marriage registration", "Uganda districts", "registration intelligence",
    "NIRA dashboard", "Uganda government", "Ministry of ICT Uganda",
    "civil registration intelligence", "geospatial dashboard Uganda",
    "district coverage map", "mobile registration teams",
  ],
  authors: [{ name: "NIRA-INTEL Project", url: SITE_URL }],
  creator: "NIRA-INTEL",
  publisher: "NIRA-INTEL",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/android-chrome-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/android-chrome-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/apple-touch-icon.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "NIRA-INTEL — Uganda Civil Registration Intelligence Dashboard",
    description: "Monitor NID coverage, birth, death and marriage registration across 57 Uganda districts. Real-time CRVS intelligence for NIRA Uganda.",
    type: "website",
    siteName: SITE_NAME,
    locale: "en_UG",
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "NIRA-INTEL Uganda Civil Registration Intelligence Dashboard",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NIRA-INTEL — Uganda Civil Registration Intelligence",
    description: "Monitor NID coverage and birth/death/marriage registration across 57 Uganda districts. Real-time CRVS dashboard for NIRA Uganda.",
    creator: "@NIRAUganda",
    site: "@NIRAUganda",
    images: [`${SITE_URL}/og-image.png`],
  },
  category: "technology",
  classification: "Intelligence & Security",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "NIRA-INTEL",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#1B3A6B",
    "msapplication-config": "none",
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "NIRA-INTEL — Uganda Civil Registration Intelligence",
  alternateName: ["NIRA-INTEL", "NIRA Dashboard", "Uganda CRVS Dashboard"],
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "GovernmentApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires a modern web browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "UGX",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "NID coverage map across 57 Uganda districts",
    "Birth registration rate by district",
    "Death registration completeness tracking",
    "Marriage registration rate monitoring",
    "Priority ranking for mobile registration drive deployment",
    "WHO AFRO disease outbreak alerts affecting registration",
    "UNHCR refugee settlement mapping",
    "District-level intel panel with trend analysis",
    "NIRA alerts feed (critical, warning, info)",
    "Registration centre locations",
    "Interactive CartoDB Positron map",
    "Coverage scale: red (0%) to green (100%)",
  ],
  screenshot: `${SITE_URL}/og-image.png`,
  author: {
    "@type": "Organization",
    name: "NIRA Uganda",
    url: "https://nira.go.ug",
  },
};

import { Analytics } from "@vercel/analytics/next";

import ErrorBoundary from '@/components/ErrorBoundary';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="canonical" href={SITE_URL} />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <ErrorBoundary name="NIRA-INTEL Core">
          {children}
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
