import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'show',
  title: 'Show',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Show name', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      options: {dateFormat: 'D MMM YYYY'},
      validation: (r) => r.required(),
      description:
        'Future dates appear under Upcoming shows. Once the date has passed, the show moves to Past shows by itself. You can also add shows that already happened.',
    }),
    defineField({name: 'venue', title: 'Venue', type: 'string'}),
    defineField({name: 'price', title: 'Price', type: 'string', description: 'For example £15, or Free. Only used for upcoming shows.'}),
    defineField({
      name: 'image',
      title: 'Poster or photo (optional)',
      type: 'image',
      options: {hotspot: true},
      description: 'Shown with the show in Past shows.',
    }),
    defineField({
      name: 'recap',
      title: 'Short recap (optional)',
      type: 'text',
      rows: 3,
      description: 'One or two lines about how the show went. Shown in Past shows.',
    }),
  ],
  orderings: [
    {title: 'Date, newest first', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]},
    {title: 'Date, soonest first', name: 'dateAsc', by: [{field: 'date', direction: 'asc'}]},
  ],
  preview: {select: {title: 'title', subtitle: 'date', media: 'image'}},
})
