const debug = console.error.bind(console)

const SELECT_ALL = `SELECT * FROM counts`

class Count {
    constructor(db) {
        const makeQuery = (query) => {
            debug(query)
            return db.prepare(query)
        }
    }
}

Count.FIELDS = ['hash CHAR(32) PRIMARY KEY', 'filename CHAR(32)', 'total INT', 'senders INT', 'groups INT']

module.exports = Count
