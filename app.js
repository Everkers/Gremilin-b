require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const discord_token = process.env.TOKEN_BOT
const Profile = require('./utils/profile')
const ImageEditor = require('./utils/imageEditor')
const Champion = require('./utils/championData')
let msg = null
const imageEditor = new ImageEditor()
const profile = new Profile()
const champion = new Champion()
const commands = {
	profile: { regex: new RegExp('profile', 'gis'), execute: profile.getData },
	setSummoner: {
		regex: new RegExp('setUser', 'gis'),
		execute: profile.setUser,
	},
	champion: {
		regex: new RegExp('champion', 'gis'),
		execute: champion.getData,
	},
	updateSummoner: {
		regex: new RegExp('updateUser', 'gis'),
		execute: profile.updateUser,
	},
	imageEditor: {
		regex: new RegExp('editMe', 'gis'),
		execute: imageEditor.uploadImage,
	},
	help: {
		regex: new RegExp('help', 'gis'),
	},
}
client.on('ready', () => {
	console.log('ready')
	client.user.setPresence({
		game: {
			name: '?help',
			type: 'WATCHING',
		},
	})
})
client.on('message', message => {
	const content_msg = message.content
	if (content_msg.startsWith('?')) {
		if (content_msg.match(commands.profile.regex)) {
			commands.profile.execute(message, client)
		} else if (content_msg.match(commands.setSummoner.regex)) {
			commands.setSummoner.execute(message)
		} else if (content_msg.match(commands.updateSummoner.regex)) {
			commands.updateSummoner.execute(message)
		} else if (content_msg.match(commands.imageEditor.regex)) {
			commands.imageEditor.execute(message)
		} else if (content_msg.match(commands.champion.regex)) {
			commands.champion.execute(message)
		} else if (content_msg.match(commands.help.regex)) {
			const messageStyles = new Discord.RichEmbed()
				.setTitle('Gremilin Commands')
				.addField(
					'`` ?setUser [username] [region] ``',
					'This command will add your league of legends account to Grimilin mind, next time he will remember you :)',
					true
				)
				.addField(
					'`` ?updateUser [username] [region]``',
					'This command will update your league of legends account if already registered.',
					true
				)
				.addField(
					'`` ?profile ``',
					'This command will give you some informations about your account like last match etc...',
					true
				)
				.addField(
					'`` ?champion [champion name] ``',
					'This command will give you all that you need to know about a specific chmapion.',
					true
				)
				.addField(
					'`` ?editMe ``',
					'This command will edit your discord profile picture.',
					true
				)
				.setFooter(
					`Developed with love by Everkers#6416`,
					'https://i.pinimg.com/236x/f0/10/b2/f010b2798bfaa02c4afd72cb2aef6bfc.jpg'
				)
			message.channel.send(messageStyles)
		}
	}
})

client.login(discord_token)
