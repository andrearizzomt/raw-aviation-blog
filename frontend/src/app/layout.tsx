import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Aviation Blog - News, Reports & Photography",
  description: "Your premier destination for aviation news, airshow reports, and stunning aircraft photography. From military displays to civilian aviation.",
};

function Navigation() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-blue-900">
            Aviation Blog
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link href="/articles" className="text-gray-700 hover:text-blue-600 transition-colors">
              Articles
            </Link>
            <Link href="/reports" className="text-gray-700 hover:text-green-600 transition-colors">
              Reports
            </Link>
            <Link href="/galleries" className="text-gray-700 hover:text-purple-600 transition-colors">
              Galleries
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        {children}
      </body>
    </html>
  );
}
