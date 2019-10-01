const fetch  =require('node-fetch')
module.exports = {
    upload : async function(base , name ,  guildId){
        const url =  `https://discordapp.com/api/guilds/${guildId}/emojis`
        let body  = {
            name:name.split(' ')[0] , 
            image:base
        }
        try{
            const res = await fetch(url, {
                method: 'post',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' , 'Authorization' :`Bot ${process.env.TOKEN_BOT}`}
                })
            const json =await res.json()
        }
        catch(err){
            console.log(err)
        }
    },
    delete:async function(guildId ,emojiId ){
        const url =  `https://discordapp.com/api/guilds/${guildId}/emojis/${emojiId}`
        try{
            const res = await fetch(url, {
                method: 'delete',
                headers: { 'Content-Type': 'application/json' , 'Authorization' :`Bot ${process.env.TOKEN_BOT}`}
                })
        }
        catch(err){
            console.log(err)
        }
    }
}