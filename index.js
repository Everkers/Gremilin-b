require("dotenv").config();
//UTILS
const isIncludesPrefix = require("./utils/includesPrefix"); //check if message includes prefix (?)
const myProfile = require("./utils/myProfile"); //get info about passed username profile
const build = require('./utils/build')
const championByName = require('./utils/getChampByName')
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
      name: "League of Legends",
      url: "https://www.twitch.tv/directory/game/League%20of%20Legends",
      type: "PLAYING"
    },
    status: "online"
  });
});

//commands
const commands = {
  help: new RegExp("bro", "gis"),
  profile: new RegExp("profile_dyali", "gis"),
  items: new RegExp("items_mzianin", "gis"),
  ban_s: new RegExp("chnu_nbani", "gis")
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
        title: "HADU HUMA COMMANDS LI KAYNIN DB ✨",
        fields: [
          {
            name: "**?PROFILE_DYALI [USERNAME]**",
            value: "HAD COMMAND KADJIB LIK GA3 INFO 3LA PROFILE DYALK"
          },
          {
            name: "**?CHNU_NBANI [CHAMPION DYALK]**",
            value: "HAD COMMAND KA D3TIK CHAMPIONS LI KHASEK TBANIHUM"
          },
          {
            name: "**?ITEMS_MZIANIN [CHAMPION]**",
            value: `HAD COMMAND KA D3TIK RECOMMANDED ITEMS L'CHAMP LI DWZTI LIHA`
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
       if(champion == 'chnu_nbani'){
         help()
       }
       else if (res.length < 1){
        msg.reply(`mal9itch had champ i'm sorry :cry:`)
      }
      else{
        try{
          const image = await championByName(champion)
          const info = new Discord.RichEmbed()    
          .setTitle(`chkun n bani u ana la3b b ${champion} :confused:?`)
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
    else if(command.match(commands.items)){
      let champion = command.substr(command.indexOf(" ") + 1);
      if (champion == 'items_mzianin'){
        help()
      }
      else{
        const res = await build(champion)
        if(res.length < 1){
          msg.reply(`mal9itch had champ i'm sorry :cry:`)
        }
        else{
          try{
            const extra_info = await championByName(champion) 
            const info = new Discord.RichEmbed()    
            .addField(`Chkun had ${champion}?` , extra_info[0].about, true)
            .addBlankField()        
            .setTitle(`Items mzianin dyal ${champion} :heart:`)
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

      const errors_messages_pack = [
        "ma3reftch chnu baghi dir asat :joy:.. dir username dyalk mn mor command \n example:``?profile_dyali everkers``",
        "ghariba eandk had command ☹️jreb hadi chuf 3la lah \n example:``?profile_dyali everkers`` ",
        "ste3ml ``?bro`` bach dchuf kifach khdamin commands"
      ];
      if (username == 'profile_dyali') {
        const random = Math.floor(Math.random() * errors_messages_pack.length);
        msg.reply(errors_messages_pack[random]);
      } else if (username.length < 3) {
        msg.reply("sorry bro username li derti sghir bzf,  7awl mra 2ukhra");
      } else if (username.length > 16) {
        msg.reply("a fin ghadi awa, nta baghi li y7wik waqila?:joy:");
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
              "Akhir Ter7",
              ` Champ : ${res.lastMatch.champ.name.toUpperCase()}${discord_emoji} \n Lane : ${
                res.lane
              } \n Time : ${res.time} \n Role : ${res.role} \n Stats : ${
                res.moreInfo.stats.kills
              }/${res.moreInfo.stats.deaths}/${
                res.moreInfo.stats.assists
              } \n Game Mode : ${res.moreInfo.mode} \n Duration : ${
                res.moreInfo.time
              } \n Natija : ${!res.moreInfo.win ? "Khasara" : "Rb7a"}`,
              true
            )
            .addField(`Nisbat l9wada(Level)`, res.level, true)
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
    } else {
       help()
    }
  }
});
client.login(token);
