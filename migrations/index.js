const Chat = require('../src/schemas/chat')

const TABLES = ['chats', 'links', 'db']
const updateVersion = (db, table, version) => db.prepare(`INSERT INTO versions (collection, version) VALUES(?, ?) ON CONFLICT(collection) DO UPDATE SET version=excluded.version;`).run(table, version)

const prepareMigration = (db, version) => db.transaction(
    (statements) => {
        console.error('runing migration', version)
        statements.map(s => s.run())
        console.error('done, updating versions')
        TABLES.map(t => updateVersion(db, t, version + 1))
        console.error('migration done', version)
    }
)

const prepareAll = (db, commands) => commands.map(c => db.prepare(c))
const updateChatCols = db => {
    const FIELDS = Chat.FIELDS.join(', ').replace('id,', 'id PRIMARY KEY,')
    try {
        db.prepare(`ALTER TABLE chats RENAME to oldChats;`).run()

        const migrateChats = db.transaction((statements) => statements.map(s => s.run()))
        migrateChats(prepareAll(db, [
            `CREATE VIRTUAL TABLE chats USING fts4(${FIELDS});`,
            `INSERT INTO chats SELECT * FROM oldChats;`,
            `DROP TABLE oldChats;`,
        ]))
    } catch(e) {
        console.error('migrateChats', e)
        db.prepare(`CREATE VIRTUAL TABLE chats USING fts4(${FIELDS});`).run()
    }

    return []
}

const migrations = [
    /* 0 -> 1 */
    db => updateChatCols(db).concat(prepareAll(db, [
        `CREATE TABLE links(id CHAR(128) PRIMARY KEY, shared_by, shared_in, ids);`,
        `CREATE TABLE versions(collection CHAR(32) PRIMARY KEY, version INT);`,
    ])),
    /* 1 -> 2 */
    db => updateChatCols(db)
]

module.exports = (db) => {
    let version
    try {
        version = db.prepare(`SELECT version FROM versions WHERE collection = 'db'`).pluck().get()
    } catch (e) {
        console.error('got error', e)
        version = 0
    }

    console.log(`migrating ${version} -> ${migrations.length}`)
    migrations.slice(version)
              .map((m, i) => prepareMigration(db, i + version)(
                  m(db, i + version)
              ))
}
