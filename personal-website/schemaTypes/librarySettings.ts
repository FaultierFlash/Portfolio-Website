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
          { title: 'Topography', value: 'topography' },
          { title: 'Grid', value: 'grid' },
          { title: 'Dots', value: 'dots' },
          { title: 'Stars', value: 'stars' },
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
      name: 'topographyConfig',
      title: 'Topography Configuration',
      type: 'object',
      hidden: ({ document }) => document?.backgroundEffect !== 'topography',
      fields: [
        defineField({ name: 'color', type: 'string', initialValue: 'rgba(0,0,0,0.05)' }),
        defineField({ name: 'opacity', type: 'number', initialValue: 0.5 }),
      ]
    }),
  ],
})
