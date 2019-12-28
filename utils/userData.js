const axios = require('axios');
const fetch = require('node-fetch');
const moment = require('moment');
class Emoji {
	constructor(name, guildId, imageUrl, patch) {
		this.name = name;
		this.guildId = guildId;
		this.imageUrl = imageUrl;
		this.patch = patch;
	}
	async process(message) {
		const base64Emoji = await this.toBase64();
		const upload = await this.upload(base64Emoji);
		const emoji = await message.guild.emojis.find(
			emoji => emoji.name == this.name
		);
		return emoji;
	}
	async upload(base64Emoji) {
		try {
			const uploadUrl = `https://discordapp.com/api/guilds/${this.guildId}/emojis`;
			let body = {
				name: this.name.split(' ')[0],
				image: base64Emoji
			};
			const res = await fetch(uploadUrl, {
				method: 'post',
				body: JSON.stringify(body),
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bot ${process.env.TOKEN_BOT}`
				}
			});
			console.log(res);
		} catch (err) {
			console.log(err);
		}
	}
	async delete(emojiId, guildId) {
		try {
			const deleteUrl = `https://discordapp.com/api/guilds/${guildId}/emojis/${emojiId}`;
			const res = await fetch(deleteUrl, {
				method: 'delete',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bot ${process.env.TOKEN_BOT}`
				}
			});
		} catch (err) {
			console.log(err);
		}
	}
	async toBase64() {
		try {
			const image = this.imageUrl.full;
			const urlImage = `http://ddragon.leagueoflegends.com/cdn/${this.patch}/img/champion/${image}`;
			const response = await fetch(urlImage);
			const buffer = await response.buffer();
			const base64 = `data:image/png;base64,${buffer.toString('base64')}`;
			return base64;
		} catch (err) {
			console.log(err);
		}
	}
}
class UserData {
	constructor(region, username) {
		this.base_url = `https://${UserData.Region(region)}.api.riotgames.com/lol`;
		this.username = username;
	}
	static Region(region) {
		if (region == 'ru' || region == 'kr') {
			return region;
		} else if (region == 'lan') {
			return 'la1';
		} else {
			return region + 1;
		}
	}
	async profileBasicData() {
		try {
			const url = `${this.base_url}/summoner/v4/summoners/by-name/${this.username}?api_key=${process.env.TOKEN_LOL}`;
			const { data: basicData } = await axios.get(url);
			return basicData;
		} catch (err) {
			return false;
		}
	}
	async getCurrentPatch() {
		const url = `https://ddragon.leagueoflegends.com/api/versions.json`;
		const { data } = await axios.get(url);
		return data[0];
	}
	async getChampionById(id) {
		const patch = await this.getCurrentPatch();
		const url = `http://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`;
		const { data: response } = await axios.get(url);
		let champion = [];
		const champions = Object.keys(response.data);
		champions.forEach(champ => {
			if (response.data[champ].key == id) {
				champion.push(response.data[champ]);
			}
		});
		// console.log(champion)
		return champion[0];
	}
	async getChampionByName(name) {
		const patch = await this.getCurrentPatch();
		const championName = new RegExp(name, 'gis');
		const url = `http://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`;
		const { data: response } = await axios.get(url);
		let champion = [];
		const champions = Object.keys(response.data);
		champions.forEach(champ => {
			if (response.data[champ].name.match(championName)) {
				champion.push(response.data[champ]);
			}
		});
		return champion[0];
	}
	async advencedMatchInfo(gameId) {
		const url = `${this.base_url}/match/v4/matches/${gameId}?api_key=${process.env.TOKEN_LOL}`;
		const { data: match } = await axios.get(url);
		return match;
	}
	deleteEmoji(emojiId, guildId) {
		const emoji = new Emoji();
		emoji.delete(emojiId, guildId);
	}
	async mostPlayedChampions(summonerId, patch, message) {
		try {
			const url_mostPlayedChampions = `${this.base_url}/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}?api_key=${process.env.TOKEN_LOL}`;
			const { data } = await axios.get(url_mostPlayedChampions);
			const mostPlayedChampions = data.slice(0, 3);
			return Promise.all(
				mostPlayedChampions.map(async champion => {
					const { championId, championLevel, championPoints } = champion;
					const { image, name } = await this.getChampionById(championId);
					// const emoji = new Emoji(name, message.guild.id, image, patch);
					return {
						name,
						points: championPoints,
						level: championLevel
					};
				})
			);
		} catch (err) {
			console.log(err);
			throw new Error(
				'An error has occurred while trying to fetch most played champions.'
			);
		}
	}
	async rankedInfo(summonerId) {
		try {
			const urlRanked = `${this.base_url}/league/v4/entries/by-summoner/${summonerId}?api_key=${process.env.TOKEN_LOL}`;
			const { data: rankedData } = await axios.get(urlRanked);
			const data = [];
			if (rankedData[0]) {
				const { tier, rank, leaguePoints, wins, losses } = rankedData[0];
				data.push({ tier, rank, leaguePoints, wins, losses });
				return data[0];
			} else {
				return false;
			}
		} catch (err) {
			console.log(err);
			throw new Error(
				'An error has occurred while trying to fetch ranked data.'
			);
		}
	}
	async lastMatch(message) {
		try {
			const patch = await this.getCurrentPatch();
			const { accountId } = await this.profileBasicData();
			const url_lastMatch = `${this.base_url}/match/v4/matchlists/by-account/${accountId}?endIndex=1&beginIndex=0&api_key=${process.env.TOKEN_LOL}`;
			const { data: lastPlayedMatch } = await axios.get(url_lastMatch);
			const { gameId, timestamp } = lastPlayedMatch.matches[0];
			const date = new Date(timestamp); //convert timestamp to normal date
			const time = moment(date, 'YYYYMMDD').fromNow();
			const { name: championName, image } = await this.getChampionById(
				lastPlayedMatch.matches[0].champion
			);
			// const emoji = new Emoji(championName, message.guild.id, image, patch);
			// const championEmoji = await emoji.process(message);
			const {
				gameMode,
				participantIdentities,
				participants
			} = await this.advencedMatchInfo(gameId);
			let currentPlayerId = null;
			const currentPlayerSum = [];
			const data = [];
			participantIdentities.forEach(participant => {
				if (participant.player.accountId === accountId) {
					currentPlayerId = participant.participantId;
				}
			});
			participants.forEach(participant => {
				if (participant.participantId === currentPlayerId) {
					currentPlayerSum.push(participant);
				}
			});
			const {
				win,
				kills,
				deaths,
				assists,
				totalMinionsKilled
			} = currentPlayerSum[0].stats;
			const { role, lane } = currentPlayerSum[0].timeline;
			data.push({
				patch: patch,
				time,
				stats: {
					win,
					kills,
					deaths,
					assists,
					totalMinionsKilled,
					role,
					lane,
					gameMode,
					champion: { name: championName, image }
				}
			});
			return data;
		} catch (err) {
			console.log(err);
			throw new Error(
				'An error has occurred while trying to fetch last match data.'
			);
		}
	}
}
module.exports = UserData;
