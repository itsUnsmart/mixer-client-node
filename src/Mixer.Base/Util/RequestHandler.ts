import request = require('request-promise')
// tslint:disable-next-line: no-submodule-imports
import errors = require('request-promise/errors')

export function requestAPI (opts: IRequestOptions) {
	return new Promise((resolve, reject) => {
		const { ['auth']: omit, ...options } = opts

		request(options)
			.then(resolve)
			.catch(errors.StatusCodeError, (reason) => {
				if (reason.statusCode === 429) {
					const header = +reason.response.headers['X-RateLimit-Reset']
					const timeout = isNaN(header) ? Number(header) - Date.now().valueOf() : 3000
					setTimeout(() => {
						requestAPI(options)
					}, timeout)
				} else {
					reject({
						error: reason.error,
						statusCode: reason.statusCode
					})
				}
			})
			.catch(errors.RequestError, (reason) => {
				reject({
					error: reason.cause,
					statusCode: reason.response.statusCode
				})
			})
	})
}

export interface IRequestOptions {
	method: httpRequest
	uri: string
	headers?: object
	body?: object
	auth?: boolean
	json?: boolean
}

type httpRequest = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
