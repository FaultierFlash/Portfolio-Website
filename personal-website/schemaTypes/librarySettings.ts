import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'librarySettings',
  title: 'Library Page Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'titleEn',
      title: 'Title (English)',
      type: 'string',
    }),
    defineField({
      name: 'titleDe',
      title: 'Title (German)',
      type: 'string',
    }),
    defineField({
      name: 'subtitleEn',
      title: 'Subtitle (English)',
      type: 'text',
    }),
    defineField({
      name: 'subtitleDe',
      title: 'Subtitle (German)',
      type: 'text',
    }),
    defineField({
      name: 'backgroundEffect',
      title: 'Background Effect',
      type: 'string',
      options: {
        list: [
          { title: 'None', value: 'none' },
          { title: 'Subtle Grid', value: 'grid' },
          { title: 'Subtle Dots', value: 'dots' },
          { title: 'Topography', value: 'topography' },
          { title: 'Solar System', value: 'solar' },
        ],
      },
    }),
    defineField({
      name: 'accentColor',
      title: 'Accent Color',
      type: 'string',
      options: {
        list: [
          { title: 'Primary (Orange)', value: 'primary' },
          { title: 'Blue', value: 'blue' },
          { title: 'Green', value: 'green' },
          { title: 'Purple', value: 'purple' },
          { title: 'Rose', value: 'rose' },
          { title: 'Gray', value: 'gray' },
        ],
      },
    }),
    defineField({
      name: 'solarConfig',
      title: 'Solar System Configuration',
      type: 'object',
      hidden: ({ document }) => document?.backgroundEffect !== 'solar',
      fields: [
        defineField({
          name: 'speed',
          title: 'Simulation Speed',
          type: 'number',
          initialValue: 1.0,
          validation: (Rule) => Rule.min(0.1).max(10.0),
        }),
        defineField({
          name: 'cursorGravity',
          title: 'Cursor Gravity Strength',
          type: 'number',
          initialValue: 1.0,
          validation: (Rule) => Rule.min(0).max(10.0),
        }),
        defineField({
          name: 'startZoom',
          title: 'Initial Zoom Level',
          type: 'number',
          initialValue: 1.0,
          validation: (Rule) => Rule.min(0.1).max(5.0),
        }),
      ],
    }),
    defineField({
      name: 'topographyConfig',
      title: 'Topography Configuration',
      type: 'object',
      hidden: ({ document }) => document?.backgroundEffect !== 'topography',
      fields: [
        defineField({
          name: 'source',
          title: 'Data Source',
          type: 'string',
          options: {
            list: [
              { title: 'Earth (API)', value: 'earth' },
              { title: 'Mars (Olympic Mons)', value: 'mars-olympus' },
              { title: 'Mars (Gale Crater)', value: 'mars-gale' },
              { title: 'Procedural Mars', value: 'mars-procedural' },
            ],
          },
          initialValue: 'earth',
        }),
        defineField({
          name: 'latitude',
          title: 'Latitude',
          type: 'number',
          hidden: ({ parent }) => parent?.source !== 'earth',
        }),
        defineField({
          name: 'longitude',
          title: 'Longitude',
          type: 'number',
          hidden: ({ parent }) => parent?.source !== 'earth',
        }),
        defineField({
          name: 'intensity',
          title: 'Contour Intensity',
          type: 'number',
          initialValue: 1.0,
          validation: (Rule) => Rule.min(0.1).max(5.0),
        }),
        defineField({
          name: 'scale',
          title: 'Map Scale (Zoom)',
          type: 'number',
          initialValue: 1.0,
          validation: (Rule) => Rule.min(0.1).max(10.0),
        }),
      ],
    }),
  ],
})
