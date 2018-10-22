const Gun = require('gun/gun')

const GUN_CLASS = 'opzapbozo2018'
const GUN_URL = process.env.GUN_URL || 'http://localhost:8080/gun'
const gun = Gun([GUN_URL])
const chain = gun.get(GUN_CLASS)

const gunGet = (key) => new Promise((accept, reject) => gun.get(key).once(data =>
    {
        accept(data || {})
    }
))

export {
    chain as default,
    gunGet,
    GUN_URL,
    GUN_CLASS
}

