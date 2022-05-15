import {useQuery, queryCache} from 'react-query'

import {client} from 'utils/api-client'

export function useBook(bookId, user) {
  return useQuery({
    queryKey: ['book', {bookId}],
    queryFn: async () => {
      const {book} = await client(`books/${bookId}`, {token: user.token})
      return book
    },
  })
}

export function useBookSearch(query, user) {
  return useQuery({
    queryKey: ['bookSearch', {query}],
    queryFn: async () =>
      await client(`books?query=${encodeURIComponent(query)}`, {
        token: user.token,
      }).then(data => data.books),
    config: {
      onSuccess(books) {
        books.forEach(setQueryDataForBook)
      },
    },
  })
}

export async function refetchBookSearchQuery(user) {
  queryCache.removeQueries(['bookSearch'])
  await queryCache.prefetchQuery(['bookSearch', {query: ''}], async () => {
    return await client(`books?query=${encodeURIComponent('')}`, {
      token: user.token,
    }).then(data => data.books)
  })
}

export function setQueryDataForBook(book) {
  queryCache.setQueryData(['book', {bookId: book.id}], book)
}
