const fs = require('fs')
const readline = require('readline')
const { makeFilename } = require('./src/utils')

const file = process.argv.pop()
const type = process.argv.pop()
const data = {}

const search = process.env.CT_SEARCH || NULL
let found

const reader = readline.createInterface({
    input: fs.createReadStream(file)
})

reader.on('line', line => {
    const e = JSON.parse(line)
    if (e.message_type !== type) return
    const key = e.content
    const filename = makeFilename(e)

    if (data[key]) {
        data[key].score++
        data[key].senders[e.sender_id] = data[key].senders[e.sender_id] ? data[key].senders[e.sender_id] + 1 : 1
        data[key].captions[e.media.caption] = data[key].captions[e.media.caption] ? data[key].captions[e.media.caption] + 1 : 1
    } else {
        data[key] = {
            filename: filename,
            score: 1,
            senders: {
                [e.sender_id]: 1
            },
            captions: {
                [e.media.caption]: 1
            }
        }
    }

    if (!found && filename === search) {
        found = key
    }
})

const s2s = (senders) => Object.entries(senders).map(e => e.join(':')).join(',')

reader.on('close', () => {
    if (found) {
        console.log('FOUND', data[found])
    } else {
        if (search) return console.log('NOT FOUND', search)
        const res = Object.values(data).sort((a, b) => b.score - a.score)
        res.map(e => console.log(`${e.filename}\t${e.score}\t${s2s(e.senders)}`))
    }
})
