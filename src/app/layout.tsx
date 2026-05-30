import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SportUnlocked - Watch Live Sports",
  description: "Unlock live sports streams from around the world. Football, Basketball, Tennis, F1 and more.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "SportUnlocked" },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "1024x1024" },
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#F59E0B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col" style={{ position: "relative", zIndex: 1 }}>
        <Providers>
          <Navbar />
          <main className="flex-1" style={{ position: "relative", zIndex: 1 }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
