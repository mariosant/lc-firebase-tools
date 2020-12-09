const ClientOAuth2 = require('client-oauth2')
const axios = require('axios')
const FormData = require('form-data')
const { config } = require('firebase-functions')
const day = require('dayjs')

const authorizationURL = 'https://accounts.livechatinc.com'
const tokenURL = 'https://accounts.livechatinc.com/token'

const {
	livechat: {
		clientid: clientId,
		clientsecret: clientSecret,
		callbackurl: redirectUri,
	},
} = config()

const livechatAuth = new ClientOAuth2({
	clientId,
	clientSecret,
	accessTokenUri: tokenURL,
	authorizationUri: authorizationURL,
	redirectUri,
})

const useCachedToken = (fn) => async (accountRef) => {
	const accountDoc = await accountRef.get()
	const { accessToken, tokenExpiresAt } = accountDoc.data()

	const expectedDateTime = day().subtract(1, 'hour')

	return day(tokenExpiresAt.toDate()).isAfter(expectedDateTime)
		? accessToken
		: fn(accountRef)
}

const refreshToken = async (accountRef) => {
	const { refreshToken } = (await accountRef.get()).data()

	const bodyFormData = new FormData()

	bodyFormData.append('grant_type', 'refresh_token')
	bodyFormData.append('refresh_token', refreshToken)
	bodyFormData.append('client_id', clientId)
	bodyFormData.append('client_secret', clientSecret)

	const { data } = await axios.post(tokenURL, bodyFormData, {
		headers: {
			...bodyFormData.getHeaders(),
		},
	})

	const freshAccessToken = data.access_token

	await accountRef.update({
		accessToken: freshAccessToken,
		tokenExpiresAt: day().add(28800, 'second').toDate(),
	})

	return freshAccessToken
}

module.exports = {
	getUri: livechatAuth.code.getUri,
	getToken: (...args) => livechatAuth.code.getToken(...args),
	getAccessToken: useCachedToken(refreshToken)
}
