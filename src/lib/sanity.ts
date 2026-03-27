import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'k4t36b6u',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-03-12', // use current date (YYYY-MM-DD) to target the latest API version
  useCdn: false, // Disabled CDN to ensure slider values hot-reload immediately
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

// --- Data Fetching Helpers ---

export async function getTranslationOverrides(locale: string) {
  const query = `*[_type == "translationOverride" && locale == $locale] {
    key,
    value
  }`;
  const result = await sanityClient.fetch(query, { locale });

  // Convert array to object: { "key": "value" }
  const overrides: Record<string, string> = {};
  result.forEach((item: any) => {
    overrides[item.key] = item.value;
  });
  return overrides;
}

export async function getHomePageData(locale: string) {
  const query = `*[_type == "homePage" && locale == $locale][0] {
    heroTitle,
    heroSubtitle,
    aboutText,
    profileImage,
    backgroundEffect,
    topographyConfig,
    solarConfig,
    featuredProjects[]->{
      "title": title,
      slug,
      mainImage,
      "description": description[$locale],
      tags,
      backgroundEffect,
      topographyConfig,
      solarConfig,
      accentColor
    },
    timelineStartDate,
    timelineEndDate,
    timelineScale,
    timeline[]{
      title,
      description,
      startDate,
      endDate,
      isOngoing,
      color,
      verticalPosition,
      milestoneEvents[]{
        title,
        date,
        description,
        color,
        relatedProject->{
          slug
        }
      },
      relatedProject->{
        slug,
        accentColor
      }
    }
  }`;
  return await sanityClient.fetch(query, { locale });
}

export async function getProjects(locale: string) {
  const query = `*[_type == "project" && $locale in languages] | order(order asc) {
    "title": title,
    slug,
    mainImage,
    "description": description[$locale],
    tags,
    link,
    order,
    backgroundEffect,
    topographyConfig,
    solarConfig,
    accentColor
  }`;
  return await sanityClient.fetch(query, { locale });
}

export async function getBooks() {
  const query = `*[_type == "book"] | order(coalesce(sortDate, "0000-00-00") desc) {
    title,
    author,
    series,
    seriesOrder,
    cover,
    status,
    progress,
    rating,
    reviewEn,
    reviewDe,
    genres,
    dateFinished,
    physicalCopy
  }`;
  return await sanityClient.fetch(query);
}

export async function getLibrarySettings() {
  const query = `*[_type == "librarySettings"][0] {
    titleEn,
    titleDe,
    subtitleEn,
    subtitleDe,
    backgroundEffect,
    accentColor,
    topographyConfig,
    solarConfig
  }`;
  return await sanityClient.fetch(query);
}
