const axios = require('axios')
const Discord = require('discord.js')
const UserData = require('./userData')
const points = require('./pointsChanges')
const Points = new points()
class Champion {
	async getData(message) {
		const messageContent = message.content
		const [championName] = messageContent
			.substr(messageContent.indexOf(' ') + 1)
			.split(' ')
		if (championName == '?champion') {
			message.channel.send('type a champion name')
		} else {
			const userData = new UserData()
			const patch = await userData.getCurrentPatch()
			const { image } = await userData.getChampionByName(championName)
			const championImage = `http://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${image.full}`
			const { data: championData } = await axios.get(
				`https://league-fire-b.herokuapp.com/champion/${championName}`
			)
			const messageStyles = new Discord.RichEmbed()
				.setColor('#e74c3c')
				.setTitle(`${championData.data.champion}`)
				.setThumbnail(championImage)
				.addField(
					`Best Items for ${championData.data.champion} `,
					`${
						championData.data.build.guide
					} \n \n ${championData.data.build.items
						.map((item, i) => `[${i + 1}] ${item} \n`)
						.join('')}`,
					true
				)
				.addField(
					`Best Runes for ${championData.data.champion}`,
					`${
						championData.data.runes.guide
					} \n \n Primary Tree \n ${championData.data.runes.data.primary
						.map((rune, i) => `[${i + 1}] ${rune}\n`)
						.join(
							''
						)} \n Secondary Tree\n ${championData.data.runes.data.secondary
						.map((rune, i) => `[${i + 1}] ${rune}\n`)
						.join('')} \nThird Tree\n  ${championData.data.runes.data.third
						.map((rune, i) => `[${i + 1}] ${rune}\n`)
						.join('')} `,
					true
				)
				.addField(
					'Skill Order',
					`${
						championData.data.skillsOrder.guide
					}\n \n  ${championData.data.skillsOrder.order.map((item, i) => {
						return `${Object.keys(item)} : ${Object.values(item)}   `
					})} `
				)
				.setFooter(
					`Developed with love by Everkers#6416`,
					'https://i.pinimg.com/236x/f0/10/b2/f010b2798bfaa02c4afd72cb2aef6bfc.jpg'
				)

			message.channel.send(messageStyles)
			Points.setPoints = { msg: message, amount: 2 }
		}
	}
}
module.exports = Champion
