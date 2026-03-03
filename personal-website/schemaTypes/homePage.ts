import { defineField, defineType } from 'sanity'

export const homePage = defineType({
    name: 'homePage',
    title: 'Home Page',
    type: 'document',
    fields: [
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
            name: 'heroTitle',
            title: 'Hero Title',
            type: 'string',
        }),
        defineField({
            name: 'heroSubtitle',
            title: 'Hero Subtitle',
            type: 'text',
            rows: 2,
        }),
        defineField({
            name: 'profileImage',
            title: 'Profile Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'aboutText',
            title: 'About Text',
            type: 'text',
            rows: 5,
        }),
    ],
    preview: {
        select: {
            title: 'heroTitle',
            locale: 'locale',
        },
        prepare(selection) {
            return {
                title: `Home Page (${selection.locale})`,
                subtitle: selection.title,
            }
        },
    },
})
