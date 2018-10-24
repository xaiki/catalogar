const fs = require('fs')
const readline = require('readline')
const { Readable } = require('stream')
const SearchIndex = require('search-index')
const debug = require('debug')('catalogar:search')

const ops = {
    indexPath: 'myCoolIndex',
    logLevel: 'error'
}

const searchIndex = (source, dest = 'public/data/tfidf.json') => new Promise ((accept, reject)=> {
    let index
    const docs = []

    const stream = new Readable( {objectMode: true, read: function () {
        this.push(docs.pop())
    }})

    const reader = readline.createInterface({
        input: fs.createReadStream(source)
    })

    reader.on('line', line => {
        const e = JSON.parse(line)
        const timestamp = e.timestamp['$date']
        const filename = `${timestamp}${e.sender_id}`

        const doc = {
            date: timestamp,
            id: filename,
            body: (['image', 'video'].indexOf(e.message_type) === -1) ?
                  e.content : e.media.caption || `shared ${e.message_type} without caption`
        }
        docs.push(doc)
    })

    reader.on('close', () => {
        debug('done')
        stream.destroy()
    })

    const indexData = (err, newIndex) => {
        if (err) return console.error(err)
        index = newIndex
        accept(index)

        stream
            .pipe(index.defaultPipeline())
            .pipe(index.add())
            .on('finish', () => console.log('finished'))
    }

    SearchIndex(ops, indexData)
})

module.exports = searchIndex
