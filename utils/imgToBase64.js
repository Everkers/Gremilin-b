const fetch = require('node-fetch')
async function toBase(url){
    const res = await fetch(url)
    const r = await res.buffer()
    const buf = `data:image/png;base64,`+r.toString('base64')
    return buf

}
module.exports = toBase