import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'k4t36b6u',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-03-12', // use current date (YYYY-MM-DD) to target the latest API version
  useCdn: import.meta.env.PROD,
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

  const overrides: Record<string, string> = {};
  (result || []).forEach((item: any) => {
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
    airflowConfig,
    "featuredProjects": featuredProjects[defined(@->_id) && $locale in @->languages]->{
      "title": title,
      slug,
      mainImage,
      "description": description[$locale],
      tags,
      backgroundEffect,
      topographyConfig,
      solarConfig,
      airflowConfig,
      accentColor
    },
    showSpinWheel,
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
        "relatedProject": select(
          defined(relatedProject->_id) && $locale in relatedProject->languages => relatedProject->{
            slug,
            title,
            "description": description[$locale],
            mainImage,
            tags,
            accentColor
          },
          null
        )
      },
      "relatedProject": select(
        defined(relatedProject->_id) && $locale in relatedProject->languages => relatedProject->{
          slug,
          accentColor,
          title,
          "description": description[$locale],
          mainImage,
          tags
        },
        null
      )
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
    publishDate,
    "timelineDate": coalesce(
      *[_type == "homePage"][0].timeline[relatedProject._ref == ^._id][0].startDate,
      (*[_type == "homePage"][0].timeline[].milestoneEvents[])[relatedProject._ref == ^._id][0].date
    ),
    "isOngoing": *[_type == "homePage"][0].timeline[relatedProject._ref == ^._id][0].isOngoing,
    "documentCount": count(documents[defined(asset) && (!defined(language) || language == "all" || language == $locale)]),
    "galleryCount": count(gallery),
    backgroundEffect,
    topographyConfig,
    solarConfig,
    airflowConfig,
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
    solarConfig,
    airflowConfig
  }`;
  return await sanityClient.fetch(query);
}

export async function getNotesSettings() {
  const query = `*[_type == "notesSettings"][0] {
    enabled,
    titleEn,
    titleDe,
    subtitleEn,
    subtitleDe
  }`;
  return await sanityClient.fetch(query);
}

export async function getSocialsSettings() {
  const query = `*[_type == "socialsSettings"][0] {
    linkedin {
      enabled,
      url
    },
    github {
      enabled,
      url
    },
    instagram {
      enabled,
      url
    }
  }`;
  const data = await sanityClient.fetch(query);
  return {
    linkedin: {
      enabled: data?.linkedin?.enabled !== undefined ? data.linkedin.enabled : true,
      url: data?.linkedin?.url || 'https://linkedin.com/in/marlon-hendrik-mueller',
    },
    github: {
      enabled: data?.github?.enabled !== undefined ? data.github.enabled : true,
      url: data?.github?.url || 'https://github.com/FaultierFlash',
    },
    instagram: {
      enabled: data?.instagram?.enabled !== undefined ? data.instagram.enabled : false,
      url: data?.instagram?.url || '',
    },
  };
}

export async function getLegalPage(type: string, locale: string) {
  const query = `*[_type == "legalPage" && type == $type && locale == $locale][0] {
    title,
    content
  }`;
  return await sanityClient.fetch(query, { type, locale });
}

export async function getLabEntries(locale?: string) {
  const query = locale
    ? `*[_type == "labEntry" && status == "published" && (!defined(language) || language == $locale)] | order(date desc) {
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
      "relatedProject": select(
        defined(relatedProject->_id) && (!defined($locale) || $locale in relatedProject->languages) => relatedProject->{
          title,
          slug,
          accentColor
        },
        null
      )
    }`
    : `*[_type == "labEntry" && status == "published"] | order(date desc) {
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
      "relatedProject": select(
        defined(relatedProject->_id) => relatedProject->{
          title,
          slug,
          accentColor
        },
        null
      )
    }`;
  return await sanityClient.fetch(query, locale ? { locale } : {});
}

export async function getCvData(locale: string = 'en') {
  const query = `{
    "cv": *[_type == "cvSettings"][0] {
      mode,
      "manualPdfUrl": manualPdf.asset->url,
      personalInfo,
      experience,
      education,
      skills,
      volunteering
    },
    "home": *[_type == "homePage"][0] {
      profileImage
    }
  }`;

  let data: any = null;
  try {
    data = await sanityClient.fetch(query);
  } catch (err) {
    console.error('Failed to fetch cvSettings from Sanity:', err);
  }

  const cv = data?.cv;
  const isDe = locale === 'de';

  let photoDataUri: string | null = null;
  const rawPhoto = cv?.personalInfo?.photo || data?.home?.profileImage || null;
  if (rawPhoto) {
    try {
      const imgUrl = urlFor(rawPhoto).width(240).height(240).auto('format').quality(90).url();
      const res = await fetch(imgUrl);
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        photoDataUri = `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`;
      }
    } catch (e) {
      console.warn('Could not pre-fetch photo as base64 in SSR:', e);
    }
  }

  return {
    mode: cv?.mode || 'generated',
    manualPdfUrl: cv?.manualPdfUrl || null,
    personalInfo: {
      name: cv?.personalInfo?.name || '',
      title: (isDe ? cv?.personalInfo?.titleDe : cv?.personalInfo?.titleEn) || '',
      email: cv?.personalInfo?.email || '',
      phone: cv?.personalInfo?.phone || '',
      location: (isDe ? cv?.personalInfo?.locationDe : cv?.personalInfo?.locationEn) || '',
      website: cv?.personalInfo?.website || '',
      linkedin: cv?.personalInfo?.linkedin || '',
      github: cv?.personalInfo?.github || '',
      photo: rawPhoto,
      photoDataUri,
    },
    experience: (cv?.experience || []).map((item: any) => ({
      role: isDe ? item.roleDe || item.roleEn : item.roleEn || item.roleDe,
      company: item.company || '',
      period: isDe ? item.periodDe || item.periodEn : item.periodEn || item.periodDe,
      highlights: isDe
        ? item.highlightsDe || item.highlightsEn || []
        : item.highlightsEn || item.highlightsDe || [],
    })),
    education: (cv?.education || []).map((item: any) => ({
      degree: isDe ? item.degreeDe || item.degreeEn : item.degreeEn || item.degreeDe,
      institution: item.institution || '',
      period: isDe ? item.periodDe || item.periodEn : item.periodEn || item.periodDe,
      details: isDe ? item.detailsDe || item.detailsEn || [] : item.detailsEn || item.detailsDe || [],
    })),
    skills: {
      coding: cv?.skills?.coding || [],
      webDev: cv?.skills?.webDev || [],
      engineeringCad: cv?.skills?.engineeringCad || [],
      languages:
        (isDe
          ? cv?.skills?.languagesDe || cv?.skills?.languagesEn
          : cv?.skills?.languagesEn || cv?.skills?.languagesDe) || [],
    },
    volunteering: (cv?.volunteering || []).map((item: any) => ({
      role: isDe ? item.roleDe || item.roleEn : item.roleEn || item.roleDe,
      organization: item.organization || '',
      period: isDe ? item.periodDe || item.periodEn : item.periodEn || item.periodDe,
      details: isDe ? item.detailsDe || item.detailsEn || [] : item.detailsEn || item.detailsDe || [],
    })),
  };
}
