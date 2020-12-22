const R = require('ramda')
const axios = require('axios')
const baseURL = 'https://api.livechatinc.com/v3.2'

const isNotNil = R.complement(R.isNil)

const getRegion = R.when(isNotNil, R.ifElse(
	R.startsWith('fra'),
	R.always({ 'X-Region': 'fra' }),
	R.always({ 'X-Region': 'dal' })
))

const getBotAgentHeader = R.ifElse(
	isNotNil,
	(botAgentId) => ({ 'X-Author-Id': botAgentId }),
	R.always({})
)

const lcApi = ({ accessToken, botAgentId }) => {
	const client = axios.create({
		baseURL,
		headers: {
			Authorization: `Bearer ${accessToken}`,
			...getRegion(accessToken),
			...getBotAgentHeader(botAgentId),
		},
	})

	return client
}

module.exports = lcApi
