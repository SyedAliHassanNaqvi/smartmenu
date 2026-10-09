import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RootProvider } from "./providers";
import { NetworkStatus } from "@/components/shared/network-status";

const inter = Inter({ subsets: ["latin"] });

/**
 * Production registers the offline service worker. Development removes any
 * worker and caches left behind, because a cached bundle would hide code
 * changes until a hard reload.
 */
const SERVICE_WORKER_SCRIPT =
  process.env.NODE_ENV === "production"
    ? `if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker
            .register('/sw.js', { updateViaCache: 'none' })
            .catch((err) => console.warn('SW registration failed:', err));
        });
      }`
    : `if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => registration.unregister());
        });
        if ('caches' in window) {
          caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
        }
      }`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4F46E5",
};

export const metadata: Metadata = {
  title: "Vision Dine - AI-Powered Interactive AR Menu",
  description: "Scan, explore dishes in 3D and AR, order and pay from your own phone with Vision Dine.",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["restaurant", "menu", "AI", "order", "dining", "AR"],
  authors: [{ name: "Vision Dine Team" }],
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/favicon.ico" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-arp="">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Vision Dine" />
      </head>
      <body className={inter.className}>
        <RootProvider>
          {children}
        </RootProvider>
        <NetworkStatus />
        <script dangerouslySetInnerHTML={{ __html: SERVICE_WORKER_SCRIPT }} />
      </body>
    </html>
  );
}
