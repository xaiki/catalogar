const Database = require('better-sqlite3')
const db = new Database('messages.db')
const debug = require('debug')('catalogar:sqlite')

const makeQuery = (str) => {
    debug(str)
    return db.prepare(str)
}

const o2gql = (o) => {
    const f = o.FIELDS.split(', ')
    const e = f.map(f => `	${f}: String`).join('\n')
    let ret = `
type ${o.name} {
${e}
}
    `
    debug(ret)
    return ret
}

class Chat {
    constructor() {
        this.GET_ALL = makeQuery(`SELECT * FROM chats`)
        this.SEARCH = makeQuery(`SELECT * FROM chats where body MATCH ?`)
        this.getAll = () => GET_ALL.all()
        this.search = param => SEARCH.all(param)
    }
}

Chat.FIELDS = 'id, timestamp, src, dest, group, type, preview, link, key, caption, mime, body'

module.exports = {
    db,
    o2gql,
    makeQuery,
    Chat
}
