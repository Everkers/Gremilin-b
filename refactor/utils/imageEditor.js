const axios = require('axios');
class ImageEditor {
	constructor() {}
	async uploadImage(message) {
		try {
			const imageUrl = message.author.avatarURL;
			const { data: image } = await axios.get(
				`http://localhost:3000/imageUpload?url=${imageUrl}`
			);
			const { url: editedImageUrl, id } = image;
			const sendImage = await message.channel.send('BINGO!:heart:', {
				files: [editedImageUrl]
			});
			ImageEditor.deleteImage(id);
		} catch (err) {
			console.log(err);
		}
	}
	static async deleteImage(id) {
		try {
			const { data: remove } = await axios.get(
				`http://localhost:3000/imageDelete/${id}`
			);
		} catch (err) {
			console.log(err);
		}
	}
}
module.exports = ImageEditor;
