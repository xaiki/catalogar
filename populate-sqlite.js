const fs = require('fs')
const readline = require('readline')
const { db, makeQuery, Chats } = require('./src/connectors/apollo/sqlite')

console.error('creating table')
const FIELDS = Chats.FIELDS.replace('id,', 'id PRIMARY KEY,')
db.exec(`CREATE VIRTUAL TABLE chats USING fts4(${FIELDS});`)

const FIELDSA = Chats.FIELDS.split(', ').map(a => `@${a}`).join(', ')

const e2f = e => ({
    id: e._id,
    timestamp: e.timestamp['$date'],
    src: e.sender_id,
    dest: e.chat_id,
    group: e.group_name,
    type: e.message_type,
    preview: e.content,
    link: e.media.link,
    key: e.media.key,
    caption: e.media.caption,
    mime: e.media.mime,
    body: (['image', 'video'].indexOf(e.message_type) === -1) ?
          e.content : e.media.caption || `shared ${e.message_type} without caption`
})

const INSERT_QUERY = `INSERT INTO chats VALUES(${FIELDSA})`
const insert = makeQuery(INSERT_QUERY)

const bulkInsert = db.transaction(docs => {
    for (const doc of docs) insert.run(doc)
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
        docs[e._id] = (e2f(e))
    })

    reader.on('close', () => {
        bulkInsert(Object.values(docs))
        accept(db)
    })
})

populate(process.argv.pop())
