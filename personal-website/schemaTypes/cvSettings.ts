import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'cvSettings',
  title: 'CV & Resume Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'mode',
      title: 'CV Mode',
      type: 'string',
      description: 'Choose whether to generate the CV from structured data or use a manually uploaded PDF.',
      options: {
        list: [
          { title: 'Dynamically Generated (Website Theme)', value: 'generated' },
          { title: 'Manual PDF Upload', value: 'manual' },
        ],
        layout: 'radio',
      },
      initialValue: 'generated',
    }),
    defineField({
      name: 'manualPdf',
      title: 'Manual PDF File',
      type: 'file',
      description: 'Upload a custom PDF resume to be served when in Manual mode.',
      options: {
        accept: '.pdf',
      },
      hidden: ({ document }) => document?.mode !== 'manual',
    }),
    defineField({
      name: 'personalInfo',
      title: 'Personal & Contact Information',
      type: 'object',
      fields: [
        defineField({ name: 'name', title: 'Full Name', type: 'string' }),
        defineField({ name: 'titleEn', title: 'Professional Title (English)', type: 'string' }),
        defineField({ name: 'titleDe', title: 'Professional Title (German)', type: 'string' }),
        defineField({ name: 'email', title: 'Email', type: 'string' }),
        defineField({ name: 'phone', title: 'Phone', type: 'string' }),
        defineField({ name: 'locationEn', title: 'Location (English)', type: 'string' }),
        defineField({ name: 'locationDe', title: 'Location (German)', type: 'string' }),
        defineField({ name: 'website', title: 'Website URL', type: 'string' }),
        defineField({ name: 'linkedin', title: 'LinkedIn URL', type: 'string' }),
        defineField({ name: 'github', title: 'GitHub URL', type: 'string' }),
        defineField({ name: 'photo', title: 'Profile Photo / Headshot', type: 'image', options: { hotspot: true } }),
      ],
    }),
    defineField({
      name: 'experience',
      title: 'Practical Experience',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'roleEn', title: 'Role Title (English)', type: 'string' }),
            defineField({ name: 'roleDe', title: 'Role Title (German)', type: 'string' }),
            defineField({ name: 'company', title: 'Organization / Company', type: 'string' }),
            defineField({ name: 'periodEn', title: 'Time Period (English)', type: 'string' }),
            defineField({ name: 'periodDe', title: 'Time Period (German)', type: 'string' }),
            defineField({
              name: 'highlightsEn',
              title: 'Highlights / Bullet Points (English)',
              type: 'array',
              of: [{ type: 'string' }],
            }),
            defineField({
              name: 'highlightsDe',
              title: 'Highlights / Bullet Points (German)',
              type: 'array',
              of: [{ type: 'string' }],
            }),
          ],
          preview: {
            select: {
              title: 'roleEn',
              subtitle: 'company',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'education',
      title: 'Education',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'degreeEn', title: 'Degree / Certificate (English)', type: 'string' }),
            defineField({ name: 'degreeDe', title: 'Degree / Certificate (German)', type: 'string' }),
            defineField({ name: 'institution', title: 'Institution', type: 'string' }),
            defineField({ name: 'periodEn', title: 'Time Period (English)', type: 'string' }),
            defineField({ name: 'periodDe', title: 'Time Period (German)', type: 'string' }),
            defineField({
              name: 'detailsEn',
              title: 'Details & Achievements (English)',
              type: 'array',
              of: [{ type: 'string' }],
            }),
            defineField({
              name: 'detailsDe',
              title: 'Details & Achievements (German)',
              type: 'array',
              of: [{ type: 'string' }],
            }),
          ],
          preview: {
            select: {
              title: 'degreeEn',
              subtitle: 'institution',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'skills',
      title: 'Skills & Toolchain',
      type: 'object',
      fields: [
        defineField({
          name: 'coding',
          title: 'Programming & Computation',
          type: 'array',
          of: [{ type: 'string' }],
        }),
        defineField({
          name: 'webDev',
          title: 'Web & Systems Development',
          type: 'array',
          of: [{ type: 'string' }],
        }),
        defineField({
          name: 'engineeringCad',
          title: 'CAD & Hardware Engineering',
          type: 'array',
          of: [{ type: 'string' }],
        }),
        defineField({
          name: 'languagesEn',
          title: 'Languages (English)',
          type: 'array',
          of: [{ type: 'string' }],
        }),
        defineField({
          name: 'languagesDe',
          title: 'Languages (German)',
          type: 'array',
          of: [{ type: 'string' }],
        }),
      ],
    }),
    defineField({
      name: 'volunteering',
      title: 'Volunteering & Leadership',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'roleEn', title: 'Role Title (English)', type: 'string' }),
            defineField({ name: 'roleDe', title: 'Role Title (German)', type: 'string' }),
            defineField({ name: 'organization', title: 'Organization', type: 'string' }),
            defineField({ name: 'periodEn', title: 'Time Period (English)', type: 'string' }),
            defineField({ name: 'periodDe', title: 'Time Period (German)', type: 'string' }),
            defineField({
              name: 'detailsEn',
              title: 'Details (English)',
              type: 'array',
              of: [{ type: 'string' }],
            }),
            defineField({
              name: 'detailsDe',
              title: 'Details (German)',
              type: 'array',
              of: [{ type: 'string' }],
            }),
          ],
          preview: {
            select: {
              title: 'roleEn',
              subtitle: 'organization',
            },
          },
        },
      ],
    }),
  ],
})
