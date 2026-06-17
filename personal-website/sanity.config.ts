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

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Home Page')
              .id('homePage')
              .child(
                S.document()
                  .schemaType('homePage')
                  .documentId('homePage')
              ),
            S.listItem()
              .title('Library Settings')
              .id('librarySettings')
              .child(
                S.document()
                  .schemaType('librarySettings')
                  .documentId('librarySettings')
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (listItem) =>
                !['homePage', 'librarySettings'].includes(listItem.getId() || '')
            ),
          ]),
    }),
    visionTool(),
    markdownSchema(),
  ],

  schema: {
    types: schemaTypes,
  },
})
