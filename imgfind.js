const { db, makeQuery } = require('./src/connectors/apollo/sqlite')
const Chat = require('./src/schemas/chat')

const chats = new Chat(db)
const filename = process.argv.pop()
 
const { preview } = chats.SEARCH.get(chats.makeMatch({filename}), -1, 0)
const r = chats.SEARCH.all(chats.makeMatch({preview}), -1, 0)

console.log(r)
