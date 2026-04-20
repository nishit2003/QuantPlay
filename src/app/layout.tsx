import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SessionProvider } from "@/components/providers/session-provider";
import "@/lib/env";
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
  title: "QuantPlay — Professional Paper Trading Simulator",
  description:
    "Master the markets risk-free. Start with $1,000 virtual cash, trade real-time stocks, analyze charts, and compete on the weekly leaderboard.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

/**
 * IMPORTANT: do NOT add `overflow-x-hidden` to <body>.
 *
 * Per CSS spec, setting overflow on one axis silently sets the other
 * axis to `auto`, turning the element into a scroll container. When
 * <body> becomes a scroll container, descendant `position: sticky`
 * elements use <body> (not the viewport / <html>) as their scrolling
 * ancestor — but body's height is `auto`, so it never actually
 * scrolls vertically, and sticky NEVER ACTIVATES.
 *
 * Keep horizontal-overflow guarding on <html> and on individual
 * sections that need it (the marquee already self-clips).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {children}
          </ThemeProvider>
        </SessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
