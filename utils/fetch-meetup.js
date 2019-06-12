const argv = require('yargs').argv
const fetch = require('node-fetch')
const { writeFileSync } = require('fs')

async function main () {
  const req = await fetch(`https://api.meetup.com/copenhagenjs/events/${argv.id}`)
  const {description, link, name, local_date, local_time, venue} = await req.json()
  const output = `---
title: ${name}
type: meetup
location: ${venue.address_1}, ${venue.city}
link: ${link}
date: ${local_date}T${local_time}:00
duration: 3
---

# ${name}

${description.replace(/<br\/>/g, '\n').replace(/<p>|<\/p>/g, '\n')}`
  console.log(output)
  if(argv.file) {
    writeFileSync(argv.file, output)
  }
}

main()
