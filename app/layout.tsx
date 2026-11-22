import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { AuthProvider } from "@/lib/firebase/auth-context";

const plusJakartaSans = { variable: "font-sans" };
const jetbrainsMono = { variable: "font-mono" };


export const metadata: Metadata = {
  title: {
    default: "BYT — AI Website Builder Platform",
    template: "%s | BYT AI Builder",
  },
  description:
    "Build full-stack web applications and UI interfaces with AI in seconds. Live preview, instant code editing, one-click deployment. Powered by Claude & GPT-4o.",
  keywords: [
    "AI website builder",
    "AI code generator",
    "full-stack web app builder",
    "Next.js AI builder",
    "Tailwind CSS AI",
    "React code generation",
    "cloud sandbox IDE",
    "E2B sandbox",
    "no-code AI",
    "BYT builder",
    "build website with AI",
    "AI SaaS builder",
    "AI landing page generator",
    "web application generator",
  ],
  authors: [{ name: "BYT Technologies", url: "https://byt-ai.vercel.app" }],
  creator: "BYT Technologies",
  publisher: "BYT Technologies",
  metadataBase: new URL("https://byt-ai.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://byt-ai.vercel.app",
    siteName: "BYT AI Website Builder",
    title: "BYT — Build Any Website with AI in Seconds",
    description:
      "Describe your idea, watch AI build it live. BYT generates full-stack React/Next.js applications with live preview, code editor, and instant deployment.",
    images: [
      {
        url: "https://byt-ai.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "BYT AI Website Builder — Build with AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BYT — AI Website Builder",
    description:
      "Generate full-stack web apps with AI. Live preview, instant code, one-click deploy.",
    images: ["https://byt-ai.vercel.app/og-image.png"],
    creator: "@byt_ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  verification: {
    google: "BYT-AI-GOOGLE-VERIFICATION-TOKEN",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "BYT AI Website Builder",
              "url": "https://byt-ai.vercel.app",
              "description": "Build full-stack web applications with AI in seconds. Live preview, code editing, and instant deployment.",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Web",
              "offers": [
                {
                  "@type": "Offer",
                  "name": "Free Plan",
                  "price": "0",
                  "priceCurrency": "USD",
                },
                {
                  "@type": "Offer",
                  "name": "Pro Plan",
                  "price": "20",
                  "priceCurrency": "USD",
                  "billingIncrement": "month",
                },
              ],
              "creator": {
                "@type": "Organization",
                "name": "BYT Technologies",
                "url": "https://byt-ai.vercel.app",
              },
            }),
          }}
        />
      </head>
      <body className="font-sans bg-background text-foreground antialiased min-h-screen selection:bg-primary/20 selection:text-primary">
        <GoogleAnalytics />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
