const Database = require('better-sqlite3')
const db = new Database('messages.db')
const debug = require('debug')('catalogar:sqlite')

const makeQuery = (str) => {
    debug(str)
    return db.prepare(str)
}

const o2gql = (o) => {
    const f = ['rowid'].concat(o.FIELDS)
    const e = f.map(f => `	${f}: String`).join('\n')
    let ret = `
type ${o.name} {
${e}
}
    `
    debug(ret)
    return ret
}

module.exports = {
    db,
    o2gql,
    makeQuery,
}
