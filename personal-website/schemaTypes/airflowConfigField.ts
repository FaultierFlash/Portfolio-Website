import { defineField } from 'sanity'

export const backgroundEffectList = [
  { title: 'None', value: 'none' },
  { title: 'Subtle Grid', value: 'grid' },
  { title: 'Subtle Dots', value: 'dots' },
  { title: 'Topography', value: 'topography' },
  { title: 'Solar System', value: 'solar' },
  { title: 'Wing Airflow (20Hz)', value: 'airflow' },
]

export const airflowConfigField = defineField({
  name: 'airflowConfig',
  title: 'Wing Airflow (20Hz) Configuration',
  type: 'object',
  hidden: ({ document }) => document?.backgroundEffect !== 'airflow',
  fields: [
    defineField({
      name: 'phase',
      title: 'Stroke Phase Mode',
      type: 'string',
      description: 'Vertically stacked scroll sequence (all 4 frames) or lock to a single wing position.',
      options: {
        list: [
          { title: 'Stacked Scroll Row (All 4 Phases)', value: 'scroll' },
          { title: '01 · Mid-Forward Stroke (0°, ~30° AoA)', value: '01' },
          { title: '02 · Supination Reversal (+60°)', value: '02' },
          { title: '03 · Mid-Return Stroke (0°, ~30° AoA)', value: '03' },
          { title: '04 · Pronation Reversal (-60°)', value: '04' },
        ],
      },
      initialValue: 'scroll',
    }),
    defineField({
      name: 'intensity',
      title: 'Contrast / Subtlety',
      type: 'number',
      description: 'Adjust background contrast (Default: 1.0).',
      initialValue: 1.0,
      validation: (Rule) => Rule.min(0.15).max(3.0),
    }),
    defineField({
      name: 'flutter',
      title: 'Wake Flutter Intensity',
      type: 'number',
      description: 'Controls shear-layer and wake streamline flutter amplitude (Default: 1.0).',
      initialValue: 1.0,
      validation: (Rule) => Rule.min(0).max(3.0),
    }),
    defineField({
      name: 'cursorTurbulence',
      title: 'Cursor Disturbance Strength',
      type: 'number',
      description: 'How strongly cursor movement disturbs the airflow streamlines (Default: 1.0).',
      initialValue: 1.0,
      validation: (Rule) => Rule.min(0).max(3.0),
    }),
  ],
})
