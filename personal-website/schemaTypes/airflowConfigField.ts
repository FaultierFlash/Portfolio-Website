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
      description: 'Choose whether scrolling cycles through the 4 static wing positions or locks to a single position.',
      options: {
        list: [
          { title: 'Auto by Scroll (All 4 Phases)', value: 'scroll' },
          { title: '01 · Pronation Reversal (-60°)', value: '01' },
          { title: '02 · Mid-Forward Stroke (0°, ~30° AoA)', value: '02' },
          { title: '03 · Supination Reversal (+60°)', value: '03' },
          { title: '04 · Mid-Return Stroke (0°, ~30° AoA)', value: '04' },
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
    defineField({
      name: 'showGhosts',
      title: 'Show Ghost Sweep Positions',
      type: 'boolean',
      description: 'Show faint silhouettes of the other 3 horizontal stroke positions behind the active wing.',
      initialValue: true,
    }),
  ],
})
