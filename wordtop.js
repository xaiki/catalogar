const fs = require('fs')
const readline = require('readline')
const freq = require('freq')

const file = process.argv.pop()
const data = []

const re = /\b(\*|de|o|e|a|do|que|h|https|da|em|para|com|não|no|é|um|se|os|\/\/youtu|na|por|uma|as|dos|\/|mais|\/\/www|isso|são|ao|esse|como|\/\/chat|foi|todos|vamos|das|tem|ele|você|já|está|pra|quem|eu|mas|seu|ou|ser|eles|\%|pelo|meu|essa|r\$|este|só|nas|av|sua|seus|nos|tudo|até|be\/|sem|à|todo|estão|q)\b/gi
console.error("re'", re)

const reader = readline.createInterface({
    input: fs.createReadStream(file)
})

reader.on('line', line => {
    const e = JSON.parse(line)
    let text
    switch (e.message_type) {
        case 'chat':
            text = e.content
            break
        case 'image':
        case 'video':
        default:
            if (! e.media.caption) return
            text = e.media.caption
            break
    }

    data.push(text.replace(re, '').replace(/\b. /, ''))
})


reader.on('close', () => {
    const res = freq(data)
    console.log(res.filter(r => r.word.match(/../)))
})
