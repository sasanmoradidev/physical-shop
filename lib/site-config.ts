import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { siteConfig as defaultSiteConfig, type SiteConfig } from "@/theme/config";

export const SITE_CONFIG_KEY = "SITE_CONFIG";
export const SITE_CONFIG_TAG = "site-config";

function mergeSiteConfig(partial: Partial<SiteConfig> | null | undefined): SiteConfig {
  if (!partial || typeof partial !== "object") {
    return defaultSiteConfig;
  }

  return {
    ...defaultSiteConfig,
    ...partial,
    keywords: Array.isArray(partial.keywords)
      ? partial.keywords
      : defaultSiteConfig.keywords,
    address: {
      ...defaultSiteConfig.address,
      ...(partial.address || {}),
    },
    map: {
      lat:
        typeof partial.map?.lat === "number" && !Number.isNaN(partial.map.lat)
          ? partial.map.lat
          : defaultSiteConfig.map.lat,
      lng:
        typeof partial.map?.lng === "number" && !Number.isNaN(partial.map.lng)
          ? partial.map.lng
          : defaultSiteConfig.map.lng,
    },
    navLinks: defaultSiteConfig.navLinks,
    socials: {
      ...defaultSiteConfig.socials,
      ...(partial.socials || {}),
    },
  };
}

const getCachedSiteConfig = unstable_cache(
  async (): Promise<SiteConfig> => {
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: SITE_CONFIG_KEY },
      });

      if (!setting?.value) {
        return defaultSiteConfig;
      }

      const parsed = JSON.parse(setting.value) as Partial<SiteConfig>;
      return mergeSiteConfig(parsed);
    } catch (error) {
      console.error("Failed to load site config from DB, using defaults:", error);
      return defaultSiteConfig;
    }
  },
  [SITE_CONFIG_TAG],
  { tags: [SITE_CONFIG_TAG], revalidate: 3600 }
);

export async function getSiteConfig(): Promise<SiteConfig> {
  return getCachedSiteConfig();
}