const fs = require('fs')
const readline = require('readline')

const file = process.argv.pop()
const type = process.argv.pop()
const data = {}


const reader = readline.createInterface({
    input: fs.createReadStream(file)
})


reader.on('line', line => {
    const e = JSON.parse(line)
    if (e.message_type !== type) return
    const key = e.content
    if (data[key]) {
        data[key].score++
        data[key].senders[e.sender_id] = data[key].senders[e.sender_id] ? data[key].senders[e.sender_id] + 1 : 1
        data[key].captions[e.caption] = data[key].captions[e.caption] ? data[key].captions[e.caption] + 1 : 1
    } else {
        const ext = e.media.mime.split('/').pop()
        const timestamp = e.timestamp['$date']
        data[key] = {
            filename: `${type}s/${timestamp}${e.sender_id}.${ext}`,
            score: 1,
            senders: {
                [e.sender_id]: 1
            },
            captions: {
                [e.caption]: 1
            }
        }
    }
})

const s2s = (senders) => Object.entries(senders).map(e => e.join(':')).join(',')

reader.on('close', () => {
    const res = Object.values(data).sort((a, b) => b.score - a.score)
    res.map(e => console.log(`${e.filename}\t${e.score}\t${s2s(e.senders)}`))
})
