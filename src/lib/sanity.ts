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
      url: data?.linkedin?.url || "https://linkedin.com",
    },
    github: {
      enabled: data?.github?.enabled !== undefined ? data.github.enabled : true,
      url: data?.github?.url || "https://github.com/FaultierFlash",
    },
    instagram: {
      enabled: data?.instagram?.enabled !== undefined ? data.instagram.enabled : false,
      url: data?.instagram?.url || "",
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
    console.error("Failed to fetch cvSettings from Sanity:", err);
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
      console.warn("Could not pre-fetch photo as base64 in SSR:", e);
    }
  }

  const defaultData = {
    mode: cv?.mode || 'generated',
    manualPdfUrl: cv?.manualPdfUrl || null,
    personalInfo: {
      name: cv?.personalInfo?.name || 'Marlon Hendrik Müller',
      title: (isDe ? cv?.personalInfo?.titleDe : cv?.personalInfo?.titleEn) || 
             (isDe ? 'B.Sc. Engineering Science, TUM · Gründer & Vorstand Odonatum e.V.' : 'B.Sc. Engineering Science, TUM · Founder & Board Member Odonatum e.V.'),
      email: cv?.personalInfo?.email || 'contact@marlonmueller.eu',
      phone: cv?.personalInfo?.phone || '+49 162 8653790',
      location: (isDe ? cv?.personalInfo?.locationDe : cv?.personalInfo?.locationEn) || 
                (isDe ? 'Ahornweg 76, 85375 Neufahrn / München' : 'Ahornweg 76, 85375 Neufahrn / Munich, Germany'),
      website: cv?.personalInfo?.website || 'marlonmueller.eu',
      linkedin: cv?.personalInfo?.linkedin || 'https://linkedin.com/in/marlon-hendrik-mueller',
      github: cv?.personalInfo?.github || 'https://github.com/FaultierFlash',
      photo: rawPhoto,
      photoDataUri: photoDataUri,
    },
    experience: (data?.experience && data.experience.length > 0) ? data.experience.map((item: any) => ({
      role: isDe ? (item.roleDe || item.roleEn) : (item.roleEn || item.roleDe),
      company: item.company,
      period: isDe ? (item.periodDe || item.periodEn) : (item.periodEn || item.periodDe),
      highlights: isDe ? (item.highlightsDe || item.highlightsEn || []) : (item.highlightsEn || item.highlightsDe || []),
    })) : [
      {
        role: isDe ? 'Gründer & Vorstand' : 'Founder & Board Member',
        company: 'Odonatum e.V.',
        period: isDe ? 'Mai 2025 – Heute' : 'May 2025 – Present',
        highlights: isDe ? [
          '**Projektleitung:** Mitbegründung und Leitung eines 31-köpfigen Teams zur Entwicklung einer libelleninspirierten Schlagflügel-Drohne (UAV).',
          '**Systems Engineering:** Integration von mechanischen Koppelgetrieben, Aerodynamik und Regelungssystemen von CAD-Konzeption bis Prototypenbau.',
          '**Webentwicklung:** Aufbau von Odonatum.com mit Astro, TypeScript und Sanity CMS.',
          '**Partnerschaften:** Akquise hochkarätiger Industriesponsorings (u.a. MTU Aero Engines, Dassault Systèmes).'
        ] : [
          '**Project Lead:** Co-founded and currently leading a 31-member team engineering a dragonfly-inspired flapping wing UAV.',
          '**Systems Engineering:** Driving the integration of mechanical linkages, aerodynamics, and control systems from initial CAD conceptualization to physical prototyping.',
          '**Web Development:** Built Odonatum.com using Astro, TypeScript, and Sanity CMS.',
          '**Operations & Partnerships:** Leading recruitment and secured high-value software/industrial sponsorships from MTU, Dassault Systèmes & others.'
        ]
      },
      {
        role: isDe ? 'Tutorium & Peer-Tutoring' : 'Private Peer Tutoring',
        company: 'TUM Engineering Science',
        period: isDe ? 'Sep. 2025 – Apr. 2026' : 'Sep. 2025 – Apr. 2026',
        highlights: isDe ? [
          '**Fachinhalte:** Vermittlung komplexer Themen in Technischer Mechanik, Informatik & Physik für Kommilitonen.'
        ] : [
          '**Explaining complex topics** in Technical Mechanics, Informatics & Physics.'
        ]
      },
      {
        role: isDe ? 'Gruppenleitung Nachhilfe' : 'Tutoring Group Lead',
        company: 'KidsClub Hannover',
        period: isDe ? 'Nov. 2021 – Sep. 2024' : 'Nov. 2021 – Sep. 2024',
        highlights: isDe ? [
          '**Verantwortung:** Koordination großer Nachhilfegruppen für geflüchtete Schülerinnen und Schüler der Klassen 1 bis 7.'
        ] : [
          '**Responsibility:** Coordinating large tutoring groups of 1st to 7th graders who arrived in Germany as refugees.'
        ]
      },
      {
        role: isDe ? 'Fluggerätmechaniker - Praktikum' : 'Aircraft Mechanic - Intern',
        company: 'MTU Maintenance',
        period: isDe ? 'Mär. 2022 – Apr. 2022' : 'Mar. 2022 – Apr. 2022',
        highlights: isDe ? [
          '**Technische Grundlagen:** Metallbearbeitung und Mitarbeit in der HPT-Instandhaltungslinie (Hochdruckturbine).'
        ] : [
          '**Technical Fundamentals:** Basics of metalworking & working in the HPT maintenance line.'
        ]
      }
    ],
    education: (data?.education && data.education.length > 0) ? data.education.map((item: any) => ({
      degree: isDe ? (item.degreeDe || item.degreeEn) : (item.degreeEn || item.degreeDe),
      institution: item.institution,
      period: isDe ? (item.periodDe || item.periodEn) : (item.periodEn || item.periodDe),
      details: isDe ? (item.detailsDe || item.detailsEn || []) : (item.detailsEn || item.detailsDe || []),
    })) : [
      {
        degree: 'B. Sc. Engineering Science',
        institution: 'Technical University of Munich (TUM)',
        period: isDe ? 'Sep. 2024 – Heute' : 'Sep. 2024 – Present',
        details: isDe ? [
          '**Beschleunigter Studiengang (210 ECTS)** – 6 Semester interdisziplinäres Ingenieurstudium.',
          '**Bilinguales Studium** auf Englisch und Deutsch (40% / 60%).',
          '**Stipendiat** der *Studienstiftung des deutschen Volkes*.'
        ] : [
          '**Accelerated Degree (210 ECTS)** – 6 Semester interdisciplinary engineering bachelor.',
          '**Bilingual studies** in English and German (40% / 60%).',
          '**Scholarship** – German Academic Scholarship Foundation (*Studienstiftung des deutschen Volkes*).'
        ]
      },
      {
        degree: isDe ? 'Abitur' : 'Highschool – Abitur',
        institution: 'Gymnasium',
        period: isDe ? 'Aug. 2015 – Juni 2024' : 'Aug. 2015 – June 2024',
        details: isDe ? [
          '**Abiturnote:** 1,3.',
          '*Jugend forscht* **1. Platz** im Regionalwettbewerb, Sonderpreis für Energie- und Klimaschutz & Sonderpreis für unternehmerische Ideen.'
        ] : [
          '**Abitur Grade:** 1.3 (German Grade).',
          '*Jugend forscht* science competition: **1st place** in regional round, Special Award for Energy and Climate Protection & Special Award for Entrepreneurial Ideas.'
        ]
      }
    ],
    skills: {
      coding: data?.skills?.coding || ['C', 'Python', 'SQL', 'LaTeX'],
      webDev: data?.skills?.webDev || ['Astro (JS/TS, CSS, HTML)', 'Git / GitHub', 'Netlify Client', 'Sanity CMS', 'Resend API'],
      engineeringCad: data?.skills?.engineeringCad || ['SolidWorks', 'Autodesk Inventor & Fusion'],
      languages: (isDe ? data?.skills?.languagesDe : data?.skills?.languagesEn) || 
                 (isDe ? ['Deutsch: Muttersprache', 'Englisch: C2', 'Mandarin Chinesisch: A2'] : ['German: Native', 'English: C2', 'Mandarin Chinese: A2']),
    },
    volunteering: (data?.volunteering && data.volunteering.length > 0) ? data.volunteering.map((item: any) => ({
      role: isDe ? (item.roleDe || item.roleEn) : (item.roleEn || item.roleDe),
      organization: item.organization,
      period: isDe ? (item.periodDe || item.periodEn) : (item.periodEn || item.periodDe),
      details: isDe ? (item.detailsDe || item.detailsEn || []) : (item.detailsEn || item.detailsDe || []),
    })) : [
      {
        role: isDe ? 'Leitung Fachschaftsreferat' : 'Munich School of Engineering Head of Student Council Department',
        organization: 'Fachschaft Munich School of Engineering (TUM)',
        period: isDe ? '2025 – Heute' : '2025 – Present',
        details: isDe ? [
          '**Verbesserung der Studienbedingungen** und Aufenthaltsqualität am Quanten-Campus Garching-Hochbrück.'
        ] : [
          '**Improving the quality of life** for students at Garching-Hochbrück Quantum facility.'
        ]
      },
      {
        role: isDe ? 'Rettungsschwimmer & Einsatztaucher' : 'Lifeguard & Search & Rescue Diver',
        organization: 'DLRG Langenhagen',
        period: isDe ? '2019 – Heute' : '2019 – Present',
        details: isDe ? [
          '**Einsatztaucher** – Sanitätsausbildung – Rettungssport.'
        ] : [
          '**Lifeguard** – Search & Rescue Diver – Advanced First Aid Training – Rescue Sport.'
        ]
      }
    ]
  };

  return defaultData;
}


