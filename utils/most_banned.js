const axios = require('axios')
async function getMostBannedChamps(){
    const most_banned_url = `http://arrax-lol.herokuapp.com/api/most-banned/`
    const patch = `https://ddragon.leagueoflegends.com/api/versions.json`;
    const champs =  await axios.get(most_banned_url)
    const version = await axios.get(patch)
    return {patch:version.data[0] , champs:champs.data}

}
module.exports = getMostBannedChamps