import {
  render as _render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import {buildUser} from 'test/generate'
import * as auth from 'auth-provider'
import {AppProviders} from 'context'
import * as usersDB from 'test/data/users'
import userEvent from '@testing-library/user-event'

const render = async (ui, {route = '/list', user, ...renderOptions} = {}) => {
  user = typeof user === 'undefined' ? await loginUser() : user
  window.history.pushState({}, 'Test Page', route)
  const returnValues = {
    ..._render(ui, {
      wrapper: AppProviders,
      ...renderOptions,
    }),
    user,
  }
  await waitForLoadingToFinish()
  return returnValues
}

const loginUser = async () => {
  const user = buildUser()
  await usersDB.create(user)
  const authenticatedUser = await usersDB.authenticate(user)
  localStorage.setItem(auth.localStorageKey, authenticatedUser.token) // "authenticate" the client
  return authenticatedUser
}

const waitForLoadingToFinish = async () => {
  // Will wait until element no longer returns (empty array)
  await waitForElementToBeRemoved(() => [
    ...screen.queryAllByLabelText(/loading/i),
    ...screen.queryAllByText(/loading/i),
  ])
}

export * from '@testing-library/react'
export {render, userEvent, loginUser, waitForLoadingToFinish}
