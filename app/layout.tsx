import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";
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
  title: "Drought Tracker",
  description: "2026 home run leaderboard — embrace the power of the plate",
  applicationName: "Drought Tracker",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Drought Tracker",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030303",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {process.env.NODE_ENV !== "production" ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){var h=location.hostname;if(h!=="localhost"&&h!=="127.0.0.1"&&h!=="[::1]")return;if(!("serviceWorker"in navigator))return;navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(x){x.unregister()})});if(window.caches){caches.keys().then(function(k){k.forEach(function(c){caches.delete(c)})})}})();`,
            }}
          />
        ) : null}
      </head>
      <body className="min-h-dvh bg-background font-sans text-foreground">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
