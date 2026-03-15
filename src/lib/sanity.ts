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
    featuredProjects[]->{
      title,
      slug,
      mainImage,
      description,
      tags,
      backgroundEffect
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
      verticalPosition
    }
  }`;
  return await sanityClient.fetch(query, { locale });
}

export async function getProjects(locale: string) {
  const query = `*[_type == "project" && locale == $locale] | order(order asc) {
    title,
    slug,
    mainImage,
    description,
    tags,
    link,
    order,
    backgroundEffect
  }`;
  return await sanityClient.fetch(query, { locale });
}
