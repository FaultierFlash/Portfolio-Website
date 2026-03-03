import { defineField, defineType } from 'sanity'

export const translationOverride = defineType({
    name: 'translationOverride',
    title: 'Translation Override',
    type: 'document',
    fields: [
        defineField({
            name: 'key',
            title: 'Translation Key',
            type: 'string',
            description: 'The key path used in the code (e.g., "terminal.welcome1")',
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
            name: 'value',
            title: 'Value',
            type: 'text',
            description: 'The translated text to use instead of the hardcoded default.',
            rows: 3,
            validation: (rule) => rule.required(),
        }),
    ],
    preview: {
        select: {
            title: 'key',
            subtitle: 'value',
            locale: 'locale',
        },
        prepare(selection) {
            const { title, subtitle, locale } = selection
            return {
                title: `${title} (${locale})`,
                subtitle: subtitle,
            }
        },
    },
})
