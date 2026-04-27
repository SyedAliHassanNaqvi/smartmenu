import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4F46E5",
};

export const metadata: Metadata = {
  title: "SmartMenu - AI-Powered Restaurant Ordering",
  description: "Experience intelligent dining with AI recommendations, AR menu exploration, and real-time order tracking",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["restaurant", "menu", "AI", "order", "dining", "AR"],
  authors: [{ name: "SmartMenu Team" }],
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SmartMenu" />
      </head>
      <body className={inter.className}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Disable Service Worker in development to avoid caching issues
              // Enable in production for PWA support
              if ('serviceWorker' in navigator && false) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(err => {
                    console.log('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
