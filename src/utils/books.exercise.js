import {useQuery, queryCache} from 'react-query'

import {client} from 'utils/api-client'
import bookPlaceholderSvg from 'assets/book-placeholder.svg'

const loadingBook = {
  title: 'Loading...',
  author: 'loading...',
  coverImageUrl: bookPlaceholderSvg,
  publisher: 'Loading Publishing',
  synopsis: 'Loading...',
  loadingBook: true,
}

const loadingBooks = Array.from({length: 10}, (v, index) => ({
  id: `loading-book-${index}`,
  ...loadingBook,
}))

function getBookSearchConfig(query, user) {
  return {
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
  }
}

export function useBook(bookId, user) {
  const result = useQuery({
    queryKey: ['book', {bookId}],
    queryFn: async () => {
      const {book} = await client(`books/${bookId}`, {token: user.token})
      return book
    },
  })
  return {...result, data: result.data ?? loadingBook}
}

export function useBookSearch(query, user) {
  const result = useQuery(getBookSearchConfig(query, user))
  return {...result, books: result.data ?? loadingBooks}
}

export async function refetchBookSearchQuery(user) {
  queryCache.removeQueries(['bookSearch'])
  // Prefetch query and cache for later use
  await queryCache.prefetchQuery(getBookSearchConfig('', user))
}

export function setQueryDataForBook(book) {
  queryCache.setQueryData(['book', {bookId: book.id}], book)
}
