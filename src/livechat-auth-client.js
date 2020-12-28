const ClientOAuth2 = require('client-oauth2')
const { config } = require('firebase-functions')
const dayjs = require('dayjs')

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
	const {tokenExpiresAt, token: t} = (await accountRef.get()).data()
	const token = livechatAuth.createToken(JSON.parse(t))
	
	token.expiresIn(tokenExpiresAt.toDate())

	return token.expired()
		? fn(accountRef)
		: token.accessToken
}

const refreshToken = async (accountRef) => {
	const {token: t} = (await accountRef.get()).data()

	const oldToken = livechatAuth.createToken(JSON.parse(t))
	const token = await oldToken.refresh()

	await accountRef.set({
		accessToken: token.accessToken,
		token: JSON.stringify(token.data),
		tokenExpiresAt: dayjs().add(token.data.expires_in, 'second').toDate()
	}, {merge: true})

	return token.accessToken
}

module.exports = {
	getUri: livechatAuth.code.getUri,
	getToken: (...args) => livechatAuth.code.getToken(...args),
	getAccessToken: useCachedToken(refreshToken),
}
