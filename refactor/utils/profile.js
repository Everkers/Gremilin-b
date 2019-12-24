const sql = require('sqlite');
const UserData = require('./userData');
const Discord = require('discord.js');
class Profile {
	constructor() {}
	async setUser(message) {
		const messageContent = message.content;
		const [summoner, region] = messageContent
			.substr(messageContent.indexOf(' ') + 1)
			.split(' ');

		const db = await sql.open('./users.sqlite', { Promise });
		const createTable = await db.run(
			`CREATE TABLE IF NOT EXISTS UsersData (Username TEXT , Region TEXT , GuildId INTEGER , UserId INTEGER) `
		);
		const rows = await Promise.all([
			db.get(`SELECT *  FROM UsersData WHERE UserId = ${message.author.id} `)
		]);
		if (!rows[0] && summoner != '?setUser' && region != null) {
			db.run(
				`INSERT INTO UsersData (Username , Region , GuildId  , UserId   ) VALUES (?, ? , ? , ? )`,
				[summoner, region, message.guild.id, message.author.id]
			);
			message.channel.send('summoner has been successfully registered!');
		} else {
			message.channel.send(
				'Something went wrong, if you are trying to update summoner data, Use ``?updateUser [summoner name] [summoner region] to change the current summoner informations``.'
			);
		}
	}
	static async getSummoner(userId) {
		const db = await sql.open('./users.sqlite', { Promise });
		const rows = await Promise.all([
			db.get(`SELECT * FROM UsersData WHERE UserId = ${userId}`)
		]);
		if (!rows[0]) {
			return false;
		} else {
			return rows;
		}
	}
	async updateUser(message) {
		const messageContent = message.content;
		const [summoner, region] = messageContent
			.substr(messageContent.indexOf(' ') + 1)
			.split(' ');
		const db = await sql.open('./users.sqlite', { Promise });
		const inputData = [summoner, region, message.author.id];
		const rows = await Promise.all([
			db.get(`SELECT *  FROM UsersData WHERE UserId = ${message.author.id} `)
		]);
		if (!rows[0]) {
			message.channel.send(
				'Make sure to set the user first ``?setUser [summoner name] [summoner region]``. '
			);
		} else if (summoner != '?updateUser' && region != null) {
			db.run(
				'UPDATE UsersData SET Username=? , Region =?  WHERE UserId=? ',
				inputData
			);
			message.channel.send('summoner data has been updated!');
		} else {
			message.channel.send('Check your inputs and try again!');
		}
	}

	async getData(message, client) {
		try {
			const getSummoner = await Profile.getSummoner(message.author.id);
			if (getSummoner) {
				const { Username, Region } = getSummoner[0];
				const userData = new UserData(Region, Username);
				const {
					summonerLevel,
					profileIconId,
					id: summonerId
				} = await userData.profileBasicData();
				const lastMatch = await userData.lastMatch(message);
				const { patch, time } = lastMatch[0];
				const {
					win,
					kills,
					deaths,
					assists,
					totalMinionsKilled,
					lane,
					role
				} = lastMatch[0].stats;
				const {
					name: championName,
					image: championImages
				} = lastMatch[0].stats.champion;
				const mostPlayedChampions = await userData.mostPlayedChampions(
					summonerId,
					patch,
					message
				);
				const rankedInfo = await userData.rankedInfo(summonerId);
				const messageStyles = new Discord.RichEmbed()
					.setColor('#e74c3c')
					.setTitle(`${Username} Profile`)
					.setThumbnail(
						`http://ddragon.leagueoflegends.com/cdn/9.19.1/img/profileicon/${profileIconId}.png`
					)
					.addField(
						'Last Played Match',
						`[${
							win ? 'Victory' : 'defeat'
						}] ${role} ${lane} as ${championName} with **${kills}/${deaths}/${assists}** and **${totalMinionsKilled}CS** ${time}`,
						true
					)
					.addField('Level / Region', `${summonerLevel} / ${Region}`, true)
					.addBlankField()
					.addField(
						`Highest Champions Mastery`,
						`
						${mostPlayedChampions
							.map((champ, index) => {
								const data = `[${index + 1}] ${champ.name} - ${
									champ.points
								}pts \n `;
								return data;
							})
							.join('')}
						`,
						true
					)
					.addField(
						`Summoner Rank`,
						`${
							rankedInfo
								? `Tier : ${rankedInfo.tier} \n Rank : ${rankedInfo.rank} \n Points : ${rankedInfo.leaguePoints} \n Wins : ${rankedInfo.wins} \n Losses : ${rankedInfo.losses}`
								: 'Unranked'
						}`,
						true
					);
				message.channel.send(messageStyles);
				// userData.deleteEmoji(championEmoji.id, message.guild.id);
			} else {
				message.channel.send(
					'Try to set user first ``?setUser [summoner name] [summoner region]`` '
				);
			}
		} catch (err) {
			console.log(err);
			message.channel.send(err.message);
		}
	}
}
module.exports = Profile;
