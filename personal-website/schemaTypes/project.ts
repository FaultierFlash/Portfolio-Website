import { defineField, defineType } from 'sanity'

export const project = defineType({
    name: 'project',
    title: 'Project',
    type: 'document',
    fields: [
        defineField({
            name: 'order',
            title: 'Order',
            type: 'number',
            description: 'Order of the project in the list (1, 2, 3...)',
            validation: (rule) => rule.required().integer(),
        }),
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'mainImage',
            title: 'Main image',
            type: 'image',
            options: {
                hotspot: true,
            },
            fields: [
                {
                    name: 'alt',
                    type: 'string',
                    title: 'Alternative Text',
                }
            ]
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 4,
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
            name: 'link',
            title: 'Project Link',
            type: 'url',
        }),
        defineField({
            name: 'locale',
            title: 'Locale',
            type: 'string',
            options: {
                list: [
                    { title: 'English', value: 'en' },
                    { title: 'German', value: 'de' },
                ],
            },
            initialValue: 'en',
        }),
        defineField({
            name: 'backgroundEffect',
            title: 'Background Effect',
            type: 'string',
            description: 'Choose a background visual effect for this project page.',
            options: {
                list: [
                    { title: 'None', value: 'none' },
                    { title: 'Subtle Grid', value: 'grid' },
                    { title: 'Subtle Dots', value: 'dots' },
                ],
            },
            initialValue: 'none',
        }),
    ],
})
