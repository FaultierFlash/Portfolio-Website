import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'k4t36b6u',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-03-12', // use current date (YYYY-MM-DD) to target the latest API version
  useCdn: false, // Disabled CDN to ensure slider values hot-reload immediately
});

const builder = createImageUrlBuilder(sanityClient);

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
  const query = `*[_type == "homePage"][0] {
    "heroTitle": heroTitle[$locale],
    "heroSubtitle": heroSubtitle[$locale],
    "aboutText": aboutText[$locale],
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
    "timeline": timeline[($locale == "de" && isVisibleDe != false) || ($locale == "en" && isVisibleEn != false)]{
      "title": title[$locale],
      "description": description[$locale],
      startDate,
      endDate,
      isOngoing,
      color,
      verticalPosition,
      widgetImage,
      "widgetButtonLabel": widgetButtonLabel[$locale],
      widgetButtonLink,
      openByDefault,
      "milestoneEvents": milestoneEvents[($locale == "de" && isVisibleDe != false) || ($locale == "en" && isVisibleEn != false)]{
        "title": title[$locale],
        date,
        "description": description[$locale],
        color,
        widgetImage,
        "widgetButtonLabel": widgetButtonLabel[$locale],
        widgetButtonLink,
        openByDefault,
        relatedProject->{
          slug,
          title,
          "description": description[$locale],
          mainImage,
          tags,
          accentColor
        }
      },
      relatedProject->{
        slug,
        accentColor,
        title,
        "description": description[$locale],
        mainImage,
        tags
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

export async function getLegalPage(type: string, locale: string) {
  const query = `*[_type == "legalPage" && type == $type && locale == $locale][0] {
    title,
    content
  }`;
  return await sanityClient.fetch(query, { type, locale });
}

export async function getLabEntries() {
  const query = `*[_type == "labEntry" && status == "published"] | order(date desc) {
    title,
    slug,
    date,
    category,
    tags,
    language,
    body,
    images[]{
      asset->,
      alt,
      caption
    },
    relatedProject->{
      title,
      slug,
      accentColor
    }
  }`;
  return await sanityClient.fetch(query);
}

