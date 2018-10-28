const crypto = require('crypto')

const md5 = data => crypto.createHash('md5')
                          .update(data).digest('hex')

const makeOldFilename = e => {
    if (e.message_type === 'chat') return `chats/${e._id}`

    const date = e.timestamp['$date'].replace(/\..*/, '').replace('T', '_').replace(/:/g, '-')
    const src = e.sender_id.replace(/@.*/, '')
    const file = e.media.filename
    const type = e.message_type

    return `${type}s/${date}_${src}_${file}`
}

const makeFilename = (e, hash) => {
    if (e.message_type === 'chat') return `chats/${e._id}`

    const date = e.timestamp['$date'].replace(/\..*/, '').replace('T', '_').replace(/:/g, '-')
    const src = e.sender_id.replace(/@.*/, '')
    const ext = e.media.mime.replace(/.*\//, '').replace(/;.*/, '')
    const type = e.message_type

    return `${type}s/${date}_${src}_${hash}.${ext}`
}

class Top {
    constructor() {
        this.data = {}
        //        this.filenames = {}
    }
    add(e) {
        if (e.message_type === 'ciphertext') return

        const key = ['audio', 'ptt', 'document']
            .indexOf(e.message_type) === -1 ? e.content : e.media.link
        const hash = md5(key)

        if (this.data[hash]) {
            this.data[hash].total++
            this.data[hash].senders[e.sender_id] =
                this.data[hash].senders[e.sender_id] ?
                this.data[hash].senders[e.sender_id] + 1 : 1
            this.data[hash].groups[e.chat_id] =
                this.data[hash].groups[e.chat_id] ?
                this.data[hash].groups[e.chat_id] + 1 : 1
            /*
               this.data[hash].captions[e.media.caption] =
               this.data[hash].captions[e.media.caption] ?
               this.data[hash].captions[e.media.caption] + 1 : 1

               if (this.data[hash].filenames[e.media.filename]) {
               const fn = this.filenames[e.media.filename]
               this.data[hash].filenames[fn] = this.data[hash].filenames[fn] + 1
               } else {
               this.data[hash].filenames[filename] = 1
               }
             */
        } else {
            this.data[hash] = {
                filename: makeFilename(e, hash),
                hash: hash,
                total: 1,
                senders: {
                    [e.sender_id]: 1
                },
                groups: {
                    [e.chat_id]: 1
                },
                /*       captions: {
                   [e.media.caption]: 1
                   },
                   filenames: {
                   [e.media.filename]: 1
                   }*/
            }
        }

        return hash
    }
    values() {
        return Object.values(this.data)
    }
    sort() {
        return this.values().sort((a, b) => b.total - a.total)
    }
    get(hash) {
        return this.data[hash]
    }
}

const s2s = (senders) => Object.entries(senders)
                               .sort(([ka, va], [kb, vb]) => vb - va)
                               .map(e => e.join(':'))


module.exports = { makeFilename, s2s, md5, Top }
