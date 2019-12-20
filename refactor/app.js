require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const discord_token  = process.env.TOKEN_BOT;
const Profile = require('./utils/profile')
client.on('ready' , ()=> console.log('ready'))


const profile = new Profile()
const commands = {
    profile: {regex:new RegExp('profile' , 'gis') , execute: profile.getData },
    setSummoner: {regex:new RegExp('setUser' , 'gis') , execute: profile.setUser },
    updateSummoner: {regex:new RegExp('updateUser' , 'gis') , execute: profile.updateUser },
}

client.on('message' , message => {
    const content_msg = message.content
    if(content_msg.startsWith('?')){
        if(content_msg.match(commands.profile.regex)){
            commands.profile.execute(message)
        }
        else if (content_msg.match(commands.setSummoner.regex)){
            commands.setSummoner.execute(message)
        }
        else if (content_msg.match(commands.updateSummoner.regex)){
            commands.updateSummoner.execute(message)
        }
    }


})

client.login(discord_token)