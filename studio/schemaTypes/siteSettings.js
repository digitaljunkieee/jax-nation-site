import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  groups: [
    {name: 'studio', title: 'Studio hire', default: true},
    {name: 'founder', title: 'Founder'},
  ],
  fields: [
    defineField({
      name: 'studioRate',
      title: 'Studio rate line',
      type: 'string',
      group: 'studio',
      description: 'Shown on the Studio page, for example "From £25 per hour".',
    }),
    defineField({
      name: 'studioNote',
      title: 'Studio booking note',
      type: 'text',
      rows: 3,
      group: 'studio',
      description: 'Optional. Leave empty to keep the current wording on the site.',
    }),
    defineField({
      name: 'studioFacts',
      title: 'Studio quick facts',
      type: 'array',
      group: 'studio',
      description: 'Small label and value pairs, for example Capacity: 30 people.',
      of: [
        {
          type: 'object',
          name: 'fact',
          fields: [
            defineField({name: 'label', title: 'Label', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'value', title: 'Value', type: 'string', validation: (r) => r.required()}),
          ],
          preview: {select: {title: 'label', subtitle: 'value'}},
        },
      ],
    }),
    defineField({name: 'founderName', title: 'Founder name', type: 'string', group: 'founder'}),
    defineField({name: 'founderRole', title: 'Founder role', type: 'string', group: 'founder'}),
    defineField({name: 'founderBio', title: 'Founder bio', type: 'text', rows: 6, group: 'founder'}),
    defineField({
      name: 'founderPhoto',
      title: 'Founder photo',
      type: 'image',
      options: {hotspot: true},
      group: 'founder',
    }),
  ],
  preview: {prepare: () => ({title: 'Site settings'})},
})
