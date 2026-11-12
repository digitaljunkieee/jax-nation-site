import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'artwork',
  title: 'Artwork',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      validation: (r) => r.required(),
      description: 'A clear photo or scan of the piece. Large files are fine, the site resizes them.',
    }),
    defineField({name: 'year', title: 'Year', type: 'string', description: 'For example 2019.'}),
    defineField({name: 'medium', title: 'Medium', type: 'string', description: 'For example Charcoal on paper.'}),
    defineField({name: 'size', title: 'Size (optional)', type: 'string', description: 'For example 60 x 80 cm.'}),
    defineField({
      name: 'description',
      title: 'Story or notes (optional)',
      type: 'text',
      rows: 4,
      description: 'Shown when someone opens the piece.',
    }),
    defineField({
      name: 'sortNumber',
      title: 'Order (optional)',
      type: 'number',
      description: 'Lower numbers show first. Leave empty and the newest upload goes on top.',
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'year', media: 'image'}},
})
