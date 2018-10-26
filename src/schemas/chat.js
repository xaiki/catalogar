const { storeVotes } = require('../votes')
const debug = require('debug')('catalogar:chatSchema')

const SELECT_ALL = `SELECT rowid,* FROM chats`

class Chat {
    constructor(db) {
        const makeQuery = (query) => {
            debug(query)
            return db.prepare(query)
        }

        const GET_ALL = makeQuery(`${SELECT_ALL}`)
        const SEARCH = makeQuery(`${SELECT_ALL} where body MATCH ?`)
        const SEARCH_LIMIT = makeQuery(`${SELECT_ALL} where body MATCH ? LIMIT ? OFFSET ?`)

        const GET_TYPE = makeQuery(`${SELECT_ALL} where type MATCH ?`)
        const GET_TYPE_LIMIT = makeQuery(`${SELECT_ALL} where type MATCH ? LIMIT ? OFFSET ?`)

        const GET_TYPE_UNVOTED = makeQuery(`${SELECT_ALL} where chats MATCH ?`)
        const GET_TYPE_UNVOTED_LIMIT = makeQuery(`${SELECT_ALL} where chats MATCH ? LIMIT ? OFFSET ?`)

        const VOTE = makeQuery(`UPDATE chats SET votes = ? WHERE rowid = ?`)

        const makeMatch = (match) => Object.entries(match).map(e => e.join(': ')).join(' AND ')

        this.getAll = () => GET_ALL.all()
        this.search = ({param, limit, skip = 0}) =>
            limit ?
            SEARCH_LIMIT.all(param, limit, skip) :
            SEARCH.all(param)
        this.getType = ({type, limit, skip = 0, voted = false}) =>
            voted ? (
                limit ?
                GET_TYPE_LIMIT.all(type, limit, skip) :
                GET_TYPE.all(type)
            ) : (
                limit ?
                GET_TYPE_UNVOTED_LIMIT.all(makeMatch({type, votes: 'NULL'}), limit, skip) :
                GET_TYPE_UNVOTED.all(makeMatch({type}))
            )
        this.vote = (rowid, votes) => VOTE.run(storeVotes(votes), rowid)
    }
}

Chat.FIELDS = ['id', 'timestamp', 'src', 'dest', 'group', 'type', 'preview', 'link', 'key', 'caption', 'mime', 'body', 'votes']

module.exports = Chat
/*
const {db} = require('../connectors/apollo/sqlite')
const chat = new Chat(db)
console.log(chat.getType({type: 'image', limit: 20}))
*/
