const axios = require('axios');
const fetch = require('node-fetch');
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
		const emoji = message.guild.emojis.find(emoji => emoji.name == this.name);
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
	async advencedMatchInfo(gameId) {
		const url = `https://euw1.api.riotgames.com/lol/match/v4/matches/${gameId}?api_key=${process.env.TOKEN_LOL}`;
		const { data: match } = await axios.get(url);
		return match;
	}
	deleteEmoji(emojiId, guildId) {
		const emoji = new Emoji();
		emoji.delete(emojiId, guildId);
	}
	async lastMatch(message) {
		const patch = await this.getCurrentPatch();
		const { accountId } = await this.profileBasicData();
		const url_lastMatch = `${this.base_url}/match/v4/matchlists/by-account/${accountId}?endIndex=1&beginIndex=0&api_key=${process.env.TOKEN_LOL}`;
		const { data: lastPlayedMatch } = await axios.get(url_lastMatch);
		const { gameId } = lastPlayedMatch.matches[0];
		const { name: championName, image } = await this.getChampionById(
			lastPlayedMatch.matches[0].champion
		);
		const emoji = new Emoji(championName, message.guild.id, image, patch);
		const championEmoji = await emoji.process(message);
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
			stats: {
				win,
				kills,
				deaths,
				assists,
				totalMinionsKilled,
				role,
				lane,
				gameMode,
				champion: { name: championName, image, championEmoji }
			}
		});
		return data;
	}
}
module.exports = UserData;
