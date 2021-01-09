const { logger, config, firestore } = require('firebase-functions')
const { collection, transaction } = require('typesaurus')
const pRetry = require('p-retry')
const lcApi = require('./lcapi')

const accounts = collection('accounts')

const createBot = ({avatar, name}) => async (entity) => {
	await transaction(
		({ get }) => get(accounts, entity.id),
		async ({ data: account, update }) => {
			const { accessToken, botAgentId, licenseId } = account.data

			if (botAgentId) {
				logger.info('Skipping bot creation as it already exists', {
					licenseId,
					botAgentId,
				})

				return
			}

			const lcClient = lcApi({ accessToken })

			const data = await pRetry(
				async () => {
					const { data } = await lcClient.post(
						'/configuration/action/create_bot',
						{
							avatar,
							name,
						}
					)

					logger.info(`Created bot agent`, {
						licenseId,
						botAgent: data.bot_agent_id,
					})

					return data
				},
				{
					onFailedAttempt: (error) => {
						logger.error(`Failed to create bot agent`, {
							licenseId,
							accessToken,
							error: error.message,
							attemptNumber: error.attemptNumber,
							retriesLeft: error.retriesLeft,
						})
					},
				}
			)

			return update(accounts, entity.id, {
				botAgentId: data.bot_agent_id,
			})
		}
	)
}

module.exports = ({avatar, name}) => firestore.document('accounts/{docId}').onCreate(createBot({avatar, name}))
