import { defineField, defineType } from 'sanity'

export const book = defineType({
  name: 'book',
  title: 'Personal Library',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'series',
      title: 'Series Name',
      type: 'string',
      description: 'Optional: Name of the series this book belongs to.',
    }),
    defineField({
      name: 'seriesOrder',
      title: 'Series Order',
      type: 'number',
      description: 'Optional: The order of this book within the series.',
      hidden: ({ document }) => !document?.series,
    }),
    defineField({
      name: 'cover',
      title: 'Book Cover',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'status',
      title: 'Reading Status',
      type: 'string',
      options: {
        list: [
          { title: 'Shortlist', value: 'shortlist' },
          { title: 'Reading', value: 'reading' },
          { title: 'Finished', value: 'finished' },
        ],
      },
      initialValue: 'shortlist',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'progress',
      title: 'Progress (%)',
      type: 'number',
      description: 'Percentage of the book completed.',
      initialValue: 0,
      validation: (Rule) => Rule.min(0).max(100),
      hidden: ({ document }) => document?.status !== 'reading',
    }),
    defineField({
      name: 'rating',
      title: 'Personal Rating',
      type: 'number',
      description: 'Rating from 1 to 5 stars.',
      options: {
        list: [1, 2, 3, 4, 5],
      },
      hidden: ({ document }) => document?.status !== 'finished',
    }),
    defineField({
      name: 'reviewEn',
      title: 'Review (English)',
      type: 'text',
      rows: 4,
      hidden: ({ document }) => document?.status === 'shortlist',
    }),
    defineField({
      name: 'reviewDe',
      title: 'Review (German)',
      type: 'text',
      rows: 4,
      hidden: ({ document }) => document?.status === 'shortlist',
    }),
    defineField({
      name: 'genres',
      title: 'Genres / Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'sortDate',
      title: 'Sorting Date (Internal)',
      type: 'date',
      description: 'Hidden date used for custom sorting (Month precision).',
      options: {
        dateFormat: 'YYYY-MM',
      },
    }),
    defineField({
      name: 'dateFinished',
      title: 'Date Finished (Display)',
      type: 'date',
      hidden: ({ document }) => document?.status !== 'finished',
    }),
    defineField({
      name: 'physicalCopy',
      title: 'Physical Copy Available?',
      type: 'boolean',
      initialValue: false,
      description: 'Check if you own a physical copy of this book.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      media: 'cover',
    },
    prepare({ title, author, media }) {
      return {
        title,
        subtitle: author,
        media,
      }
    },
  },
})
