export const dynamic = "force-static";

export async function GET() {
  const baseUrl = "https://byt-ai.vercel.app";
  const now = new Date().toISOString();

  const routes = [
    { loc: baseUrl, priority: "1.0", changefreq: "daily" },
    { loc: `${baseUrl}/login`, priority: "0.8", changefreq: "monthly" },
    { loc: `${baseUrl}/projects`, priority: "0.9", changefreq: "weekly" },
    { loc: `${baseUrl}/templates`, priority: "0.9", changefreq: "weekly" },
    { loc: `${baseUrl}/deployments`, priority: "0.7", changefreq: "weekly" },
    { loc: `${baseUrl}/history`, priority: "0.6", changefreq: "weekly" },
    { loc: `${baseUrl}/settings`, priority: "0.5", changefreq: "monthly" },
    { loc: `${baseUrl}/preview`, priority: "0.7", changefreq: "monthly" },
    { loc: `${baseUrl}/terms`, priority: "0.4", changefreq: "yearly" },
    { loc: `${baseUrl}/privacy`, priority: "0.4", changefreq: "yearly" },
    { loc: `${baseUrl}/cookies`, priority: "0.3", changefreq: "yearly" },
    { loc: `${baseUrl}/acceptable-use`, priority: "0.3", changefreq: "yearly" },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${r.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
