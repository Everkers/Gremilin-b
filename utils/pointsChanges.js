const sql = require('sqlite')
class Points {
	constructor(tmpId) {
		this.id = null
		this.points = null
		this.tmpId = tmpId
	}
	updated(msg) {
		if (this.points == 100) {
			msg.channel.send(
				` \`congratulations you got ${this.points}gb \`:confetti_ball: `
			)
		} else if (this.points == 200) {
			msg.channel.send(
				` \`congratulations you got ${this.points}gb \`:confetti_ball: `
			)
		} else if (this.points == 300) {
			msg.channel.send(
				` \`congratulations you got ${this.points}gb \`:confetti_ball: `
			)
		}
	}
	async isExist(userId) {
		try {
			const db = await sql.open('./users.sqlite', { Promise })
			const query = `SELECT * FROM UsersData WHERE UserId = ${userId} `
			const data = await Promise.all([db.get(query)])
			if (data[0] == undefined) {
				return false
			} else {
				return true
			}
		} catch (err) {
			console.log(err)
		}
	}
	get getPoints() {
		return (async () => {
			try {
				const db = await sql.open('./users.sqlite', { Promise })
				const query = `SELECT Points FROM UsersData WHERE UserId = ${
					this.id == null ? this.tmpId : this.id
				}`
				const data = await Promise.all([db.get(query)])
				if (data[0] == undefined) {
					return false
				}

				if (data[0].Points == null) {
					return 0
				} else {
					return data[0].Points
				}
			} catch (err) {
				console.log(err)
			}
		})()
	}
	set setPoints(data) {
		;(async () => {
			try {
				const { msg, amount } = data
				const userId = msg.author.id
				const isExist = await this.isExist(userId)
				if (isExist) {
					const db = await sql.open('./users.sqlite', { Promise })
					this.id = userId
					const current = await this.getPoints
					const query = `UPDATE UsersData SET Points = ${current +
						amount} WHERE UserId = ${userId}`
					db.run(query)
					this.points = current + amount
					this.updated(msg)
				}
			} catch (err) {
				console.log(err)
			}
		})()
	}
}

module.exports = Points
