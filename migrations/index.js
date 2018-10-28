const Chat = require('../src/schemas/chat')
const Count = require('../src/schemas/count')
const debug = require('debug')('catalogar:migrate')

const TABLES = ['chats', 'counts', 'db']
const updateVersion = (db, table, version) => db.prepare(`INSERT INTO versions (collection, version) VALUES(?, ?) ON CONFLICT(collection) DO UPDATE SET version=excluded.version;`).run(table, version)
const runStatements = (statements) => statements.map(s => {
    debug('running', s.source)
    return s.run()
})
const run = (db, commands) => db.transaction(runStatements)(prepareAll(db, commands))
const getSchema = (db) => db.prepare(`SELECT sql FROM sqlite_master WHERE tbl_name = ? AND type = 'table'`).pluck()

const prepareMigration = (db, version) => db.transaction(
    (statements) => {
        debug('runing migration', version)
        db.transaction(runStatements)(statements)
        debug('done, updating versions')
        TABLES.map(t => updateVersion(db, t, version + 1))
        debug('migration done', version)
    }
)

const prepareAll = (db, commands) => commands.map(c => db.prepare(c))
const updateChatCols = db => {
    const FIELDS = Chat.FIELDS.join(', ').replace('id,', 'id PRIMARY KEY,')
    const schema = getSchema(db).get('chats')
    if (! schema) {
        run(db, [`CREATE VIRTUAL TABLE chats USING fts4(${FIELDS});`])
        return []
    }

    const oldFIELDS = schema.match(/\((.*)\)/)[1]
                            .split(', ')
                            .map(s => s.replace(/ .*/, ''))

    if (FIELDS.split(', ').length === oldFIELDS.length) {
        debug(`nothing we can do here`)
        return []
    }

    const escapedOldFIELDS = oldFIELDS.map(s => `'${s}'`).join(', ')
    const joinedOldFIELDS = oldFIELDS.join(', ')

    debug(`updating chats fields, (${escapedOldFIELDS}) -> (${FIELDS})`)

    db.transaction(() => {
        run(db, [`CREATE VIRTUAL TABLE newChats USING fts4(${FIELDS});`])
        run(db, [
            `INSERT INTO newChats(${escapedOldFIELDS}) SELECT * FROM chats;`,
            `DROP TABLE chats;`
        ])
        run(db, [`ALTER TABLE newChats RENAME to chats;`])
    })()

    /*
       debug('migrateChats', e)

       }*/

    return []
}

const countsFIELDS = Count.FIELDS.join(', ')
const createCounts = db => {
    run(db, [`CREATE TABLE counts(${countsFIELDS});`])
    return []
}
const migrations = [
    /* 0 -> 1 */
    db => updateChatCols(db).concat(prepareAll(db, [
        `CREATE TABLE versions(collection CHAR(32) PRIMARY KEY, version INT);`,
    ])),
    db => updateChatCols(db).concat(createCounts(db).concat(prepareAll(db, [
        `CREATE UNIQUE INDEX count_filename_idx on counts(filename);`,
        `CREATE UNIQUE INDEX count_hash_idx on counts(hash);`
    ])))
]

module.exports = (db) => {
    let version

    const schema = getSchema(db).get('versions')
    if (!schema) {
        version = 0
    } else {
        version = db.prepare(`SELECT version FROM versions WHERE collection = 'db'`).pluck().get()
    }

    console.log(`migrating ${version} -> ${migrations.length}`)
    migrations.slice(version)
           .map((m, i) => prepareMigration(db, i + version)(
               m(db, i + version)
           ))
}
