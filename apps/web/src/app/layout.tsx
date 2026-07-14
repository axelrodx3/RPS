import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/shell/AppShell";
import { brand } from "@/config/brand";
import { AppProviders } from "@/providers/AppProviders";
import { TutorialGate } from "@/features/tutorial/TutorialGate";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const siteUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.name} — Built for verifiable competition`,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  icons: { icon: brand.assets.favicon },
  openGraph: {
    title: `${brand.name} — Built for verifiable competition`,
    description: brand.description,
    images: [brand.assets.socialPreview],
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#090909",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable}`}>
        <AppProviders>
          <AppShell>{children}</AppShell>
          <TutorialGate />
        </AppProviders>
      </body>
    </html>
  );
}
