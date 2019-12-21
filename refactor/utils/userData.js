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

    async profileBasicData(){
        try{
            const url = `${this.base_url}/summoner/v4/summoners/by-name/${this.username}?api_key=${process.env.TOKEN_LOL}`
            const {data:basicData} = await axios.get(url)
            return basicData
        }
        catch(err){
            return false
        }
    }
    async getCurrentPatch(){
        const url = `https://ddragon.leagueoflegends.com/api/versions.json`;
        const {data} = await axios.get(url)
        return data[0]
    }
    async getChampionById(id){
        const patch = await this.getCurrentPatch()
        const url = `http://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`
        const {data : response} = await axios.get(url)
        let champion = []
        const champions = Object.keys(response.data);
        champions.forEach(champ=>{
            if(response.data[champ].key == id){
                champion.push(response.data[champ])
            }
        })  
        // console.log(champion)
        return champion[0]
    }
    async advencedMatchInfo(gameId){
        const url = `https://euw1.api.riotgames.com/lol/match/v4/matches/${gameId}?api_key=${process.env.TOKEN_LOL}`
        const {data:match} = await axios.get(url)
        return match 
    }
    async lastMatch(){
        const {accountId} = await this.profileBasicData()
        const url_lastMatch = `${this.base_url}/match/v4/matchlists/by-account/${accountId}?endIndex=1&beginIndex=0&api_key=${process.env.TOKEN_LOL}`
        const {data:lastPlayedMatch} = await axios.get(url_lastMatch)
        const {gameId} = lastPlayedMatch.matches[0]
        const {name:championName  , image  } = await this.getChampionById(lastPlayedMatch.matches[0].champion)
        const  {gameMode , participantIdentities , participants} = await this.advencedMatchInfo(gameId)
        let currentPlayerId = null
        const currentPlayerSum = []
        const data = []
        participantIdentities.forEach(participant=>{
            if(participant.player.accountId === accountId){
                currentPlayerId = participant.participantId
            }
        })
        participants.forEach(participant=>{
            if(participant.participantId === currentPlayerId){
                currentPlayerSum.push(participant)
            }
        })
        const {win , kills , deaths , assists, totalMinionsKilled} = currentPlayerSum[0].stats
        const {role , lane} = currentPlayerSum[0].timeline
        data.push({stats:{win , kills , deaths , assists , totalMinionsKilled , role , lane , gameMode , champion :{name:championName , image} }})
        return data


    }


}
module.exports = UserData