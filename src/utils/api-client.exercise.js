import * as auth from 'auth-provider'
const apiURL = process.env.REACT_APP_API_URL

function client(endpoint, {data, token, ...customConfig} = {}) {
  const config = {
    method: data ? 'POST' : 'GET',
    ...(data && {body: JSON.stringify(data)}),
    headers: {
      ...(token && {Authorization: `Bearer ${token}`}),
      ...(data && {'Content-Type': 'application/json'}),
      ...customConfig.headers,
    },
    ...customConfig,
  }

  return window.fetch(`${apiURL}/${endpoint}`, config).then(async response => {
    if (response.status === 401) {
      await auth.logout()
      // refresh the page for them
      window.location.assign(window.location)
      return Promise.reject({message: 'Please re-authenticate.'})
    }
    const data = await response.json()
    if (response.ok) {
      return data
    } else {
      return Promise.reject(data)
    }
  })
}

export {client}
