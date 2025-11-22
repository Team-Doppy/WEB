import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "./components/Sidebar";
import { MobileNav } from "./components/MobileNav";
import { AuthProvider } from "./contexts/AuthContext";
import { SearchProvider } from "./contexts/SearchContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Doppy",
  description: "모두 다 같은 친구는 아니니까",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Doppy",
    description: "모두 다 같은 친구는 아니니까",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Doppy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Doppy",
    description: "모두 다 같은 친구는 아니니까",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        <AuthProvider>
          <SearchProvider>
            <Sidebar />
            <MobileNav />
            {children}
          </SearchProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
