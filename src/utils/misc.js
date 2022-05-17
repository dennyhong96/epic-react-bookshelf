const formatDate = date =>
  new Intl.DateTimeFormat('en-US', {month: 'short', year: '2-digit'}).format(
    date,
  )

const callAll =
  (...fns) =>
  (...args) =>
    fns.forEach(fn => typeof fn === 'function' && fn(...args))

export {formatDate, callAll}
