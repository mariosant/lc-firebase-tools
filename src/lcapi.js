const R = require('ramda')
const axios = require('axios')
const baseURL = 'https://api.livechatinc.com/v3.2'

const isNotNil = R.complement(R.isNil)

const getRegion = R.ifElse(R.startsWith('fra'), R.always('fra'), R.always('dal')) 
const getBotAgentHeader = R.ifElse(isNotNil, botAgentId => ({'X-Author-Id': botAgentId}), R.always({}))

const lcApi = ({accessToken, botAgentId}) => {
	console.log({accessToken, botAgentId})

	const client = axios.create({
		baseURL,
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'X-Region': getRegion(accessToken),
			...getBotAgentHeader(botAgentId)
		},
	})

	return client
}

module.exports = lcApi
