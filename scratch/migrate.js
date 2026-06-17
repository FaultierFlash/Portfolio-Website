/**
 * Sanity HomePage Schema Unification Migration Script
 * 
 * To run this script:
 * 1. Go to https://manage.sanity.io, navigate to your project, go to API -> Tokens, and create a write token.
 * 2. In your terminal, set the environment variable:
 *    On Windows (Powershell):
 *      $env:SANITY_WRITE_TOKEN="your_write_token_here"
 *    On macOS/Linux:
 *      export SANITY_WRITE_TOKEN="your_write_token_here"
 * 3. Run:
 *      node scratch/migrate.js
 */

import { createClient } from '@sanity/client';

const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN || process.env.SANITY_AUTH_TOKEN;
if (!token) {
  console.error('Error: SANITY_WRITE_TOKEN, SANITY_TOKEN, or SANITY_AUTH_TOKEN environment variable is not set.');
  process.exit(1);
}

const client = createClient({
  projectId: 'k4t36b6u',
  dataset: 'production',
  apiVersion: '2024-03-12',
  token: token,
  useCdn: false,
});

async function runMigration() {
  console.log('Fetching existing homePage documents...');
  try {
    const docs = await client.fetch('*[_type == "homePage"]');
    console.log(`Found ${docs.length} homePage document(s) in Sanity.`);

    const enDoc = docs.find(d => d.locale === 'en');
    const deDoc = docs.find(d => d.locale === 'de');

    if (!enDoc) {
      console.warn('Warning: Could not find English homePage document (locale == "en").');
    }
    if (!deDoc) {
      console.warn('Warning: Could not find German homePage document (locale == "de").');
    }

    if (!enDoc && !deDoc) {
      console.error('Error: No documents to migrate.');
      process.exit(1);
    }

    const sourceEn = enDoc || {};
    const sourceDe = deDoc || {};

    console.log('Merging fields...');

    const mergedDoc = {
      _id: 'homePage', // Fixed ID for singleton
      _type: 'homePage',
      profileImage: sourceEn.profileImage || sourceDe.profileImage,
      backgroundEffect: sourceEn.backgroundEffect || sourceDe.backgroundEffect || 'none',
      solarConfig: sourceEn.solarConfig || sourceDe.solarConfig,
      topographyConfig: sourceEn.topographyConfig || sourceDe.topographyConfig,
      featuredProjects: sourceEn.featuredProjects || sourceDe.featuredProjects,
      timelineStartDate: sourceEn.timelineStartDate || sourceDe.timelineStartDate,
      timelineEndDate: sourceEn.timelineEndDate || sourceDe.timelineEndDate,
      timelineScale: sourceEn.timelineScale || sourceDe.timelineScale || 400,
      
      // Localized visible text fields
      heroTitle: {
        en: sourceEn.heroTitle || '',
        de: sourceDe.heroTitle || ''
      },
      heroSubtitle: {
        en: sourceEn.heroSubtitle || '',
        de: sourceDe.heroSubtitle || ''
      },
      aboutText: {
        en: sourceEn.aboutText || '',
        de: sourceDe.aboutText || ''
      },
      timeline: []
    };

    // Merge timeline items
    const enTimeline = sourceEn.timeline || [];
    const deTimeline = sourceDe.timeline || [];
    const maxTimelineLength = Math.max(enTimeline.length, deTimeline.length);

    console.log(`Merging ${maxTimelineLength} timeline entries...`);

    for (let i = 0; i < maxTimelineLength; i++) {
      const enItem = enTimeline[i] || {};
      const deItem = deTimeline[i] || {};

      const mergedItem = {
        _key: enItem._key || deItem._key || `timeline-item-${i}`,
        startDate: enItem.startDate || deItem.startDate,
        endDate: enItem.endDate || deItem.endDate,
        isOngoing: enItem.isOngoing !== undefined ? enItem.isOngoing : deItem.isOngoing,
        color: enItem.color || deItem.color || 'primary',
        verticalPosition: enItem.verticalPosition || deItem.verticalPosition || 'above',
        relatedProject: enItem.relatedProject || deItem.relatedProject,
        widgetImage: enItem.widgetImage || deItem.widgetImage,
        widgetButtonLink: enItem.widgetButtonLink || deItem.widgetButtonLink,
        openByDefault: enItem.openByDefault !== undefined ? enItem.openByDefault : deItem.openByDefault,

        // Localized fields
        title: {
          en: enItem.title || '',
          de: deItem.title || ''
        },
        description: {
          en: enItem.description || '',
          de: deItem.description || ''
        },
        widgetButtonLabel: {
          en: enItem.widgetButtonLabel || '',
          de: deItem.widgetButtonLabel || ''
        },

        // Localized visibility switches
        isVisibleEn: enItem.isVisible !== undefined ? enItem.isVisible : true,
        isVisibleDe: deItem.isVisible !== undefined ? deItem.isVisible : true,

        milestoneEvents: []
      };

      // Merge milestone events inside timeline entries
      const enMilestones = enItem.milestoneEvents || [];
      const deMilestones = deItem.milestoneEvents || [];
      const maxMilestones = Math.max(enMilestones.length, deMilestones.length);

      for (let j = 0; j < maxMilestones; j++) {
        const enMs = enMilestones[j] || {};
        const deMs = deMilestones[j] || {};

        const mergedMs = {
          _key: enMs._key || deMs._key || `milestone-item-${i}-${j}`,
          date: enMs.date || deMs.date,
          color: enMs.color || deMs.color || 'primary',
          relatedProject: enMs.relatedProject || deMs.relatedProject,
          widgetImage: enMs.widgetImage || deMs.widgetImage,
          widgetButtonLink: enMs.widgetButtonLink || deMs.widgetButtonLink,
          openByDefault: enMs.openByDefault !== undefined ? enMs.openByDefault : deMs.openByDefault,

          // Localized fields
          title: {
            en: enMs.title || '',
            de: deMs.title || ''
          },
          description: {
            en: enMs.description || '',
            de: deMs.description || ''
          },
          widgetButtonLabel: {
            en: enMs.widgetButtonLabel || '',
            de: deMs.widgetButtonLabel || ''
          },

          // Localized visibility switches
          isVisibleEn: enMs.isVisible !== undefined ? enMs.isVisible : true,
          isVisibleDe: deMs.isVisible !== undefined ? deMs.isVisible : true
        };

        mergedItem.milestoneEvents.push(mergedMs);
      }

      mergedDoc.timeline.push(mergedItem);
    }

    console.log('Writing unified Home Page singleton document to Sanity dataset...');
    await client.createOrReplace(mergedDoc);
    console.log('Successfully created/replaced "homePage" singleton document!');

    // Delete old documents
    if (enDoc) {
      console.log(`Deleting old English document (${enDoc._id})...`);
      await client.delete(enDoc._id);
    }
    if (deDoc) {
      console.log(`Deleting old German document (${deDoc._id})...`);
      await client.delete(deDoc._id);
    }

    console.log('Migration finished successfully!');
  } catch (err) {
    console.error('Error running migration:', err);
    process.exit(1);
  }
}

runMigration();
