import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'socialsSettings',
  title: 'Social Links Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'linkedin',
      title: 'LinkedIn',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Enable LinkedIn Link',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'url',
          title: 'LinkedIn Profile URL',
          type: 'url',
          initialValue: 'https://linkedin.com/in/marlon-müller',
        }),
      ],
    }),
    defineField({
      name: 'github',
      title: 'GitHub',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Enable GitHub Link',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'url',
          title: 'GitHub Profile URL',
          type: 'url',
          initialValue: 'https://github.com/FaultierFlash',
        }),
      ],
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Enable Instagram Link',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'url',
          title: 'Instagram Profile URL',
          type: 'url',
        }),
      ],
    }),
  ],
})
