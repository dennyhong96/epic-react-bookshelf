import {useQuery} from 'react-query'

import {client} from 'utils/api-client'

export function useBook(bookId, user) {
  const queryResult = useQuery({
    queryKey: ['book', {bookId}],
    queryFn: () => client(`books/${bookId}`, {token: user.token}),
  })
  return queryResult
}

export function useBookSearch(query, user) {
  const queryResult = useQuery({
    queryKey: ['bookSearch', {query}],
    queryFn: () =>
      client(`books?query=${encodeURIComponent(query)}`, {
        token: user.token,
      }).then(data => data.books),
  })
  return queryResult
}
