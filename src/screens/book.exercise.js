/** @jsx jsx */
import {jsx} from '@emotion/core'

import * as React from 'react'
import debounceFn from 'debounce-fn'
import {FaRegCalendarAlt} from 'react-icons/fa'
import Tooltip from '@reach/tooltip'
import {useParams} from 'react-router-dom'

import {useUpdateListItem, useListItem} from 'utils/list-items'
import {useBook} from 'utils/books'
import {formatDate} from 'utils/misc'
import {ErrorMessage, Spinner, Textarea} from 'components/lib'
import {Rating} from 'components/rating'
import {StatusButtons} from 'components/status-buttons'
import * as colors from 'styles/colors'
import * as mq from 'styles/media-queries'
import bookPlaceholderSvg from 'assets/book-placeholder.svg'

const loadingBook = {
  title: 'Loading...',
  author: 'loading...',
  coverImageUrl: bookPlaceholderSvg,
  publisher: 'Loading Publishing',
  synopsis: 'Loading...',
  loadingBook: true,
}

function BookScreen({user}) {
  const {bookId} = useParams()

  const {data} = useBook(bookId, user)
  const book = data?.book ?? loadingBook
  const {title, author, coverImageUrl, publisher, synopsis} = book

  const listItem = useListItem(user, book.id)

  return (
    <div>
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gridGap: '2em',
          marginBottom: '1em',
          [mq.small]: {
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <img
          src={coverImageUrl}
          alt={`${title} book cover`}
          css={{width: '100%', maxWidth: '14rem'}}
        />
        <div>
          <div css={{display: 'flex', position: 'relative'}}>
            <div css={{flex: 1, justifyContent: 'space-between'}}>
              <h1>{title}</h1>
              <div>
                <i>{author}</i>
                <span css={{marginRight: 6, marginLeft: 6}}>|</span>
                <i>{publisher}</i>
              </div>
            </div>
            <div
              css={{
                right: 0,
                color: colors.gray80,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                minHeight: 100,
              }}
            >
              {book.loadingBook ? null : (
                <StatusButtons user={user} book={book} />
              )}
            </div>
          </div>
          <div css={{marginTop: 10, height: 46}}>
            {listItem?.finishDate ? (
              <Rating user={user} listItem={listItem} />
            ) : null}
            {listItem ? <ListItemTimeframe listItem={listItem} /> : null}
          </div>
          <br />
          <p>{synopsis}</p>
        </div>
      </div>
      {!book.loadingBook && listItem ? (
        <NotesTextarea user={user} listItem={listItem} />
      ) : null}
    </div>
  )
}

function ListItemTimeframe({listItem}) {
  const timeframeLabel = listItem.finishDate
    ? 'Start and finish date'
    : 'Start date'

  return (
    <Tooltip label={timeframeLabel}>
      <div aria-label={timeframeLabel} css={{marginTop: 6}}>
        <FaRegCalendarAlt css={{marginTop: -2, marginRight: 5}} />
        <span>
          {formatDate(listItem.startDate)}{' '}
          {listItem.finishDate ? `— ${formatDate(listItem.finishDate)}` : null}
        </span>
      </div>
    </Tooltip>
  )
}

function NotesTextarea({listItem, user}) {
  const [update, {error, isError, isLoading}] = useUpdateListItem(user)
  const debouncedMutate = React.useMemo(
    () => debounceFn(update, {wait: 300}),
    [update],
  )

  function handleNotesChange(e) {
    debouncedMutate({...listItem, notes: e.target.value})
  }

  return (
    <React.Fragment>
      <div>
        <label
          htmlFor="notes"
          css={{
            display: 'inline-block',
            marginRight: 10,
            marginTop: '0',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
          }}
        >
          Notes
        </label>
      </div>
      {isError ? (
        <ErrorMessage
          error={error}
          variant="inline"
          css={{marginLeft: 6, fontSize: '0.7em'}}
        />
      ) : null}
      <div
        css={{
          position: 'relative',
        }}
      >
        <Textarea
          id="notes"
          defaultValue={listItem.notes}
          onChange={handleNotesChange}
          css={{width: '100%', minHeight: 300}}
        />
        {isLoading && (
          <Spinner
            css={{position: 'absolute', right: '0.5rem', top: '0.5rem'}}
          />
        )}
      </div>
    </React.Fragment>
  )
}

export {BookScreen}
