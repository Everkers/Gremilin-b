const sql = require('sqlite')
const UserData = require('./userData')
const Discord = require('discord.js')
const points = require('./pointsChanges')
const Points = new points()
class Profile {
	constructor() {}
	async setUser(message) {
		const messageContent = message.content
		const summoner = Profile.extractData(messageContent)
		const db = await sql.open('./users.sqlite', { Promise })
		const createTable = await db.run(
			`CREATE TABLE IF NOT EXISTS UsersData (Username TEXT , Region TEXT , GuildId INTEGER , UserId INTEGER , Points INTEGER) `
		)
		const rows = await Promise.all([
			db.get(`SELECT *  FROM UsersData WHERE UserId = ${message.author.id} `),
		])
		if (!rows[0] && summoner.name != '?setUser' && summoner.region != null) {
			db.run(
				`INSERT INTO UsersData (Username , Region , GuildId  , UserId   ) VALUES (?, ? , ? , ? )`,
				[summoner.name, summoner.region, message.guild.id, message.author.id]
			)
			message.channel.send('summoner has been successfully registered!')
		} else {
			message.channel.send(
				'Something went wrong, if you are trying to update summoner data, Use ``?updateUser [summoner name] [summoner region] to change the current summoner informations``.'
			)
		}
	}
	static async getSummoner(userId) {
		const db = await sql.open('./users.sqlite', { Promise })
		const rows = await Promise.all([
			db.get(`SELECT * FROM UsersData WHERE UserId = ${userId}`),
		])
		if (!rows[0]) {
			return false
		} else {
			return rows
		}
	}
	static extractData(data) {
		if (data.includes('"')) {
			// const name = data.match(/"(.*?)"/g)[0].replace(/"/g, '')
			let [command, name, region] = data.split('"')
			region = region.trim()
			return { name, region }
		} else {
			let [command, name, region] = data.split(' ')
			return { name, region }
		}
	}
	async updateUser(message) {
		const messageContent = message.content
		const summoner = Profile.extractData(messageContent)
		const db = await sql.open('./users.sqlite', { Promise })
		const inputData = [summoner.name, summoner.region, message.author.id]
		const rows = await Promise.all([
			db.get(`SELECT *  FROM UsersData WHERE UserId = ${message.author.id} `),
		])
		if (!rows[0]) {
			message.channel.send(
				'Make sure to set the user first ``?setUser [summoner name] [summoner region]``. '
			)
		} else if (summoner.name != '?updateUser' && summoner.name != null) {
			db.run(
				'UPDATE UsersData SET Username=? , Region =?  WHERE UserId=? ',
				inputData
			)
			message.channel.send('summoner data has been updated!')
		} else {
			message.channel.send('Check your inputs and try again!')
		}
	}

	async getData(message, client) {
		try {
			const getSummoner = await Profile.getSummoner(message.author.id)
			if (getSummoner) {
				const { Username, Region } = getSummoner[0]
				const userData = new UserData(Region, Username)
				const {
					summonerLevel,
					name: summonerName,
					profileIconId,
					id: summonerId,
				} = await userData.profileBasicData()
				const lastMatch = await userData.lastMatch(message)
				const { patch, time, mode, map } = lastMatch[0]
				const {
					win,
					kills,
					deaths,
					assists,
					totalMinionsKilled,
					neutralMinionsKilled,
					lane,
					role,
				} = lastMatch[0].stats
				const {
					name: championName,
					image: championImages,
				} = lastMatch[0].stats.champion
				const mostPlayedChampions = await userData.mostPlayedChampions(
					summonerId,
					patch,
					message
				)
				const rankedInfo = await userData.rankedInfo(summonerId)
				const currentMatch = await userData.getCurrentMatch(summonerId)
				const messageStyles = new Discord.RichEmbed()
					.setColor('#e74c3c')
					.setTitle(`${Username} Profile`)
					.setThumbnail(
						`http://ddragon.leagueoflegends.com/cdn/${patch}/img/profileicon/${profileIconId}.png`
					)
					.addField(
						'Last Played Match',
						` \`${map} | ${mode}\` \n
						[${win ? 'Victory' : 'defeat'} ${
							deaths == 0 && kills > 1 ? ', ``' + 'PERFECT KDA' + '``' : ''
						}] ${
							role == 'NONE' ? '' : role
						} ${lane} as ${championName} with **${kills}/${deaths}/${assists}** and **${totalMinionsKilled +
							neutralMinionsKilled}CS** ${time}`,
						true
					)
					.addField('Level / Region', `${summonerLevel} / ${Region}`, true)
					.addBlankField()
					.addField(
						`Highest Champions Mastery`,
						`
						${
							mostPlayedChampions.length > 1
								? mostPlayedChampions
										.map((champ, index) => {
											const data = `[${index + 1}] ${champ.name} - ${
												champ.points
											}pts \n `
											return data
										})
										.join('')
								: 'no mastery champions'
						}
						`,
						true
					)
					.addField(
						`Summoner Rank`,
						`\`Flex\`\n ${
							rankedInfo.flex
								? `Tier : ${rankedInfo.flex[0].tier} \n Rank : ${rankedInfo.flex[0].rank} \n Points : ${rankedInfo.flex[0].leaguePoints} \n Wins : ${rankedInfo.flex[0].wins}  \n Losses : ${rankedInfo.flex[0].losses}   `
								: 'No Flex Data'
						}
						\`Solo\` \n ${
							rankedInfo.solo
								? `Tier : ${rankedInfo.solo[0].tier} \n Rank : ${rankedInfo.solo[0].rank} \n Points : ${rankedInfo.solo[0].leaguePoints} \n Wins : ${rankedInfo.solo[0].wins}  \n Losses : ${rankedInfo.solo[0].losses}`
								: 'No Solo/Duo Data'
						}
						`,
						// `${
						// 	rankedInfo
						// 		? `Tier : ${rankedInfo.tier} \n Rank : ${rankedInfo.rank} \n Points : ${rankedInfo.leaguePoints} \n Wins : ${rankedInfo.wins} \n Losses : ${rankedInfo.losses}`
						// 		: 'Unranked'
						// }`,
						true
					)
					.addField(
						`Current Match`,
						`${
							currentMatch
								? `${currentMatch.userTeam
										.map(
											user =>
												`${
													user.summonerName == summonerName
														? '``' + user.summonerName + '``'
														: user.summonerName
												} | ${user.championName} \n`
										)
										.join('')} 
								   ___Vs___
								    \n ${currentMatch.enemyTeam
											.map(
												user =>
													`${
														user.summonerName == summonerName
															? '``' + user.summonerName + '``'
															: user.summonerName
													} | ${user.championName} \n`
											)
											.join('')}`
								: 'This player is not playing right now.'
						}`
					)
					.setFooter(
						`Developed with love by Everkers#6416`,
						'https://i.pinimg.com/236x/f0/10/b2/f010b2798bfaa02c4afd72cb2aef6bfc.jpg'
					)
				message.channel.send(messageStyles)
				Points.setPoints = { msg: message, amount: 2 }
			} else {
				message.channel.send(
					'Try to set user first ``?setUser [summoner name] [summoner region]`` '
				)
			}
		} catch (err) {
			message.channel.send(err.message)
		}
	}
}
module.exports = Profile
