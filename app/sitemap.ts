export default function sitemap() {
  const baseUrl = "https://byt-ai.vercel.app";
  const now = new Date();

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/templates`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/deployments`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/history`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/settings`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/preview`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/acceptable-use`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
