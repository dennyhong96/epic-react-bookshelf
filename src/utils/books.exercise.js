import {useQuery, queryCache} from 'react-query'

import {client} from 'utils/api-client'

export function useBook(bookId, user) {
  return useQuery({
    queryKey: ['book', {bookId}],
    queryFn: async () => await client(`books/${bookId}`, {token: user.token}),
  })
}

export function useBookSearch(query, user) {
  return useQuery({
    queryKey: ['bookSearch', {query}],
    queryFn: async () =>
      await client(`books?query=${encodeURIComponent(query)}`, {
        token: user.token,
      }).then(data => data.books),
  })
}

export async function refetchBookSearchQuery(user) {
  queryCache.removeQueries(['bookSearch'])
  await queryCache.prefetchQuery(['bookSearch', {query: ''}], async () => {
    const books = await client(`books?query=${encodeURIComponent('')}`, {
      token: user.token,
    }).then(data => data.books)
    return books
  })
}
