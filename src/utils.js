const crypto = require('crypto')

const makeOldFilename = e => {
    if (e.message_type === 'chat') return `chats/${e._id}`

    const date = e.timestamp['$date'].replace(/\..*/, '').replace('T', '_').replace(/:/g, '-')
    const src = e.sender_id.replace(/@.*/, '')
    const file = e.media.filename
    const type = e.message_type

    return `${type}s/${date}_${src}_${file}`
}

const makeFilename = e => {
    if (e.message_type === 'chat') return `chats/${e._id}`

    const date = e.timestamp['$date'].replace(/\..*/, '').replace('T', '_').replace(/:/g, '-')
    const src = e.sender_id.replace(/@.*/, '')
    const hash = crypto.createHash('md5')
                       .update(e.content || e.media.link).digest('hex')
    const ext = e.media.mime.replace(/.*\//, '')
    const type = e.message_type

    return `${type}s/${date}_${src}_${hash}.${ext}`
}

class Top {
    constructor() {
        this.data = {}
        this.filenames = {}
    }
    add(e) {
        if (e.message_type === 'ciphertext') return

        const key = ['audio', 'ptt', 'document']
            .indexOf(e.message_type) === -1 ? e.content : e.media.link
        const filename = makeFilename(e)

        if (this.data[key]) {
            this.data[key].total++
            this.data[key].senders[e.sender_id] =
                this.data[key].senders[e.sender_id] ?
                this.data[key].senders[e.sender_id] + 1 : 1
            this.data[key].groups[e.chat_id] =
                this.data[key].groups[e.chat_id] ?
                this.data[key].groups[e.chat_id] + 1 : 1
            this.data[key].captions[e.media.caption] =
                this.data[key].captions[e.media.caption] ?
                this.data[key].captions[e.media.caption] + 1 : 1

            if (this.data[key].filenames[e.media.filename]) {
                const fn = this.filenames[e.media.filename]
                this.data[key].filenames[fn] = this.data[key].filenames[fn] + 1
            } else {
                this.data[key].filenames[filename] = 1
            }
        } else {
            this.data[key] = {
                filename: filename,
                total: 1,
                senders: {
                    [e.sender_id]: 1
                },
                groups: {
                    [e.chat_id]: 1
                },
                captions: {
                    [e.media.caption]: 1
                },
                filenames: {
                    [e.media.filename]: 1
                }
            }
        }

        return key
    }
    values() {
        return Object.values(this.data)
    }
    sort() {
        return this.values().sort((a, b) => b.total - a.total)
    }
    get(key) {
        return this.data[key]
    }
}

const s2s = (senders) => Object.entries(senders)
                               .sort(([ka, va], [kb, vb]) => vb - va)
                               .map(e => e.join(':'))


module.exports = { makeFilename, s2s, Top }
