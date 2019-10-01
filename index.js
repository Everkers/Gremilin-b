require("dotenv").config();
//UTILS
const isIncludesPrefix = require("./utils/includesPrefix"); //check if message includes prefix (?)
const myProfile = require("./utils/myProfile"); //get info about passed username profile
const imgToBase = require("./utils/imgToBase64");
const emoji = require("./utils/emoji");
const Discord = require("discord.js");
const token = process.env.TOKEN_BOT;
const client = new Discord.Client();

client.emojis.crea;
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
  profile: new RegExp("profile_dyali", "gis")
};

//When someone send message
client.on("message", async msg => {
  if (isIncludesPrefix(msg.content)) {
    //check if message includes prefix (?)
    const i = msg.content.split("?");
    const command = i[1]; //get only command
    if (command.match(commands.help)) {
      //and see if it's match our command in commands object
      msg.channel.send({
        embed: {
          //if the command is help = send this template of all our availble commands
          color: 15844367,
          author: {
            name: client.user.username
          },
          title: "HADU HUMA COMMANDS LI KAYNIN DB ✨",
          fields: [
            {
              name: "**?PROFILE_DYALI [USERNAME]**",
              value: "HAD COMMAND KADJIB LIK GA3 INFO 3LA PROFILE DYALK🙃"
            },
            {
              name: "**?M_BANNED**",
              value: "HAD COMMAND KA D3TIK CHAMPIONS LI KAYTBANAW BZF 😁"
            },
            {
              name: "**?ITEMS_MZIANIN [CHAMP]**",
              value: `HAD COMMAND KA D3TIK RECOMMANDED ITEMS L'CHAMP LI DWZTI LIHA🌈`
            }
          ]
        }
      });
    } else if (command.match(commands.profile)) {
      let username = command.substr(command.indexOf(" ") + 1);
      console.log(username);

      const errors_messages_pack = [
        "ma3reftch chnu baghi dir asat :joy:.. dir username dyalk mn mor command \n example:``?profile_dyali everkers``",
        "ghariba eandk had command ☹️jreb hadi chuf 3la lah \n example:``?profile_dyali everkers`` ",
        "ste3ml ``?bro`` bach dchuf kifach khdamin commands"
      ];
      if (username == undefined) {
        const random = Math.floor(Math.random() * errors_messages_pack.length);
        msg.reply(errors_messages_pack[random]);
      } else if (username.length < 3) {
        msg.reply("sorry bro username li derti sghir bzf,  7awl mra 2ukhra");
      } else if (username.length > 16) {
        msg.reply("a fin ghadi awa, nta baghi li y7wik waqila?:joy:");
      } else {
        try {
          const res = await myProfile(username); //get profile
          const base64 = await imgToBase(res.lastMatch.champ.image); //convert champ image to base64 to upload it as an emoji
          const upload_emoji = await emoji.upload(
            base64,
            res.lastMatch.champ.name,
            msg.guild.id
          ); //upload emoji to the server
          let discord_emoji = "";
          await msg.guild.emojis.forEach(emoji => {
            if (emoji.name == res.lastMatch.champ.name.split(" ")[0]) {
              discord_emoji = emoji;
            }
          }); /*set the data to our variable*/
          //set information to msg
          const info = new Discord.RichEmbed()
            .setColor("#0099ff")
            .setAuthor(`${res.username}`)
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
          await msg.channel.send(info).then(() => {
            emoji.delete(msg.guild.id, discord_emoji.id);
          });
        } catch (err) {
          if (err.response.status == 404) {
            msg.reply(
              `Mkaynch had khuna or khtna f league of legends , maybe kaynin f chi region wa7da ukhra soon gha nwli ka n supporti ga3 regions:fire:!`
            );
          }
        }
      }
    } else {
      msg.channel.send({
        embed: {
          //if the command is help = send this template of all our availble commands
          color: 15844367,
          author: {
            name: client.user.username
          },
          title: "HADU HUMA COMMANDS LI KAYNIN DB ✨",
          fields: [
            {
              name: "**?PROFILE_DYALI [USERNAME]**",
              value: "HAD COMMAND KADJIB LIK GA3 INFO 3LA PROFILE DYALK🙃"
            },
            {
              name: "**?M_BANNED**",
              value: "HAD COMMAND KA D3TIK CHAMPIONS LI KAYTBANAW BZF 😁"
            },
            {
              name: "**?ITEMS_MZIANIN [CHAMP]**",
              value: `HAD COMMAND KA D3TIK RECOMMANDED ITEMS L'CHAMP LI DWZTI LIHA🌈`
            }
          ]
        }
      });
    }
  }
});
client.login(token);
