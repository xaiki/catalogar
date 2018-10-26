const makeFilename = e => {
    const date = e.timestamp['$date'].replace(/\..*/, '').replace('T', '_').replace(/:/g, '-')
    const src = e.sender_id.replace(/@.*/, '')
    const file = e.media.filename
    const type = e.message_type

    return `${type}s/${date}_${src}_${file}`
}

module.exports = { makeFilename }
