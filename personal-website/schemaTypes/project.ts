import { defineField, defineType } from 'sanity'
import { airflowConfigField, backgroundEffectList } from './airflowConfigField'

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
            name: 'publishDate',
            title: 'Publish Date',
            type: 'date',
            description: 'Publication or launch date displayed on project pages and cards.',
            options: { dateFormat: 'YYYY-MM-DD' },
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
            type: 'object',
            fields: [
                { name: 'en', title: 'English', type: 'text', rows: 4 },
                { name: 'de', title: 'German', type: 'text', rows: 4 }
            ]
        }),
        defineField({
            name: 'body',
            title: 'Project Body (Markdown)',
            type: 'object',
            fields: [
                { name: 'en', title: 'English Body', type: 'markdown' },
                { name: 'de', title: 'German Body', type: 'markdown' }
            ]
        }),
        defineField({
            name: 'gallery',
            title: 'Project Gallery / Media Assets',
            type: 'array',
            description: 'Upload images for this project. They will appear in the project gallery below the text, and you can also copy their URLs to embed directly inside the Markdown body.',
            of: [
                {
                    type: 'image',
                    options: {
                        hotspot: true,
                    },
                    fields: [
                        {
                            name: 'caption',
                            type: 'string',
                            title: 'Caption',
                        },
                        {
                            name: 'alt',
                            type: 'string',
                            title: 'Alternative Text',
                        },
                    ],
                },
            ],
            options: {
                layout: 'grid',
            },
        }),
        defineField({
            name: 'documents',
            title: 'Project Documents & Downloads',
            type: 'array',
            description: 'Upload downloadable files (PDFs, whitepapers, datasheets, ZIPs, etc.). They will appear as download cards below the project description and their URLs can also be copied for Markdown links.',
            of: [
                {
                    type: 'file',
                    fields: [
                        {
                            name: 'title',
                            type: 'string',
                            title: 'Document Title',
                            description: 'e.g. "Research Paper (PDF)", "CAD Schematic (ZIP)"',
                            validation: (rule) => rule.required(),
                        },
                        {
                            name: 'description',
                            type: 'string',
                            title: 'Short Description',
                        },
                        {
                            name: 'language',
                            type: 'string',
                            title: 'Language',
                            options: {
                                list: [
                                    { title: 'All / Multilingual', value: 'all' },
                                    { title: 'English only', value: 'en' },
                                    { title: 'German only', value: 'de' },
                                ],
                            },
                            initialValue: 'all',
                        },
                    ],
                },
            ],
        }),
        defineField({
            name: 'languages',
            title: 'Active Languages',
            type: 'array',
            of: [{ type: 'string' }],
            options: {
                list: [
                    { title: 'English', value: 'en' },
                    { title: 'German', value: 'de' },
                ],
            },
            initialValue: ['en', 'de'],
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
            name: 'metrics',
            title: 'Key Metrics / KPIs (Optional)',
            type: 'array',
            description: 'Up to 4 quantitative highlights shown on featured slides and project headers (omitted if empty).',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'label',
                            title: 'Metric Label',
                            type: 'object',
                            fields: [
                                { name: 'en', title: 'English', type: 'string' },
                                { name: 'de', title: 'German', type: 'string' },
                            ],
                        },
                        { name: 'value', title: 'Value', type: 'string' },
                        { name: 'unit', title: 'Unit (Optional)', type: 'string' },
                    ],
                    preview: {
                        select: { label: 'label.en', value: 'value', unit: 'unit' },
                        prepare({ label, value, unit }) {
                            return { title: `${value || ''} ${unit || ''}`.trim() || 'Metric', subtitle: label || '' }
                        },
                    },
                },
            ],
        }),
        defineField({
            name: 'specs',
            title: 'Technical Specifications (Optional)',
            type: 'object',
            description: 'Every sub-field is optional; only populated entries appear on the project page.',
            options: { collapsible: true, collapsed: true },
            fields: [
                {
                    name: 'role',
                    title: 'Role & Ownership',
                    type: 'object',
                    fields: [
                        { name: 'en', title: 'English', type: 'string' },
                        { name: 'de', title: 'German', type: 'string' },
                    ],
                },
                { name: 'timeline', title: 'Timeline / Period', type: 'string' },
                {
                    name: 'status',
                    title: 'Project Status',
                    type: 'object',
                    fields: [
                        { name: 'en', title: 'English', type: 'string' },
                        { name: 'de', title: 'German', type: 'string' },
                    ],
                },
                { name: 'stack', title: 'Core Stack / Methods', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } },
                {
                    name: 'outcome',
                    title: 'Key Outcome / Validation',
                    type: 'object',
                    fields: [
                        { name: 'en', title: 'English', type: 'string' },
                        { name: 'de', title: 'German', type: 'string' },
                    ],
                },
                { name: 'repoUrl', title: 'Source Repository URL', type: 'url' },
                { name: 'paperUrl', title: 'Paper / Documentation URL', type: 'url' },
            ],
        }),
        defineField({
            name: 'customSpecs',
            title: 'Custom Specification Rows (Optional)',
            type: 'array',
            description: 'Add arbitrary domain-specific rows (e.g. Airfoil, Mass Budget, Sensors).',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'label',
                            title: 'Label',
                            type: 'object',
                            fields: [
                                { name: 'en', title: 'English', type: 'string' },
                                { name: 'de', title: 'German', type: 'string' },
                            ],
                        },
                        {
                            name: 'value',
                            title: 'Value',
                            type: 'object',
                            fields: [
                                { name: 'en', title: 'English', type: 'string' },
                                { name: 'de', title: 'German', type: 'string' },
                            ],
                        },
                    ],
                    preview: {
                        select: { title: 'label.en', subtitle: 'value.en' },
                    },
                },
            ],
        }),
        defineField({
            name: 'showcaseVideos',
            title: 'Prototype / Flight-Test Videos (Optional)',
            type: 'array',
            description: 'Upload short MP4/WebM prototype loops or link an external video asset.',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'videoFile', title: 'Video File (MP4/WebM)', type: 'file', options: { accept: 'video/mp4,video/webm' } },
                        { name: 'videoUrl', title: 'Or External Video URL', type: 'url' },
                        { name: 'poster', title: 'Poster Frame (Optional)', type: 'image', options: { hotspot: true } },
                        {
                            name: 'caption',
                            title: 'Caption',
                            type: 'object',
                            fields: [
                                { name: 'en', title: 'English', type: 'string' },
                                { name: 'de', title: 'German', type: 'string' },
                            ],
                        },
                        { name: 'autoplayLoop', title: 'Muted Autoplay Loop?', type: 'boolean', initialValue: true },
                    ],
                },
            ],
        }),
        defineField({
            name: 'cadModels',
            title: '3D CAD Assemblies (.glb / .gltf, Optional)',
            type: 'array',
            description: 'Upload exported .glb/.gltf prototype CAD models for interactive 3D orbit inspection.',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'glbFile', title: '3D Model (.glb / .gltf)', type: 'file', options: { accept: '.glb,.gltf,model/gltf-binary,model/gltf+json' }, validation: (rule) => rule.required() },
                        {
                            name: 'title',
                            title: 'Model Title',
                            type: 'object',
                            fields: [
                                { name: 'en', title: 'English', type: 'string' },
                                { name: 'de', title: 'German', type: 'string' },
                            ],
                        },
                        {
                            name: 'caption',
                            title: 'Caption',
                            type: 'object',
                            fields: [
                                { name: 'en', title: 'English', type: 'string' },
                                { name: 'de', title: 'German', type: 'string' },
                            ],
                        },
                        { name: 'initialOrbit', title: 'Initial Camera Orbit (Optional)', type: 'string', description: 'e.g. "45deg 65deg 105%"' },
                    ],
                },
            ],
        }),
        defineField({
            name: 'backgroundEffect',
            title: 'Background Effect',
            type: 'string',
            description: 'Choose a background visual effect for this project page.',
            options: {
                list: backgroundEffectList,
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
        airflowConfigField,
        defineField({
            name: 'accentColor',
            title: 'Project Accent Color',
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
            initialValue: 'primary',
            description: 'This accent color overrides the global primary color on the project slide, link buttons, and any timeline events linked to this project.',
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
                    description: 'Used for Earth API data.',
                    hidden: ({ parent }) => parent?.source !== 'earth',
                }),
                defineField({
                    name: 'longitude',
                    title: 'Longitude',
                    type: 'number',
                    description: 'Used for Earth API data.',
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
    ],
})
