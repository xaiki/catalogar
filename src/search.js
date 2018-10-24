const fs = require('fs')
const readline = require('readline')
const { Readable } = require('stream')
const SearchIndex = require('search-index')

const ops = {
    indexPath: 'myCoolIndex',
    logLevel: 'error'
}

const run = (source, dest = 'public/data/tfidf.json') => new Promise ((accept, reject)=> {
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
            body: e.media ? e.media.caption : e.content,
        }
        docs.push(doc)
    })

    reader.on('close', () => {
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

module.exports = run
