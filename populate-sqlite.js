const fs = require('fs')
const readline = require('readline')
const { db, makeQuery } = require('./src/connectors/apollo/sqlite')
const { makeFilename } = require('./src/utils')
const Chat = require('./src/schemas/chat')
const debug = require('debug')('catalogar:populate')

try {
    debug('creating table')
    const FIELDS = Chat.FIELDS.join(', ').replace('id,', 'id PRIMARY KEY,')
    db.exec(`CREATE VIRTUAL TABLE chats USING fts4(${FIELDS});`)
} catch(e) {
    //pass
}

const chats = new Chat(db)
const ids = new Set(db.prepare(`SELECT id FROM chats`).pluck().all())
debug(`${ids.size} elements in table`)

const FIELDSA = Chat.FIELDS.map(a => `@${a}`).join(', ')

const e2f = e => ({
    row: e.rowid,
    id: e._id,
    timestamp: e.timestamp['$date'],
    src: e.sender_id,
    dest: e.chat_id,
    group: e.group_name,
    type: e.message_type,
    preview: e.message_type !== 'chat' ? e.content : null,
    link: e.media.link,
    key: e.media.key,
    caption: e.media.caption,
    mime: e.media.mime,
    filename: makeFilename(e),
    body: (['image', 'video'].indexOf(e.message_type) === -1) ?
          e.content : e.media.caption,
    votes: 'NULL'
})

const INSERT_QUERY = `INSERT INTO chats VALUES(${FIELDSA})`
const insert = makeQuery(INSERT_QUERY)

const bulkInsert = db.transaction(docs => {
    debug(`preparing ${docs.length}`)
    for (const doc of docs) insert.run(doc)
    debug(`inserted ${docs.length}`)
})

const populate = (source) => new Promise(accept => {
    // we don't have PRIMARY KEY or UNIQUE constraints in FTS,
    // so we filter here.
    const docs = {}
    const reader = readline.createInterface({
        input: fs.createReadStream(source)
    })

    reader.on('line', line => {
        const e = JSON.parse(line)
        if (ids.has(e._id)) return
        docs[e._id] = (e2f(e))
    })

    reader.on('close', () => {
        bulkInsert(Object.values(docs))
        accept(db)
    })
})

populate(process.argv.pop())
