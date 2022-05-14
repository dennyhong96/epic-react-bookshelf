/** @jsx jsx */
import {jsx} from '@emotion/core'
import {useEffect} from 'react'
import * as auth from 'auth-provider'

import {AuthenticatedApp} from './authenticated-app'
import {UnauthenticatedApp} from './unauthenticated-app'
import {FullPageSpinner} from 'components/lib'
import * as colors from 'styles/colors'
import {client} from 'utils/api-client.extra-4'
import {useAsync} from 'utils/hooks'

const getUser = async () => {
  const token = await auth.getToken()
  if (token) {
    const data = await client('me', {token})
    return data.user
  }
  return null
}

function App() {
  const {
    data: user,
    error,
    isError,
    isIdle,
    isLoading,
    setData,
    setError,
    run,
  } = useAsync(null)

  useEffect(() => {
    run(getUser())
  }, [run])

  const login = async ({username, password}) => {
    try {
      const user = await auth.login({username, password})
      setData(user)
    } catch (error) {
      setError(error)
    }
  }

  const register = async ({username, password}) => {
    try {
      const user = await auth.register({username, password})
      setData(user)
    } catch (error) {
      setError(error)
    }
  }

  const logout = async () => {
    try {
      await auth.logout()
      setData(null)
    } catch (error) {
      setError(error)
    }
  }

  return isError ? (
    <div
      css={{
        color: colors.danger,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <p>Uh oh... There's a problem. Try refreshing the app.</p>
      <pre>{error.message}</pre>
    </div>
  ) : isIdle || isLoading ? (
    <FullPageSpinner />
  ) : user ? (
    <AuthenticatedApp user={user} logout={logout} />
  ) : (
    <UnauthenticatedApp login={login} register={register} />
  )
}

export {App}

/*
eslint
  no-unused-vars: "off",
*/
