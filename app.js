require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const discord_token = process.env.TOKEN_BOT
const Profile = require('./utils/profile')
const ImageEditor = require('./utils/imageEditor')
const Champion = require('./utils/championData')
const Points = require('./utils/pointsChanges')
const imageEditor = new ImageEditor()
const profile = new Profile()
const champion = new Champion()
const cooldown = new Set()
const { Pool, Client } = require('pg')
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
	borders: {
		regex: new RegExp('borders', 'gis'),
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
	'start earning gp',
	'gp = gremilin points',
	'new borders are available',
	'?points',
	'?borders',
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
	if (content_msg == 'config-heroku-db') {
		const connectionString = process.env.DATABASE_URL
		const pool = new Pool({
			connectionString,
		})
		const query = `CREATE TABLE test (
			id BIGINT,
			username TEXT NOT NULL,
			region TEXT NOT NULL,
			userid TEXT NOT NULL,
			points INT
		)`
		pool.query(query, (err, res) => {
			console.log(res)
			message.channel.send(`` + res + ``)
		})
	}
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
		} else if (content_msg.match(commands.borders.regex)) {
			const messageStyles1 = new Discord.RichEmbed()
				.setTitle('Gremilin Borders')
				.addField(
					'Border number 1',
					'You can start using this border once you hit 50gp'
				)
				.setImage(
					'https://media.discordapp.net/attachments/657198405852069893/670017837300973568/761.png?width=289&height=430'
				)
			const messageStyles2 = new Discord.RichEmbed()
				.setTitle('Gremilin Borders')
				.addField(
					'Border number 2',
					'You can start using this border once you hit 200gp'
				)
				.setImage(
					'https://media.discordapp.net/attachments/668898486523133975/670018086363201556/527.png?width=289&height=430'
				)
			message.channel.send(messageStyles1)
			message.channel.send(messageStyles2)
			message.channel.send('``?points to see how much points you have``')
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
				.setDescription('Gp = Gremilin Points')
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
					'`` ?editMe [border number]``',
					'This command will edit your discord profile picture.',
					true
				)
				.addField(
					'``?points``',
					'This command will show you how much gp you have.',
					true
				)
				.addField(
					'``?borders``',
					'This command will show you all the available borders.',
					true
				)

				.addField(
					'``How can i earn gp?``',
					'You can start earning gp by using the bot, on each command you use, you earn certain amount of points',
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
