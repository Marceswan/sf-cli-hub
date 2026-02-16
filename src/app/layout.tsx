import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { EventTrackerProvider } from "@/components/analytics/event-tracker-provider";
import { FeatureFlagsProvider } from "@/lib/feature-flags-context";
import { getFeatureFlags } from "@/lib/settings";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "SFDX Hub | The Salesforce Developer Ecosystem",
  description:
    "The community-driven registry for high-performance CLI plugins, reusable Lightning Web Components, and Apex utilities.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const flags = await getFeatureFlags();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased flex flex-col min-h-svh`}>
        <SessionProvider>
          <ThemeProvider>
            <FeatureFlagsProvider flags={flags}>
              <PageViewTracker />
              <EventTrackerProvider />
              <Header />
              <main className="flex-1 flex flex-col pt-[70px]">{children}</main>
              <Footer />
            </FeatureFlagsProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
