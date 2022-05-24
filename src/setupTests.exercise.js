import '@testing-library/jest-dom'
import {server} from 'test/server'
import {queryCache} from 'react-query'
import * as auth from 'auth-provider'
import * as usersDB from 'test/data/users'
import * as booksDB from 'test/data/books'
import * as listItemsDB from 'test/data/list-items'

// Anytime Profiler is rendered, the mocked version in the __mocks_
// folder is rendered instead of the real one
jest.mock('components/profiler')

// enable API mocking in test runs using the same request handlers
// as for the client-side mocking.
beforeAll(() => server.listen())

afterAll(() => server.close())

beforeEach(() => {
  jest.useRealTimers() // restore fake timers
})

afterEach(async () => {
  queryCache.clear() // clear cache from the previous test
  await Promise.all([
    auth.logout(), // clears the local storage token
    usersDB.reset(), // Cleanup DB
    booksDB.reset(),
    listItemsDB.reset(),
  ])
  server.resetHandlers()
})
