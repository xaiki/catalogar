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
    res.map(e => console.log(`${e.filename}\t${e.score}\t${s2s(e.senders)}\t${s2s(e.groups)}`))
})
