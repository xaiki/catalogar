const fs = require('fs')
const readline = require('readline')
const { makeFilename, s2s, Top } = require('./src/utils')

const top = new Top()
const file = process.argv.pop()

const reader = readline.createInterface({
    input: fs.createReadStream(file)
})

reader.on('line', line => {
    top.add(JSON.parse(line))
})

reader.on('close', () => {
    const res = top.sort()
    console.log(
        ['content', 'count', 'senders_count', 'groups_count', 'filename_counts', 'senders', 'groups'].join('\t'))
    res.map(e => {
        const senders = s2s(e.senders)
        const groups = s2s(e.groups)
        const filenames = s2s(e.filenames)
        console.log(
            [e.filename, e.total, senders.length, groups.length, filenames.length, senders.join(','),  groups.join(','), filenames.join(',')].join('\t'))
    })
})
