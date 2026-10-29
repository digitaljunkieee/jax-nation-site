import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'film',
  title: 'Film project',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'blurb',
      title: 'Short description',
      type: 'text',
      rows: 3,
      description: 'One or two lines shown under the title.',
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube link',
      type: 'url',
      description: 'Paste the full YouTube link to the video.',
      validation: (r) => r.uri({scheme: ['https']}),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail image',
      type: 'image',
      options: {hotspot: true},
      description: 'Landscape works best (16:9).',
    }),
    defineField({
      name: 'sortNumber',
      title: 'Order (optional)',
      type: 'number',
      description: 'Lower numbers show first. Leave empty and the newest project goes on top.',
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'blurb', media: 'thumbnail'}},
})
