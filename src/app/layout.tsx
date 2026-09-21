import type { Metadata } from "next";
import Script from "next/script";
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
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_TITLE_TEMPLATE, buildWebsiteJsonLd } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | The Salesforce Developer Ecosystem`,
    template: SITE_TITLE_TEMPLATE,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Salesforce CLI plugins",
    "Salesforce developer tools",
    "Lightning Web Components",
    "LWC library",
    "Apex utilities",
    "Agentforce",
    "Salesforce Flow",
    "Experience Cloud",
    "sfdx plugins",
    "sf cli",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} | The Salesforce Developer Ecosystem`,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | The Salesforce Developer Ecosystem`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
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
        <Script
          src="/_s/a.js"
          strategy="afterInteractive"
          data-website-id="21970abd-f7d7-463a-bc0f-af435f054f4c"
          data-host-url="/_s"
          data-domains="www.sfdxhub.com,sfdxhub.com"
          data-performance="true"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebsiteJsonLd()) }}
        />
      </body>
    </html>
  );
}
