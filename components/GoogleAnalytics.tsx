"use client";

import Script from "next/script";

interface GoogleAnalyticsProps {
  gaMeasurementId?: string;
}

export function GoogleAnalytics({
  gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-BYTENGINE2026",
}: GoogleAnalyticsProps) {
  if (!gaMeasurementId) return null;

  return (
    <>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  );
}
