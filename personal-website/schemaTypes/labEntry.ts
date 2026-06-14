import { defineField, defineType } from 'sanity'

export const labEntry = defineType({
  name: 'labEntry',
  title: 'Lab Notebook',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Experiment', value: 'experiment' },
          { title: 'Simulation', value: 'simulation' },
          { title: 'Build', value: 'build' },
          { title: 'Observation', value: 'observation' },
          { title: 'Literature', value: 'literature' },
          { title: 'Idea', value: 'idea' },
        ],
      },
      initialValue: 'observation',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'English', value: 'en' },
          { title: 'German', value: 'de' },
        ],
      },
      initialValue: 'en',
      description: 'Language this entry is written in (for future filtering).',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'markdown',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'relatedProject',
      title: 'Related Project',
      type: 'reference',
      to: [{ type: 'project' }],
      description: 'Optional: Link to a related project.',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
        ],
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
      description: 'Only published entries appear on the site.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      category: 'category',
    },
    prepare({ title, date, category }) {
      return {
        title,
        subtitle: `${date} · ${category}`,
      }
    },
  },
})
