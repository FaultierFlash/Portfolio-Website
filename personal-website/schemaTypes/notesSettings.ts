import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'notesSettings',
  title: 'Notes Page Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'enabled',
      title: 'Enable Lab Notebook (Production / Main)',
      type: 'boolean',
      description: 'Controls public visibility on production (main branch / marlonmueller.eu). Completely independent from the Dev/Preview toggle. You can still preview at /notes?preview=true.',
      initialValue: false,
    }),
    defineField({
      name: 'enabledInDev',
      title: 'Enable Lab Notebook (Dev / Preview / Local)',
      type: 'boolean',
      description: 'Controls visibility independently on non-production environments (dev branch deploys, deploy previews, and localhost). Merging dev into main never enables Notes on production.',
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
  preview: {
    select: {
      enabled: 'enabled',
      enabledInDev: 'enabledInDev',
    },
    prepare({ enabled, enabledInDev }) {
      return {
        title: 'Notes Page Settings',
        subtitle: `Prod: ${enabled ? 'ON' : 'OFF'} · Dev: ${enabledInDev ? 'ON' : 'OFF'}`,
      }
    },
  },
})
