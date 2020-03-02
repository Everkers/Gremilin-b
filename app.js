require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const discord_token = process.env.TOKEN_BOT
const Profile = require('./utils/profile')
const ImageEditor = require('./utils/imageEditor')
const Champion = require('./utils/championData')
const Spotlight = require('./utils/spotlight')
const Points = require('./utils/pointsChanges')
const imageEditor = new ImageEditor()
const Admin = require('./utils/admin')
const profile = new Profile()
const champion = new Champion()
const admin = new Admin()
const spotlight = new Spotlight()
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
	aUpdatePoints: {
		regex: new RegExp('updategp', 'gis'),
		execute: admin.updatePoints,
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
	spotlight: {
		regex: new RegExp('spotlight', 'gis'),
		execute: spotlight.getChampionData,
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
	if (message.author.bot) {
		const embed = message.embeds.find(m => m.title.includes('spotlight'))
		if (embed) {
			message
				.react('1⃣')
				.then(() => message.react('2⃣'))
				.then(() => message.react('3⃣'))
				.then(() => message.react('4⃣'))
				.then(() => message.react('5⃣'))
		}
	}
	if (
		message.author.bot &&
		message.embeds.find(m => m.title.includes('spotlight'))
	) {
		message
			.awaitReactions((reaction, user) => reaction.count > 1, {
				max: 1,
				time: 60000,
			})
			.then(async col => {
				const emoji = col.first().emoji.name
				const embd = message.embeds.find(m => m.title.includes('spotlight'))
				const [championName] = embd.title.split(' ')
				const {
					championData,
					patch,
					champion,
				} = await spotlight.getChampionData(championName)
				if (emoji === '1⃣') {
					const storyEmbed = new Discord.RichEmbed()
						.setTitle(`${champion} Story`)
						.addField(
							`Story of ${championData.data[champion].name} ${championData.data[champion].title}`,
							championData.data[champion].lore
						)
						.setThumbnail(
							`http://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${championData.data[champion].image.full}`
						)
					message.channel.send(storyEmbed)
				}
				if (emoji === '2⃣') {
					const storyEmbed = new Discord.RichEmbed()
						.setTitle(`${champion} Abilities`)
						.setDescription(
							`Abilities of ${championData.data[champion].name} ${championData.data[champion].title}`
						)
						.setThumbnail(
							`http://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${championData.data[champion].image.full}`
						)
					championData.data[champion].spells.forEach(spell => {
						storyEmbed.addField(
							`${spell.name} [${spell.id.split(champion)[1]}]`,
							spell.description.replace(
								/<(br|basefont|hr|input|source|frame|param|area|meta|!--|col|link|option|base|img|wbr|!DOCTYPE).*?>|<(a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|font|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video).*?<\/\2>/gi,
								''
							)
						)
					})
					storyEmbed.addField(
						`${championData.data[champion].passive.name} [Passive]`,
						championData.data[champion].passive.description.replace(
							/<(br|basefont|hr|input|source|frame|param|area|meta|!--|col|link|option|base|img|wbr|!DOCTYPE).*?>|<(a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|font|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video).*?<\/\2>/gi,
							''
						)
					)
					message.channel.send(storyEmbed)
				} else if (emoji === '3⃣') {
					championData.data[champion].skins.forEach(skin => {
						message.channel.send(skin.name, {
							files: [
								`http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion}_${skin.num}.jpg`,
							],
						})
					})
				} else if (emoji === '4⃣') {
					const tipsEmbed = new Discord.RichEmbed()
						.setTitle(`${champion} Tips`)
						.addField(
							`Tips for ${championData.data[champion].name} ${championData.data[champion].title}`,
							`${championData.data[champion].allytips
								.map(tip => `${tip}\n\n`)
								.join('')}`
						)
						.setThumbnail(
							`http://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${championData.data[champion].image.full}`
						)
					message.channel.send(tipsEmbed)
				} else if (emoji === '5⃣') {
					const tipsEmbed = new Discord.RichEmbed()
						.setTitle(`How to counter ${champion}`)
						.addField(
							`Countering tips for ${championData.data[champion].name} ${championData.data[champion].title}`,
							`${championData.data[champion].enemytips
								.map(tip => `${tip}\n\n`)
								.join('')}`
						)
						.setThumbnail(
							`http://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${championData.data[champion].image.full}`
						)
					message.channel.send(tipsEmbed)
				}
			})
		message.delete(50000)
	}

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
				message.reply(`You have ${pts}gp`)
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
					'``?spotlight [champion name]``',
					'This command will give you all that you need to know about a champion.',
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
		} else if (content_msg.match(commands.aUpdatePoints.regex)) {
			const isadmin = admin.isAdmin(message.author.id)
			const [command, amount] = content_msg.split(' ')
			if (isadmin && amount != undefined) {
				admin.updatePoints(message, amount)
			} else {
				message.reply('Permission denied you are not an admin of gremilin!')
			}
		} else if (content_msg.match(commands.spotlight.regex)) {
			try {
				const messageContent = message.content
				const [championName] = messageContent
					.substr(messageContent.indexOf(' ') + 1)
					.split(' ')
				if (championName != '?spotlight') {
					const isChampionExist = await spotlight.isChampionExist(championName)
					if (isChampionExist) {
						const msgEmbed = new Discord.RichEmbed()
							.setTitle(`${championName} spotlight`)
							.setDescription(
								` 1⃣ - Story \n
				️️️️      2⃣ - Abilities \n
					  3⃣ - Skins \n
					  4⃣ - Tips \n
					  5⃣ - How to counter
				`
							)

						message.channel.send(msgEmbed)
					}
				} else {
					message.reply('please add a champion name')
				}
			} catch (err) {
				message.channel.send(err.message)
			}
		}
	}
})

client.login(discord_token)
