import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {markdownSchema} from 'sanity-plugin-markdown'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Personal-Website',

  projectId: 'k4t36b6u',
  dataset: 'production',

  plugins: [structureTool(), visionTool(), markdownSchema()],

  schema: {
    types: schemaTypes,
  },
})
