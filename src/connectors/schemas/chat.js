class Chat {
    constructor(db) {
        const GET_ALL = db.prepare(`SELECT * FROM chats`)
        const SEARCH = db.prepare(`SELECT * FROM chats where body MATCH ?`)
        const SEARCH_LIMIT = db.prepare(`SELECT * FROM chats where body MATCH ? LIMIT ? OFFSET ?`)

        this.getAll = () => GET_ALL.all()
        this.search = (param, limit, skip = 0) => limit ?
                                                  SEARCH_LIMIT.all(param, limit, skip) :
                                                  SEARCH.all(param)
    }
}

Chat.FIELDS = ['id', 'timestamp', 'src', 'dest', 'group', 'type', 'preview', 'link', 'key', 'caption', 'mime', 'body']

module.exports = Chat
