import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'

// Set SANITY_STUDIO_PROJECT_ID in Render (or a local .env file). See README.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineConfig({
  name: 'jax-nation',
  title: 'Jax Nation',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Jax Nation')
          .items([
            S.listItem()
              .title('Site settings')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Site settings')),
            S.divider(),
            S.documentTypeListItem('film').title('Film projects'),
            S.documentTypeListItem('show').title('Shows'),
            S.documentTypeListItem('merch').title('Merch'),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
    // Site settings is a single document: stop people creating extra copies
    templates: (templates) => templates.filter(({schemaType}) => schemaType !== 'siteSettings'),
  },
  document: {
    newDocumentOptions: (prev) => prev.filter((item) => item.templateId !== 'siteSettings'),
    actions: (prev, {schemaType}) =>
      schemaType === 'siteSettings'
        ? prev.filter(({action}) => !['unpublish', 'delete', 'duplicate'].includes(action))
        : prev,
  },
})
