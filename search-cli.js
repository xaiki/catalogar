const prepare = require('./search')
const chalk = require('chalk')
const tc = require('term-cluster')

const runCLI = (index) => {
    const printPrompt = () => {
        console.log()
        console.log()
        process.stdout.write('search > ')
    }

    const searchCLI = () => {
        printPrompt()
        process.stdin.resume()
        process.stdin.on('data', search)
    }

    const search = (rawQuery) => {
        index.search(rawQuery.toString().replace( /\r?\n|\r/g, '' ))
             .on('data', printResults)
             .on('end', printPrompt)
    }

    const printResults = (data) => {
        if (! data.document) return console.error('no document', data)
        console.log('\n' + chalk.blue(data.id) + ' : ' + chalk.yellow(data.score))
        const terms = Object.keys(data.scoringCriteria[0].matches).map(function(item) {
            return item.substring(2)
        })
        for (var key in data.document) {
            if (data.document[key]) {
                var teaser = tc(data.document[key], terms)
                if (teaser) console.log(teaser)
                else console.log(data.document[key])
            }
        }
        console.log()
    }

    searchCLI()
}

console.log('loading data…')
prepare(process.argv.pop())
    .then(runCLI)

