const R = require('ramda')
const axios = require('axios')
const baseURL = 'https://api.livechatinc.com/v3.2'

const getRegion = R.ifElse(R.startsWith('fra'), R.always('fra'), R.always('dal')) 

const lcApi = (accessToken) => {
	const client = axios.create({
		baseURL,
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'X-Region': getRegion(accessToken)
		},
	})

	return client
}

module.exports = lcApi
