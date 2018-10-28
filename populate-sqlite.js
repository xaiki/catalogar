const fs = require('fs')
const readline = require('readline')
const { db, makeQuery } = require('./src/connectors/apollo/sqlite')
const migrate = require('./migrations')
const { makeFilename, s2s, Top } = require('./src/utils')
const Chat = require('./src/schemas/chat')
const debug = require('debug')('catalogar:populate')

migrate(db)

const chats = new Chat(db)
const ids = new Set(db.prepare(`SELECT id FROM chats`).pluck().all())
debug(`${ids.size} elements in table`)
const top = new Top()

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
    votes: 'NULL',
    _key: e.key
})

const insertChat = makeQuery(`INSERT INTO chats VALUES(${FIELDSA})`)
const insertLink = makeQuery(`INSERT INTO links VALUES(@id, @shared_by, @shared_in, @ids)`)
const updateChat = makeQuery(`UPDATE chats set link = ?`)
const updateLink = makeQuery(`UPDATE links set shared_by = @shared_by, shared_in = @shared_in, ids = @ids WHERE id = @filename`)

const s2string = keys => s2s(keys).join(',')


const insert = db.transaction(doc => {
    ftop = top.get(doc._key)
    const links = ftop ? s2string(ftop.filenames) : null
    insertChat.run({...doc, links})

    if (! ftop) return
    insertLink.run({
        id: doc.id,
        shared_by: s2string(ftop.senders),
        shared_in: s2string(ftop.groups),
        ids: s2string(ftop.filenames)
    })
})

const update = db.transaction(doc => {
    ftop = top.get(doc._key)
    if (! ftop) return

    updateChat.run(s2string(ftop.filenames))
    updateLink.run({
        filename: doc.filename,
        shared_by: s2string(ftop.senders),
        shared_in: s2string(ftop.groups),
        ids: s2string(ftop.filenames)
    })
})

const bulkInsert = db.transaction((docs, ups) => {
    debug(`preparing ${docs.length} ${ups.length}`)
    for (const doc of docs) insert(doc)
    debug(`inserted ${docs.length}`)
    for (const doc of ups) update(doc)
    debug(`updated ${docs.length}`)
})

const populate = (source) => new Promise(accept => {
    // we don't have PRIMARY KEY or UNIQUE constraints in FTS,
    // so we filter here.
    const docs = {}
    const ups = {}
    const reader = readline.createInterface({
        input: fs.createReadStream(source)
    })

    reader.on('line', line => {
        const e = JSON.parse(line)
        e.key = top.add(e)
        if (ids.has(e._id)) {
            ups[e._id] = (e2f(e))
        } else {
            docs[e._id] = (e2f(e))
        }

    })

    reader.on('close', () => {
        bulkInsert(Object.values(docs), Object.values(ups))
        accept(db)
    })
})

populate(process.argv.pop())
