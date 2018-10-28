const fs = require('fs')
const readline = require('readline')
const { db, makeQuery } = require('./src/connectors/apollo/sqlite')
const migrate = require('./migrations')
const { makeFilename, s2s, md5, Top } = require('./src/utils')
const Chat = require('./src/schemas/chat')
const Count = require('./src/schemas/count')
const debug = require('debug')('catalogar:populate')

migrate(db)

const chats = new Chat(db)
const ids = db.prepare(`SELECT id, rowid FROM chats`).all()
const idsh = {}
for (const {id, rowid} of ids) idsh[id] = rowid

const toups = db.prepare(`SELECT id, rowid FROM chats where hash is null`).all()
const toupsh = {}
for (const {id, rowid} of toups) toupsh[id] = rowid

debug(`${ids.length} elements in 'chat' table`)
debug(`${toups.length} elements need update`)

const top = new Top()
const chatFIELDS = Chat.FIELDS.join(', ')
const chatFIELDSA = Chat.FIELDS.map(a => `@${a}`).join(', ')
const countFIELDSA = Count.FIELDS.map(s => s.replace(/ .*/, '')).map(a => `@${a}`).join(', ')

const e2f = e => {
    const key = ['audio', 'ptt', 'document']
        .indexOf(e.message_type) === -1 ? e.content : e.media.link
    const hash = md5(key)

    return {
        rowid: e.rowid,
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
        filename: makeFilename(e, hash),
        body: (['image', 'video'].indexOf(e.message_type) === -1) ?
              e.content : e.media.caption,
        votes: 'NULL',
        hash
    }
}

const insertChat = makeQuery(`INSERT INTO chats VALUES(${chatFIELDSA})`)
const updateChat = makeQuery(`UPDATE chats SET hash = ? WHERE rowid = ?`)
const replaceCount = makeQuery(`REPLACE INTO counts VALUES(${countFIELDSA})`)
const processCount = ({filename, hash, total, senders, groups}) => ({
    hash,
    filename,
    total,
    senders: Object.keys(senders).length,
    groups: Object.keys(groups).length
})

const bulkInsert = db.transaction((docs, ups) => {
    const files = top.values()
    debug(`preparing inserts: ${docs.length} updates: ${ups.length} files: ${files.length}`)
    for (const doc of docs) insertChat.run(doc)
    debug(`inserted ${docs.length}`)
    for (const doc of ups) updateChat.run(doc.hash, doc.rowid)
    debug(`updated ${ups.length}`)
    for (const doc of files) replaceCount.run(processCount(doc))
    debug(`files ${files.length}`)
})

const populate = (source) => new Promise(accept => {
    // we don't have PRIMARY KEY or UNIQUE constraints in FTS,
    // so we filter here.
    const docs = {}
    const ups = {}
    const countGeneral = {
        filename: 'GENERAL',
        hash: null,
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
        if (e._id in idsh) {
            if (e._id in toupsh)
                ups[e._id] = (e2f({...e, rowid: idsh[e._id]}))
        } else {
            docs[e._id] = (e2f(e))
        }
    })

    reader.on('close', () => {
        countGeneral.senders = Object.keys(countGeneral.senders).length
        countGeneral.groups = Object.keys(countGeneral.groups).length

        replaceCount.run(countGeneral)
        bulkInsert(Object.values(docs), Object.values(ups))

        accept(db)
    })
})

populate(process.argv.pop())
