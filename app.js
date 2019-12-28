require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const discord_token = process.env.TOKEN_BOT;
const Profile = require('./utils/profile');
const ImageEditor = require('./utils/imageEditor');
client.on('ready', () => console.log('ready'));
let msg = null;
const imageEditor = new ImageEditor();
const profile = new Profile();
const commands = {
	profile: { regex: new RegExp('profile', 'gis'), execute: profile.getData },
	setSummoner: {
		regex: new RegExp('setUser', 'gis'),
		execute: profile.setUser
	},
	updateSummoner: {
		regex: new RegExp('updateUser', 'gis'),
		execute: profile.updateUser
	},
	imageEditor: {
		regex: new RegExp('editMe', 'gis'),
		execute: imageEditor.uploadImage
	}
};

client.on('message', message => {
	const content_msg = message.content;
	if (content_msg.startsWith('?')) {
		if (content_msg.match(commands.profile.regex)) {
			commands.profile.execute(message, client);
		} else if (content_msg.match(commands.setSummoner.regex)) {
			commands.setSummoner.execute(message);
		} else if (content_msg.match(commands.updateSummoner.regex)) {
			commands.updateSummoner.execute(message);
		} else if (content_msg.match(commands.imageEditor.regex)) {
			commands.imageEditor.execute(message);
		}
	}
});

client.login(discord_token);
