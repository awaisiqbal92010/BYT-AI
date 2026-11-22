export const dynamic = "force-static";

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /
Allow: /login
Allow: /projects
Allow: /templates
Allow: /deployments
Allow: /history
Allow: /terms
Allow: /privacy
Allow: /cookies
Allow: /acceptable-use
Allow: /preview
Disallow: /api/
Disallow: /auth/callback
Disallow: /_next/

User-agent: Googlebot
Allow: /
Crawl-delay: 1

Sitemap: https://byt-ai.vercel.app/sitemap.xml
Host: https://byt-ai.vercel.app
`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
