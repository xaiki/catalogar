const Gun = require('gun/gun')

const {GUN_CLASS, GUN_URL} = require('./gun')
const gun = Gun(GUN_URL)

gun.get(GUN_CLASS).map().once((data, key) => console.error('key', key, 'data', data))

//db.events.on('write', )
/*
db.on('ready', async (db) => {
    let all = await db.iterator({ limit: -1 }).collect()
    if (! all.length) {
        console.error('empty DB populating')
        for (let i in ninjas) {
            await db.add(ninjas[i])
        }
    }

    all = await db.iterator({ limit: -1 }).collect()
    console.error(all.map(i => i.payload))
    console.error(db.address.toString())
})

db.on('write', async (db, chan, hash, message) => {
    console.error('got write', chan, hash, message)
})
*/
