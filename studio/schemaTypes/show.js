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
      description: 'Shows drop off the website automatically the day after this date.',
    }),
    defineField({name: 'venue', title: 'Venue', type: 'string'}),
    defineField({name: 'price', title: 'Price', type: 'string', description: 'For example £15, or Free.'}),
  ],
  orderings: [{title: 'Date, soonest first', name: 'dateAsc', by: [{field: 'date', direction: 'asc'}]}],
  preview: {select: {title: 'title', subtitle: 'date'}},
})
