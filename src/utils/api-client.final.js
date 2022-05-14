async function client(endpoint, customConfig = {}) {
  const config = {method: 'GET', ...customConfig}
  const res = await window.fetch(
    `${process.env.REACT_APP_API_URL}/${endpoint}`,
    config,
  )
  const data = await res.json()
  if (!res.ok) {
    return Promise.reject(new Error(res.statusText))
  } else {
    return data
  }
}

export {client}
