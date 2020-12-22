const admin = require('firebase-admin')
const functions = require('firebase-functions')
const { path } = require('ramda')
const day = require('dayjs')
const { getUri, getToken } = require('./livechat-auth-client')

const db = admin.firestore()
const accounts = db.collection('accounts')

const installFunctions = (options) => {
	const authorize = (_req, res) => {
		const url = getUri()

		return res.redirect(url)
	}

	const callback = async (req, res) => {
		const { data } = await getToken(
			`https://${path(['headers', 'x-forwarded-host'], req)}${req.url}`
		)

		const tokenExpiresAt = day().add(data.expires_in, 'second').toDate()
		
		await accounts.doc(String(data.license_id)).delete().catch(() => {})

		await accounts.doc(String(data.license_id)).set({
			accessToken: data.access_token,
			accountId: data.account_id,
			entityId: data.entity_id,
			licenseId: data.license_id,
			organizationId: data.organization_id,
			refreshToken: data.refresh_token,
			scope: data.scope,
			tokenType: data.token_type,
			tokenExpiresAt,
		})

		res.redirect(options.thankYouUrl)
	}

	return {
		authorize: functions.https.onRequest(authorize),
		callback: functions.https.onRequest(callback),
	}
}

module.exports = installFunctions
