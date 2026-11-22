export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/login",
          "/projects",
          "/templates",
          "/deployments",
          "/history",
          "/terms",
          "/privacy",
          "/cookies",
          "/acceptable-use",
          "/preview",
        ],
        disallow: ["/api/", "/auth/callback", "/_next/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        crawlDelay: 1,
      },
    ],
    sitemap: "https://byt-ai.vercel.app/sitemap.xml",
    host: "https://byt-ai.vercel.app",
  };
}
