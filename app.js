require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const discord_token = process.env.TOKEN_DEVBOT
const Profile = require('./utils/profile')
const ImageEditor = require('./utils/imageEditor')
const Champion = require('./utils/championData')
const Points = require('./utils/pointsChanges')
const imageEditor = new ImageEditor()
const profile = new Profile()
const champion = new Champion()
const commands = {
	profile: { regex: new RegExp('profile', 'gis'), execute: profile.getData },
	setSummoner: {
		regex: new RegExp('setUser', 'gis'),
		execute: profile.setUser,
	},
	points: { regex: new RegExp('points', 'gis') },
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
const messages = [
	'a lot of problems has been fixed',
	'?help',
	'league of legends',
	'world war III',
]
client.on('ready', () => {
	console.log('ready')
	setInterval(() => {
		const state = messages[Math.floor(Math.random() * messages.length)]
		client.user.setPresence({
			game: {
				name: state,
			},
			status: 'dnd',
		})
	}, 60000)

	client.user.setPresence({
		game: {
			name: '?help',
		},
		status: 'idle',
	})
})

client.on('message', async message => {
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
		} else if (content_msg.match(commands.points.regex)) {
			const points = new Points(message.author.id)
			const pts = await points.getPoints
			if (pts !== false) {
				message.channel.send(`You have ${pts}gp`)
			} else {
				message.channel.send(
					'Something went wrong, Please set the user first , Use ``?setUser [summoner name] [summoner region]`` to set the user.'
				)
			}
		} else if (content_msg.match(commands.help.regex)) {
			const messageStyles = new Discord.RichEmbed()
				.setTitle('Gremilin Commands')
				.addField(
					'**Important**',
					'If your username on league of legends contains more than one word then wrap the name with the double quotation marks \n ``example: ?updateUser "FNC MagiFelix" euw``'
				)
				.addBlankField()
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
