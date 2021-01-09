const lcApi = require('./lcapi')
const installFunctions = require('./install')
const auth = require('./livechat-auth-client')
const createBot = require('./create-bot')

module.exports = {
	auth,
	createBot,
	lcApi,
	installFunctions,
}
