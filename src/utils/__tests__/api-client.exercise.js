import {server, rest} from 'test/server'
import {client} from '../api-client'
import {queryCache} from 'react-query'
import * as auth from 'auth-provider'

jest.mock('react-query')
jest.mock('auth-provider')

// jest.mock('react-query', () => {
//   const originalModule = jest.requireActual('react-query')
//   return {
//     ...originalModule,
//     queryCache: {
//       clear: jest.fn(),
//     },
//   }
// })

// jest.mock('auth-provider', () => {
//   const originalModule = jest.requireActual('react-query')
//   return {
//     ...originalModule,
//     logout: jest.fn(),
//   }
// })

const API_URL = process.env.REACT_APP_API_URL

describe('api client', () => {
  test('calls fetch at the endpoint with the arguments for GET requests', async () => {
    const endpoint = 'test-endpoint'
    const mockResult = {mockValue: 'VALUE'}
    server.use(
      rest.get(`${API_URL}/${endpoint}`, async (req, res, ctx) => {
        return res(ctx.json(mockResult))
      }),
    )
    const result = await client(endpoint)
    expect(result).toEqual(mockResult)
  })

  test('adds auth token when a token is provided', async () => {
    const token = 'mock-token'
    const endpoint = 'test-endpoint'
    const mockResult = {mockValue: 'VALUE'}
    let authorization
    server.use(
      rest.get(`${API_URL}/${endpoint}`, async (req, res, ctx) => {
        authorization = req.headers.get('Authorization')
        return res(ctx.json(mockResult))
      }),
    )
    await client(endpoint, {token})
    expect(authorization).toBe(`Bearer ${token}`)
  })

  test('allows for config overrides', async () => {
    const customHeaders = {
      'Content-Type': 'application/json',
    }
    const customConfig = {
      method: 'PUT',
      headers: customHeaders,
    }
    const endpoint = 'test-endpoint'
    const mockResult = {mockValue: 'VALUE'}
    let request
    server.use(
      rest.put(`${API_URL}/${endpoint}`, async (req, res, ctx) => {
        request = req
        return res(ctx.json(mockResult))
      }),
    )
    await client(endpoint, customConfig)
    expect(request.method).toBe(customConfig.method)
    expect(request.headers.get('Content-Type')).toBe(
      customHeaders['Content-Type'],
    )
  })

  test('when data is provided, it is stringified and the method defaults to POST', async () => {
    const myData = {
      hello: 'world',
    }
    const endpoint = 'test-endpoint'
    server.use(
      rest.post(`${API_URL}/${endpoint}`, async (req, res, ctx) => {
        return res(ctx.json(req.body))
      }),
    )
    const response = await client(endpoint, {data: myData})
    expect(response).toEqual(myData)
  })

  test('automatically logs the user out if a request returns a 401', async () => {
    const endpoint = 'test-endpoint'
    server.use(
      rest.get(`${API_URL}/${endpoint}`, async (req, res, ctx) => {
        return res(ctx.status(401), ctx.json({message: `Error`}))
      }),
    )
    const error = await client(endpoint).catch(e => e) // trick to turn a rejected promise into a reolsved promise
    expect(error).toBeDefined()
    expect(error.message).toBe('Please re-authenticate.')
    expect(queryCache.clear).toHaveBeenCalledTimes(1)
    expect(auth.logout).toHaveBeenCalledTimes(1)
  })

  test('correctly rejects the promise if there is an error', async () => {
    const mockError = {message: `Invalid request`}
    const endpoint = 'test-endpoint'
    server.use(
      rest.get(`${API_URL}/${endpoint}`, async (req, res, ctx) => {
        return res(ctx.status(400), ctx.json(mockError))
      }),
    )
    await expect(client(endpoint)).rejects.toEqual(mockError)
    // when using expect(...).rejects or expect(...).resolves, make sure to add await before the expect
  })
})
