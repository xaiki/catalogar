const { storeVotes } = require('../votes')
const debug = console.error.bind(console)

const SELECT_ALL = `SELECT rowid,* FROM chats`

const makeMatch = (match) => match ?
                             Object.entries(match)
                                   .map(e => e.join(': '))
                                   .join(' AND '): ''
class Chat {
    constructor(db) {
        const makeQuery = (query) => {
            debug(query)
            return db.prepare(query)
        }

        const GET_ALL = makeQuery(`${SELECT_ALL}`)
        const SEARCH = makeQuery(`${SELECT_ALL} WHERE chats MATCH ? LIMIT ? OFFSET ?`)

        const VOTE = makeQuery(`UPDATE chats SET votes = ? WHERE rowid = ?`)
        const COUNT_ALL = makeQuery(`SELECT COUNT(*) from chats`)
        const COUNT = makeQuery(`SELECT COUNT(*) from chats WHERE chats MATCH ? `)

        // XXX: HACKS
        this.makeMatch = makeMatch
        this.SEARCH = SEARCH

        this.getAll = () => GET_ALL.all()
        this.search = ({term, limit = -1, offset = 0}) =>
            SEARCH.all(makeMatch({body: term}), limit, offset)

        this.getType = ({type, voted = false, limit, offset = 0}) =>  {
            const args = {type}
            if (! voted)
                args.votes = 'NULL'
            return SEARCH.all(makeMatch(args), limit, offset)
        }

        this.vote = (rowid, votes) => VOTE.run(storeVotes(votes), rowid)
        this.count = () => COUNT.get()}
}

Chat.FIELDS = ['id', 'timestamp', 'src', 'dest', 'group', 'type', 'preview', 'link', 'key', 'caption', 'mime', 'body', 'votes', 'filename']

module.exports = Chat
/*
const {db} = require('../connectors/apollo/sqlite')
const chat = new Chat(db)
console.log(chat.getType({type: 'image', limit: 20}))
*/
