import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'notesSettings',
  title: 'Notes Page Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'enabled',
      title: 'Enable Lab Notebook',
      type: 'boolean',
      description: 'When disabled, the Notes link is hidden from the navigation and visitors see a "Research in Progress" page. You can still preview the notebook at /notes?preview=true.',
      initialValue: false,
    }),
    defineField({
      name: 'titleEn',
      title: 'Title (English)',
      type: 'string',
      initialValue: 'Lab Notebook',
    }),
    defineField({
      name: 'titleDe',
      title: 'Title (German)',
      type: 'string',
      initialValue: 'Labor-Notizbuch',
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
  ],
})
