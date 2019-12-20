const sql = require('sqlite')
const UserData = require('./userData')
class Profile{
    constructor(){
    }
    async setUser(message){
        const messageContent = message.content
        const [summoner , region] = messageContent.substr(messageContent.indexOf(' ') + 1).split(' ')
        
        const db = await sql.open('./users.sqlite', { Promise })
        const createTable = await db.run(`CREATE TABLE IF NOT EXISTS UsersData (Username TEXT , Region TEXT , GuildId INTEGER , UserId INTEGER) `)
        const rows = await Promise.all([
            db.get(`SELECT *  FROM UsersData WHERE UserId = ${message.author.id} `)
        ])
        if(!rows[0] && summoner != '?setUser' && region != null){
            db.run(`INSERT INTO UsersData (Username , Region , GuildId  , UserId   ) VALUES (?, ? , ? , ? )` , 
            [  summoner , region , message.guild.id , message.author.id ])
            message.channel.send('summoner has been successfully registered!')
        }
        else{
            message.channel.send('Something went wrong, if you are trying to update summoner data, Use ``?updateUser [summoner name] [summoner region] to change the current summoner informations``.')
        }
    }
   static async getSummoner(userId){
        const db = await sql.open('./users.sqlite', { Promise })
        const rows = await Promise.all([
            db.get(`SELECT * FROM UsersData WHERE UserId = ${userId}`)
        ])
        if(!rows[0]){
            return false
        }
        else{
            return rows
        }
    }
    async updateUser(message){
        const messageContent = message.content
        const [summoner , region] = messageContent.substr(messageContent.indexOf(' ') + 1).split(' ')   
        const db = await sql.open('./users.sqlite', { Promise })
        const inputData = [summoner , region , message.author.id]
        const rows = await Promise.all([
            db.get(`SELECT *  FROM UsersData WHERE UserId = ${message.author.id} `)
        ])
        if(!rows[0]){
            message.channel.send('Make sure to set the user first ``?setUser [summoner name] [summoner region]``. ')
        }
        else if(summoner != '?updateUser' && region != null ){
            db.run('UPDATE UsersData SET Username=? , Region =?  WHERE UserId=? ' , inputData)
            message.channel.send('summoner data has been updated!')
        }
        else{
            message.channel.send('Check your inputs and try again!')
        }

    }

    async getData(message){
        const getSummoner = await Profile.getSummoner(message.author.id)
        if(getSummoner){
            const {Username , Region} = getSummoner[0]
            const userData = new UserData(Region , Username)
            const lastMatch = await userData.lastMatch()
            
            
        }
        else {
            message.channel.send('Try to set user first ``?setUser [summoner name] [summoner region]`` ')
        }
        
    }
}
module.exports = Profile