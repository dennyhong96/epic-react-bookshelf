import React from 'react'
import {ReactQueryConfigProvider} from 'react-query'
import {BrowserRouter as Router} from 'react-router-dom'

import {AuthProvider} from './auth-context'

const queryConfig = {
  retry(failureCount, error) {
    if (error.status === 404) return false
    else if (failureCount < 2) return true
    else return false
  },
  useErrorBoundary: true,
  refetchAllOnWindowFocus: false,
}

export const AppProviders = ({children}) => {
  return (
    <AuthProvider>
      <ReactQueryConfigProvider config={queryConfig}>
        <Router>{children}</Router>
      </ReactQueryConfigProvider>
    </AuthProvider>
  )
}
