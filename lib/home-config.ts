import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { defaultHomeConfig, type HomeConfig } from "@/theme/home/config";

export const HOME_CONFIG_KEY = "HOME_CONFIG";
export const HOME_CONFIG_TAG = "home-config";

function mergeHomeConfig(partial: Partial<HomeConfig> | null | undefined): HomeConfig {
  if (!partial || typeof partial !== "object") {
    return defaultHomeConfig;
  }

  return {
    heroSlides: Array.isArray(partial.heroSlides)
      ? partial.heroSlides
      : defaultHomeConfig.heroSlides,
    showFirstFourCol:
      typeof partial.showFirstFourCol === "boolean"
        ? partial.showFirstFourCol
        : defaultHomeConfig.showFirstFourCol,
    firstFourCol: Array.isArray(partial.firstFourCol)
      ? partial.firstFourCol
      : defaultHomeConfig.firstFourCol,
    offerSection: {
      ...defaultHomeConfig.offerSection,
      ...(partial.offerSection || {}),
    },
    showSecondFourCol:
      typeof partial.showSecondFourCol === "boolean"
        ? partial.showSecondFourCol
        : defaultHomeConfig.showSecondFourCol,
    secondFourCol: Array.isArray(partial.secondFourCol)
      ? partial.secondFourCol
      : defaultHomeConfig.secondFourCol,
    showNewProducts:
      typeof partial.showNewProducts === "boolean"
        ? partial.showNewProducts
        : defaultHomeConfig.showNewProducts,
    lightBanner: {
      ...defaultHomeConfig.lightBanner,
      ...(partial.lightBanner || {}),
    },
  };
}

const getCachedHomeConfig = unstable_cache(
  async (): Promise<HomeConfig> => {
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: HOME_CONFIG_KEY },
      });

      if (!setting?.value) {
        return defaultHomeConfig;
      }

      const parsed = JSON.parse(setting.value) as Partial<HomeConfig>;
      return mergeHomeConfig(parsed);
    } catch (error) {
      console.error("Failed to load home config from DB, using defaults:", error);
      return defaultHomeConfig;
    }
  },
  [HOME_CONFIG_TAG],
  { tags: [HOME_CONFIG_TAG], revalidate: 3600 }
);

export async function getHomeConfig(): Promise<HomeConfig> {
  return getCachedHomeConfig();
}