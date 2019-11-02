require("dotenv").config();
//UTILS
const isIncludesPrefix = require("./utils/includesPrefix"); //check if message includes prefix (?)
const myProfile = require("./utils/myProfile"); //get info about passed username profile
const build = require('./utils/build')
const championByName = require('./utils/getChampByName')
const getMostBannedChamps= require('./utils/most_banned')//get most banned champs
const banS = require('./utils/ban_suggestion')
const imgToBase = require("./utils/imgToBase64");
const emojiF = require("./utils/emoji");
const Discord = require("discord.js");
const token = process.env.TOKEN_BOT;
const client = new Discord.Client();
client.on("ready", () => {
  console.log("ready");
  client.user.setPresence({
    game: {
      name: "?help",
      type: "PLAYING"
    },
  });
});

//commands
const commands = {
  help: new RegExp("help", "gis"),
  profile: new RegExp("profile", "gis"),
  items: new RegExp("items", "gis"),
  ban_s: new RegExp("ban", "gis"),
  ban_m : new RegExp("devils", "gis")
};
//When someone send message
client.on("message", async msg => {
  function help(){
    msg.channel.send({
      embed: {
        color: 15844367,
        author: {
          name: client.user.username
        },
        title: "All commands available are",
        fields: [
          {
            name: "?profile [username]",
            value: "Informations about your account"
          },
          {
            name: "?ban [champion]",
            value: "Which champions you should ban"
          },
          {
            name: "?items [champion]",
            value: `Best available items for your champion`
          },
          {
            name: "?devils",
            value: `The most banned champions on the last patch`
          }
        ]
      }
    });
  }
  if (isIncludesPrefix(msg.content)) {
    //check if message includes prefix (?)
    const i = msg.content.split("?");
    const command = i[1]; //get only command
    
    if (command.match(commands.help)) {
      help()
    }
    else if(command.match(commands.ban_s)){
      let champion = command.substr(command.indexOf(" ") + 1);
      const res = await banS(champion);
       if(champion == 'ban'){
         help()
       }
       else if (res.length < 1){
        msg.reply(`i can't find this champion`)
      }
      else{
        try{
          const image = await championByName(champion)
          const info = new Discord.RichEmbed()    
          .setTitle(`The champions ${champion} is weak against them ?`)
          .setThumbnail(`http://ddragon.leagueoflegends.com/cdn/9.19.1/img/champion/${image[0].image.full}`)
          res.forEach((champ , i)=>{
            info.addField(`CHAMPION ${i+1}` , champ , true)
          })
          info.setFooter(`Developed with love by Everkers#6416 & Ziad#6132` , `https://cdn.discordapp.com/avatars/490663251953188865/ee246f16ae0729de62d0c1d310e9a1cf.png?size=2048`)
          msg.channel.send(info)
        }
        catch(err){
          console.log(err)
          msg.channel.send("an error occurred, contact me and i'll try to fix it ``Everkers#6416``")
        }
      }
    }
    else if(command.match(commands.ban_m)){
     try{
      const res = await getMostBannedChamps()
      const banned = new Discord.RichEmbed()
      .setTitle(`Most banned champions on patch : ${res.patch}`)
      .setThumbnail('https://cdna.artstation.com/p/assets/images/images/005/290/132/large/melissa-yabumoto-hppqxlo.jpg')
      .setFooter(`Developed with love by Everkers#6416 & Ziad#6132` , `https://cdn.discordapp.com/avatars/490663251953188865/ee246f16ae0729de62d0c1d310e9a1cf.png?size=2048`)
      const champs = res.champs;
      champs.forEach(( champ,index)=>{
        banned.addField( `Champion ${index + 1}`,champ , true)
      })
      msg.channel.send(banned)
     }
     catch(err){
      msg.channel.send("an error occurred, contact me and i'll try to fix it ``Everkers#6416``")
     }
      
    }
    else if(command.match(commands.items)){
      let champion = command.substr(command.indexOf(" ") + 1);
      if (champion == 'items'){
        help()
      }
      else{
        const res = await build(champion)
        if(res.length < 1){
          msg.reply(`i can't find this champion`)
        }
        else{
          try{
            const extra_info = await championByName(champion) 
            const info = new Discord.RichEmbed()    
            .addField(`Who's ${champion}?` , extra_info[0].about, true)
            .addBlankField()        
            .setTitle(`Suggested items for ${champion} :rose:`)
            .setThumbnail(`http://ddragon.leagueoflegends.com/cdn/9.19.1/img/champion/${extra_info[0  ].image.full}`)
            .setColor("#0099ff")
            .setFooter(`Developed with love by Everkers#6416 & Ziad#6132` , `https://cdn.discordapp.com/avatars/490663251953188865/ee246f16ae0729de62d0c1d310e9a1cf.png?size=2048`)
            res.forEach((item , i)=>{
              info.addField(`ITEM ${i+1}` , item , true)
            })
            msg.channel.send(info)
          }
          catch(err){
            msg.channel.send("an error occurred, contact me and i'll try to fix it ``Everkers#6416``")
          }

        }
      }
    }

    else if (command.match(commands.profile)) {
      let username = command.substr(command.indexOf(" ") + 1);
      if (username == 'profile') {
        help()
      } else if (username.length < 3) {
        msg.reply("This username is too short!");
      } else if (username.length > 16) {
        msg.reply("Are you serious dude?:joy:");
      } 
      else {
        try {
          const res = await myProfile(username); //get profile
          const base64 = await imgToBase(res.lastMatch.champ.image); //convert champ image to base64 to upload it as an emoji
          let discord_emoji = "";
          await emojiF.upload(
            base64,
            res.lastMatch.champ.name,
            msg.guild.id
          ) //upload emoji to the server
           await msg.guild.emojis.forEach( emoji => {
            if (emoji.name == res.lastMatch.champ.name.split(" ")[0]) {
              discord_emoji =  emoji;
            }
            }); 
          /*set the data to our variable*/
          //set information to msg
          const info = new Discord.RichEmbed()
            .setColor("#0099ff")
            .setAuthor(`${res.username}`)
            .setFooter(`Developed with love by Everkers#6416 & Ziad#6132` , `https://cdn.discordapp.com/avatars/490663251953188865/ee246f16ae0729de62d0c1d310e9a1cf.png?size=2048`)
            .addField(
              "Last Match",
              ` Champ : ${res.lastMatch.champ.name.toUpperCase()}${discord_emoji} \n Lane : ${
                res.lane
              } \n Time : ${res.time} \n Role : ${res.role} \n Stats : ${
                res.moreInfo.stats.kills
              }/${res.moreInfo.stats.deaths}/${
                res.moreInfo.stats.assists
              } \n Game Mode : ${res.moreInfo.mode} \n Duration : ${
                res.moreInfo.time
              } \n Result : ${!res.moreInfo.win ? "Defeat" : "Victory"}`,
              true
            )
            .addField(`Level`, res.level, true)
            .setThumbnail(res.iconProfile);
            msg.channel.send(info).then(() => {
                msg.guild.emojis.forEach( emoji => {
                if (emoji.name == res.lastMatch.champ.name.split(" ")[0]) {
                    emojiF.delete(msg.guild.id, emoji.id);   
                }
                }); 
          });
        } catch (err) {
            msg.reply(
                `an error occurred`
            );
        }
      }
    } else if(command.match(commands.help)) {
       help()
    }
  }
});
client.login(token);
