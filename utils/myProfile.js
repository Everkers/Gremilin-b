const axios = require('axios');
const moment = require('moment');
const format = require('moment-duration-format')
const getChampById = require('./getChampById');
async function profile(username){ //get user profile
    try{
        const url_get_basic_info = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}?api_key=${process.env.TOKEN_LOL}`; //fetch user profile
        const res = await axios.get(url_get_basic_info); //fetch data 
        const {profileIconId,name , accountId , summonerLevel} = res.data
        return getLastPlayed(accountId , name , profileIconId , summonerLevel) //get the data from getLastplayed and send it to index.js
    }
    catch(err){
        console.log(err)
    }
}
async function getLastPlayed(id , name , icon , level){
    try{
        const url = `https://euw1.api.riotgames.com/lol/match/v4/matchlists/by-account/${id}` //fetch with id 
        const headers = {
            "Origin": "https://developer.riotgames.com",
            "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Riot-Token": process.env.TOKEN_LOL,
            "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,ar;q=0.6",
        }
        const res = await axios.get(url , {headers})//fetch 
        let info = []//array that will store all the final results
        const {champion , timestamp , lane , role , gameId} = res.data.matches[0]; //get champion and timestamp and lane
        const date = new Date(timestamp) //convert timestamp to normal date
        const time = moment(date, "YYYYMMDD").fromNow();
        const champ_convert = await getChampById(champion)//convert champion code to real data
        const advencedInfo = await getAdvencedMatchInfo(gameId , champion)
        info.push({lastMatch:{champ:{name:champ_convert[0].name , image:`http://ddragon.leagueoflegends.com/cdn/9.19.1/img/champion/${champ_convert[0].image.full}`}} , time : time , lane : lane, role:role, username : name , level:level ,  iconProfile:`http://ddragon.leagueoflegends.com/cdn/9.19.1/img/profileicon/${icon}.png`, moreInfo:advencedInfo[0]} )//push data to info array
        return info[0]//return final result to profile function
    }
    catch(err){
        console.log(err)
    }
}
async function getAdvencedMatchInfo(matchId , champId){
    try{
        const url = `https://euw1.api.riotgames.com/lol/match/v4/matches/${matchId}?api_key=${process.env.TOKEN_LOL}`
        const res = await axios.get(url)
        const {gameDuration , gameMode} =  res.data
        const info = res.data;
        let match_data = []
        const duration = moment.duration(gameDuration , 'seconds')
        const time = duration.format('hh:mm:ss')
        info.participants.forEach(part =>{
            if(part.championId == champId ){
                const {win, kills,deaths , assists} = part.stats
                match_data.push({win:win , time : time  , mode:gameMode, stats:{kills:kills, deaths:deaths , assists:assists}})
            }
        })
        return match_data
    }
    catch(err){
        console.log(err)    
    }
}
module.exports = profile;