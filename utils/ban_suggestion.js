const axios = require('axios')
async function banSugg(champ){
    const url = `http://arrax-lol.herokuapp.com/api/ban-suggestion/${champ}`
    const res = await axios.get(url)
    const list = res.data;
    return list
}
module.exports = banSugg