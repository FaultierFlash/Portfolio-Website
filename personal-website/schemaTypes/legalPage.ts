import { defineField, defineType } from 'sanity'

export const legalPage = defineType({
    name: 'legalPage',
    title: 'Legal Page',
    type: 'document',
    fields: [
        defineField({
            name: 'type',
            title: 'Page Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Terms of Service', value: 'terms' },
                    { title: 'Privacy Policy', value: 'privacy' },
                    { title: 'Impressum (Legal Notice)', value: 'impressum' },
                ],
            },
            validation: (rule) => rule.required(),
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
            validation: (rule) => rule.required(),
            initialValue: 'en',
        }),
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'content',
            title: 'Content (Markdown)',
            type: 'markdown',
            validation: (rule) => rule.required(),
        }),
    ],
    preview: {
        select: {
            title: 'title',
            type: 'type',
            locale: 'locale',
        },
        prepare(selection) {
            const typeLabels: Record<string, string> = {
                terms: 'Terms of Service',
                privacy: 'Privacy Policy',
                impressum: 'Impressum',
            }
            const typeLabel = typeLabels[selection.type] || selection.type
            return {
                title: selection.title,
                subtitle: `${typeLabel} (${selection.locale.toUpperCase()})`,
            }
        },
    },
})
