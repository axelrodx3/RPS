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
  applicationName: brand.name,
  title: {
    default: brand.name,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  icons: {
    icon: [
      { url: brand.assets.icon16, sizes: "16x16", type: "image/png" },
      { url: brand.assets.icon32, sizes: "32x32", type: "image/png" },
      { url: brand.assets.icon48, sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: brand.assets.icon180, sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: brand.name,
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
