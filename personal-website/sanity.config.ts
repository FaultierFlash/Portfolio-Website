import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {markdownSchema} from 'sanity-plugin-markdown'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Personal-Website',
  basePath: '/studio',

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
            S.listItem()
              .title('Social Links Settings')
              .id('socialsSettings')
              .child(
                S.document()
                  .schemaType('socialsSettings')
                  .documentId('socialsSettings')
              ),
            S.listItem()
              .title('Notes Settings')
              .id('notesSettings')
              .child(
                S.document()
                  .schemaType('notesSettings')
                  .documentId('notesSettings')
              ),
            S.listItem()
              .title('CV & Resume Settings')
              .id('cvSettings')
              .child(
                S.document()
                  .schemaType('cvSettings')
                  .documentId('cvSettings')
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (listItem) =>
                !['homePage', 'librarySettings', 'socialsSettings', 'notesSettings', 'cvSettings'].includes(listItem.getId() || '')
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
