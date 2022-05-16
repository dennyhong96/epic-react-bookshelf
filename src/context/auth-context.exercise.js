import React, {createContext, useCallback, useContext, useEffect} from 'react'
import * as auth from 'auth-provider'

import {client} from 'utils/api-client'
import {useAsync} from 'utils/hooks'
import {FullPageErrorFallback, FullPageSpinner} from 'components/lib'

const AuthContext = createContext()
AuthContext.displayName = 'AuthContext' // Shows in devtools

export const useAuth = () => {
  const authContext = useContext(AuthContext)
  if (authContext === undefined) {
    throw new Error('useAuth must be used within AuthProvider scope')
  }
  return authContext
}

// returns a client that's already authenticated so we don't need to pass token to it
export const useClient = () => {
  const {user} = useAuth()
  return useCallback(
    (endpoint, config = {}) => client(endpoint, {token: user.token, ...config}),
    [user.token],
  )
}

async function getUser() {
  let user = null
  const token = await auth.getToken()
  if (token) {
    const data = await client('me', {token})
    user = data.user
  }
  return user
}

export const AuthProvider = ({children}) => {
  const {
    data: user,
    run,
    setData,
    isSuccess,
    isLoading,
    isIdle,
    isError,
    error,
  } = useAsync()

  useEffect(() => {
    run(getUser())
  }, [run])

  const login = form => auth.login(form).then(user => setData(user))
  const register = form => auth.register(form).then(user => setData(user))
  const logout = () => {
    auth.logout()
    setData(null)
  }

  if (isLoading || isIdle) return <FullPageSpinner />
  if (isError) return <FullPageErrorFallback error={error} />
  if (isSuccess) {
    return (
      <AuthContext.Provider
        value={{
          user,
          login,
          register,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    )
  }
}
