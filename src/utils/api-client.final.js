function client(endpoint, customConfig = {}) {
  const config = {
    method: 'GET',
    ...customConfig,
  }
  return window
    .fetch(`${process.env.REACT_APP_API_URL}/${endpoint}`, config)
    .then(res => {
      if (!res.ok) return Promise.reject(new Error(res.statusText))
      return res.json()
    })
}

export {client}
