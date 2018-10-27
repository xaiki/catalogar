const makeFilename = e => {
    const date = e.timestamp['$date'].replace(/\..*/, '').replace('T', '_').replace(/:/g, '-')
    const src = e.sender_id.replace(/@.*/, '')
    const file = e.media.filename
    const type = e.message_type

    return `${type}s/${date}_${src}_${file}`
}

class Top {
    constructor() {
        this.data = {}
    }
    add(e) {
        if (e.message_type === 'ciphertext') return

        const key = ['audio', 'ptt', 'document']
            .indexOf(e.message_type) === -1 ? e.content : e.media.link
        const filename = makeFilename(e)

        if (this.data[key]) {
            this.data[key].score++
            this.data[key].senders[e.sender_id] =
                this.data[key].senders[e.sender_id] ?
                this.data[key].senders[e.sender_id] + 1 : 1
            this.data[key].groups[e.group_id] =
                this.data[key].groups[e.group_id] ?
                this.data[key].groups[e.group_id] + 1 : 1
            this.data[key].captions[e.media.caption] =
                this.data[key].captions[e.media.caption] ?
                this.data[key].captions[e.media.caption] + 1 : 1
        } else {
            this.data[key] = {
                filename: filename,
                score: 1,
                senders: {
                    [e.sender_id]: 1
                },
                groups: {
                    [e.group_id]: 1
                },
                captions: {
                    [e.media.caption]: 1
                }
            }
        }

        return this.data[key]
    }
    values() {
        return Object.values(this.data)
    }
    sort() {
        return this.values().sort((a, b) => b.score - a.score)
    }
}

module.exports = { makeFilename, Top }
