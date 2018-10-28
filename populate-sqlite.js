const fs = require('fs')
const readline = require('readline')
const { db, makeQuery } = require('./src/connectors/apollo/sqlite')
const migrate = require('./migrations')
const { makeFilename, s2s, Top } = require('./src/utils')
const Chat = require('./src/schemas/chat')
const Count = require('./src/schemas/count')
const debug = require('debug')('catalogar:populate')

migrate(db)

const chats = new Chat(db)
const ids = new Set(db.prepare(`SELECT id FROM chats`).pluck().all())
debug(`${ids.size} elements in table`)
const top = new Top()
const chatFIELDSA = Chat.FIELDS.map(a => `@${a}`).join(', ')
const countFIELDSA = Count.FIELDS.map(s => s.replace(/ .*/, '')).map(a => `@${a}`).join(', ')

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

const insertChat = makeQuery(`INSERT INTO chats VALUES(${chatFIELDSA})`)
const replaceCount = makeQuery(`REPLACE INTO counts VALUES(${countFIELDSA})`)
const processCount = ({filename, total, senders, groups}) => ({
    filename,
    total,
    senders: senders.length,
    groups: groups.length
})

const bulkInsert = db.transaction((docs) => {
    const files = top.values()
    debug(`preparing ${docs.length} ${files.length}`)
    for (const doc of docs) insertChat.run(doc)
    debug(`inserted ${docs.length}`)
    for (const doc of files) replaceCount.run(processCount(doc))
})

const populate = (source) => new Promise(accept => {
    // we don't have PRIMARY KEY or UNIQUE constraints in FTS,
    // so we filter here.
    const docs = {}
    const ups = {}
    const countGeneral = {
        filename: 'GENERAL',
        total: 0,
        senders: {},
        groups: {}
    }

    const reader = readline.createInterface({
        input: fs.createReadStream(source)
    })

    reader.on('line', line => {
        const e = JSON.parse(line)
        countGeneral.total++;
        countGeneral.senders[e.sender_id] = 1
        countGeneral.groups[e.chat_id] = 1

        e.key = top.add(e)
        if (ids.has(e._id)) {
            ups[e._id] = (e2f(e))
        } else {
            docs[e._id] = (e2f(e))
        }
    })

    reader.on('close', () => {
        countGeneral.senders = Object.keys(countGeneral.senders).length
        countGeneral.groups = Object.keys(countGeneral.groups).length

        replaceCount.run(countGeneral)
        bulkInsert(Object.values(docs, countGeneral))

        accept(db)
    })
})

populate(process.argv.pop())
