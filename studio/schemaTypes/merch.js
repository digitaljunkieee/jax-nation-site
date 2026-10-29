import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'merch',
  title: 'Merch item',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Item name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'price', title: 'Price', type: 'string', description: 'For example £25.'}),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 3}),
    defineField({name: 'image', title: 'Photo', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'sortNumber',
      title: 'Order (optional)',
      type: 'number',
      description: 'Lower numbers show first. Leave empty and the newest item goes on top.',
    }),
  ],
  preview: {select: {title: 'name', subtitle: 'price', media: 'image'}},
})
