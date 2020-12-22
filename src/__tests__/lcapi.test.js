const lcApi = require('../lcapi')

beforeEach(() => {
	jest.clearAllMocks()
})

describe('lcApi', () => {
	test('should make a client if accessToken is provided', () => {
		const client = lcApi({ accessToken: 'lorem' })

		expect(client).toHaveProperty('get')
		expect(client).toHaveProperty('post')
	})

	test('should make a client if everything provided', () => {
		const client = lcApi({ accessToken: 'lorem', botAgentId: 'ipsum' })

		expect(client).toHaveProperty('get')
		expect(client).toHaveProperty('post')
    })
    
    test('should make a client if nothing is provided', () => {
		const client = lcApi({})

		expect(client).toHaveProperty('get')
		expect(client).toHaveProperty('post')
	})
})
