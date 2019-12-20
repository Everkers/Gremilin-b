const axios = require('axios')
class UserData{
    constructor(region , username){
        this.base_url = `https://${UserData.Region(region)}.api.riotgames.com/lol`
        this.username = username
    }
    static Region(region){
        if(region == 'ru' || region == 'kr'){
            return region
        }
        else{
            return region + 1
        }
    } 
    async lastMatch(usrname){
        const {data : profile} = await axios.get(`${this.base_url}/summoner/v4/summoners/by-name/${this.username}?api_key=${process.env.TOKEN_LOL}`)
        const {id , accountId  , profileIconId , summonerLevel} = profile


    }


}
module.exports = UserData