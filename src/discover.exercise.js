/** @jsx jsx */
import {useEffect, useRef, useState} from 'react'
import Tooltip from '@reach/tooltip'
import {FaSearch, FaTimes} from 'react-icons/fa'
import {jsx} from '@emotion/core'

import {Input, BookListUL, Spinner} from './components/lib'
import {BookRow} from './components/book-row'
import {useAsync} from 'utils/hooks'
import {client} from './utils/api-client'
import * as colors from 'styles/colors'
import './bootstrap'

function DiscoverBooksScreen() {
  const [isQueryReady, setIsQueryReady] = useState(false)
  const {data, isLoading, isError, isSuccess, run, error} = useAsync()

  // query doesn't need to be reactive
  const queryRef = useRef('')

  useEffect(() => {
    if (!isQueryReady) return
    run(client(`books?query=${encodeURIComponent(queryRef.current)}`))
    setIsQueryReady(false)
  }, [isQueryReady, run])

  function handleSearchSubmit(evt) {
    evt.preventDefault()
    const searchInput = evt.target.elements.search
    queryRef.current = searchInput.value // update queryRef value to prepare for API request
    setIsQueryReady(true) // triggers the API request in useEffect
  }

  return (
    <div
      css={{maxWidth: 800, margin: 'auto', width: '90vw', padding: '40px 0'}}
    >
      <form onSubmit={handleSearchSubmit}>
        <Input
          placeholder="Search books..."
          id="search"
          css={{width: '100%'}}
        />
        <Tooltip label="Search Books">
          <label htmlFor="search">
            <button
              type="submit"
              css={{
                border: '0',
                position: 'relative',
                marginLeft: '-35px',
                background: 'transparent',
              }}
            >
              {isLoading ? (
                <Spinner />
              ) : isError ? (
                <FaTimes aria-label="error" css={{color: colors.danger}} />
              ) : (
                <FaSearch aria-label="search" />
              )}
            </button>
          </label>
        </Tooltip>
      </form>

      {isSuccess ? (
        data?.books?.length ? (
          <BookListUL css={{marginTop: 20}}>
            {data.books.map(book => (
              <li key={book.id} aria-label={book.title}>
                <BookRow key={book.id} book={book} />
              </li>
            ))}
          </BookListUL>
        ) : (
          <p>No books found. Try another search.</p>
        )
      ) : null}

      {isError ? (
        <div css={{color: colors.danger}}>
          <p>There was an error:</p>
          <pre>{error.message}</pre>
        </div>
      ) : null}
    </div>
  )
}

export {DiscoverBooksScreen}
