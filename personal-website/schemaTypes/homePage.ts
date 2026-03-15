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
        defineField({
            name: 'backgroundEffect',
            title: 'Background Effect',
            type: 'string',
            description: 'Choose a background visual effect for this page.',
            options: {
                list: [
                    { title: 'None', value: 'none' },
                    { title: 'Subtle Grid', value: 'grid' },
                    { title: 'Subtle Dots', value: 'dots' },
                ],
            },
            initialValue: 'none',
        }),
        defineField({
            name: 'featuredProjects',
            title: 'Featured Projects',
            type: 'array',
            description: 'Select the projects you want to feature as full-screen slides on the homepage.',
            of: [{ type: 'reference', to: [{ type: 'project' }] }],
            validation: Rule => Rule.max(5)
        }),
        defineField({
            name: 'timelineStartDate',
            title: 'Global Timeline Start Date',
            type: 'date',
            description: 'The starting boundary for the visible timeline track (e.g. 2018-01-01). Events earlier than this will be visually clipped to start at the boundary.',
            options: { dateFormat: 'YYYY-MM-DD' },
        }),
        defineField({
            name: 'timelineEndDate',
            title: 'Global Timeline End Date',
            type: 'date',
            description: 'The ending boundary for the timeline (leave blank to default to today).',
            options: { dateFormat: 'YYYY-MM-DD' },
        }),
        defineField({
            name: 'timelineScale',
            title: 'Timeline Scale (Zoom Level)',
            type: 'number',
            description: 'Adjust how wide (in pixels) one year should be rendered. A larger number spreads items further apart.',
            initialValue: 400,
            validation: Rule => Rule.min(100).max(3000)
        }),
        defineField({
            name: 'timeline',
            title: 'Journey Timeline',
            type: 'array',
            description: 'Add milestones for your horizontal scroll journey. Fill both dates for a duration bar, or just Start Date for a single point-event.',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'title', title: 'Milestone Title', type: 'string', validation: Rule => Rule.required() },
                        { name: 'description', title: 'Detailed Info (shown on hover)', type: 'text', rows: 3 },
                        { name: 'startDate', title: 'Start Date', type: 'date', options: { dateFormat: 'YYYY-MM-DD' }, validation: Rule => Rule.required() },
                        { name: 'endDate', title: 'End Date', type: 'date', options: { dateFormat: 'YYYY-MM-DD' } },
                        { name: 'isOngoing', title: 'Is Ongoing?', type: 'boolean', description: 'Check this if the item continues to the present day.', initialValue: false },
                        {
                            name: 'color',
                            title: 'Accent Color',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'Primary (Orange)', value: 'primary' },
                                    { title: 'Blue', value: 'blue' },
                                    { title: 'Green', value: 'green' },
                                    { title: 'Purple', value: 'purple' },
                                    { title: 'Rose/Red', value: 'rose' },
                                    { title: 'Neutral Gray', value: 'gray' },
                                ]
                            },
                            initialValue: 'primary'
                        },
                        {
                            name: 'verticalPosition',
                            title: 'Vertical Placement (Track)',
                            type: 'string',
                            description: 'Choose which vertical track this event sits on relative to the center axis.',
                            options: {
                                list: [
                                    { title: 'Far Above (-24)', value: 'far-above' },
                                    { title: 'Above (-12)', value: 'above' },
                                    { title: 'Below (+12)', value: 'below' },
                                    { title: 'Far Below (+24)', value: 'far-below' },
                                ]
                            },
                            initialValue: 'above'
                        }
                    ]
                }
            ]
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
