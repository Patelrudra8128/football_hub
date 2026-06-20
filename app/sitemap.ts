import { MetadataRoute } from "next";
import { db } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.footballscore.info";
  const currentDate = new Date();

  // Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "always",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/live`,
      lastModified: currentDate,
      changeFrequency: "always",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/matches`,
      lastModified: currentDate,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/predictions`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/standings`,
      lastModified: currentDate,
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/players`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Dynamic Routes
  let teamRoutes: MetadataRoute.Sitemap = [];
  let matchRoutes: MetadataRoute.Sitemap = [];

  try {
    const teams = await db.getTeams();
    teamRoutes = teams.map((team) => ({
      url: `${baseUrl}/teams/${team.id}`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Sitemap: Failed to load teams:", error);
  }

  try {
    const matches = await db.getMatches();
    matchRoutes = matches.map((match) => {
      // Finished matches change rarely, live/upcoming match scorecards change frequently
      const changeFrequency: "always" | "hourly" | "daily" | "weekly" =
        match.status === "finished" ? "weekly" : match.status === "live" ? "always" : "hourly";
      const priority = match.status === "live" ? 0.8 : 0.6;

      return {
        url: `${baseUrl}/matches/${match.id}`,
        lastModified: new Date(match.date),
        changeFrequency,
        priority,
      };
    });
  } catch (error) {
    console.error("Sitemap: Failed to load matches:", error);
  }

  return [...staticRoutes, ...teamRoutes, ...matchRoutes];
}
