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
                    { title: 'Topography', value: 'topography' },
                    { title: 'Solar System', value: 'solar' },
                ],
            },
            initialValue: 'none',
        }),
        defineField({
            name: 'solarConfig',
            title: 'Solar System Configuration',
            type: 'object',
            hidden: ({ document }) => document?.backgroundEffect !== 'solar',
            fields: [
                defineField({
                    name: 'speed',
                    title: 'Simulation Speed',
                    type: 'number',
                    initialValue: 1.0,
                    validation: Rule => Rule.min(0.1).max(10.0),
                }),
                defineField({
                    name: 'cursorGravity',
                    title: 'Cursor Gravity Strength',
                    type: 'number',
                    initialValue: 1.0,
                    description: 'How strongly the mouse cursor pulls objects. (Default: 1.0)',
                    validation: Rule => Rule.min(0).max(10.0),
                }),
                defineField({
                    name: 'startZoom',
                    title: 'Initial Zoom Level',
                    type: 'number',
                    initialValue: 1.0,
                    description: 'The starting scale of the solar system. (Default: 1.0)',
                    validation: Rule => Rule.min(0.1).max(5.0),
                }),
            ],
        }),
        defineField({
            name: 'topographyConfig',
            title: 'Topography Configuration',
            type: 'object',
            hidden: ({ document }) => document?.backgroundEffect !== 'topography',
            fields: [
                defineField({
                    name: 'source',
                    title: 'Data Source',
                    type: 'string',
                    options: {
                        list: [
                            { title: 'Earth (API)', value: 'earth' },
                            { title: 'Mars (Olympic Mons)', value: 'mars-olympus' },
                            { title: 'Mars (Gale Crater)', value: 'mars-gale' },
                            { title: 'Procedural Mars', value: 'mars-procedural' },
                        ],
                    },
                    initialValue: 'earth',
                }),
                defineField({
                    name: 'latitude',
                    title: 'Latitude',
                    type: 'number',
                    description: 'Used for Earth API data (e.g. 52.5200 for Berlin).',
                    hidden: ({ parent }) => parent?.source !== 'earth',
                }),
                defineField({
                    name: 'longitude',
                    title: 'Longitude',
                    type: 'number',
                    description: 'Used for Earth API data (e.g. 13.4050 for Berlin).',
                    hidden: ({ parent }) => parent?.source !== 'earth',
                }),
                defineField({
                    name: 'intensity',
                    title: 'Contour Intensity',
                    type: 'number',
                    initialValue: 1.0,
                    validation: Rule => Rule.min(0.1).max(5.0),
                }),
                defineField({
                    name: 'scale',
                    title: 'Map Scale (Zoom)',
                    type: 'number',
                    initialValue: 1.0,
                    description: 'Adjust the detail density. Larger values show more zoomed-in features.',
                    validation: Rule => Rule.min(0.1).max(10.0),
                }),
            ],
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
                            name: 'isVisible',
                            title: 'Is Visible?',
                            type: 'boolean',
                            initialValue: true,
                            description: 'If unchecked, this event will be hidden from the website.'
                        },
                        {
                            name: 'openByDefault',
                            title: 'Open Info Card by Default?',
                            type: 'boolean',
                            initialValue: false,
                            description: 'If checked, this event\'s info card will be open by default on page load.'
                        },
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
                        },
                        {
                            name: 'relatedProject',
                            title: 'Related Project (Optional Link)',
                            type: 'reference',
                            to: [{ type: 'project' }],
                            description: 'If you link a project here, clicking this timeline event will navigate to the project page, and the event will inherit the project\'s accent color automatically.',
                        },
                        {
                            name: 'widgetImage',
                            title: 'Widget Image (Optional)',
                            type: 'image',
                            options: { hotspot: true },
                            description: 'Optional image to display in the custom timeline widget.'
                        },
                        {
                            name: 'widgetButtonLabel',
                            title: 'Widget Button Label (Optional)',
                            type: 'string',
                            description: 'Label for the widget button (e.g. "View Demo").'
                        },
                        {
                            name: 'widgetButtonLink',
                            title: 'Widget Button Link (Optional)',
                            type: 'url',
                            description: 'URL link for the widget button.'
                        },
                        {
                            name: 'milestoneEvents',
                            title: 'Project Milestone Events',
                            type: 'array',
                            description: 'Add multiple specific sub-events or milestones related to this timeline period (e.g. key moments in a project).',
                            hidden: ({ parent }) => !parent?.isOngoing && !parent?.endDate,
                            of: [
                                {
                                    type: 'object',
                                    fields: [
                                        { name: 'title', title: 'Event Title', type: 'string', validation: Rule => Rule.required() },
                                        { name: 'date', title: 'Event Date', type: 'date', options: { dateFormat: 'YYYY-MM-DD' }, validation: Rule => Rule.required() },
                                        {
                                            name: 'isVisible',
                                            title: 'Is Visible?',
                                            type: 'boolean',
                                            initialValue: true,
                                            description: 'If unchecked, this sub-event will be hidden from the website.'
                                        },
                                        {
                                            name: 'openByDefault',
                                            title: 'Open Info Card by Default?',
                                            type: 'boolean',
                                            initialValue: false,
                                            description: 'If checked, this milestone\'s info card will be open by default on page load.'
                                        },
                                        { name: 'description', title: 'Details', type: 'text', rows: 2 },
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
                                            name: 'relatedProject',
                                            title: 'Related Project',
                                            type: 'reference',
                                            to: [{ type: 'project' }],
                                            description: 'Optional link to a specific project mentioned in this event.'
                                        },
                                        {
                                            name: 'widgetImage',
                                            title: 'Widget Image (Optional)',
                                            type: 'image',
                                            options: { hotspot: true },
                                            description: 'Optional image to display in the subentry widget.'
                                        },
                                        {
                                            name: 'widgetButtonLabel',
                                            title: 'Widget Button Label (Optional)',
                                            type: 'string',
                                            description: 'Label for the subentry widget button.'
                                        },
                                        {
                                            name: 'widgetButtonLink',
                                            title: 'Widget Button Link (Optional)',
                                            type: 'url',
                                            description: 'URL link for the subentry widget button.'
                                        }
                                    ]
                                }
                            ]
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
