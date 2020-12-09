const lcApi = require('./lcapi')
const installFunctions = require('./install')
const auth = require('./livechat-auth-client')

module.exports = {
	auth,
	lcApi,
	installFunctions,
}
