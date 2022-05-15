/** @jsx jsx */
import {jsx} from '@emotion/core'

import * as React from 'react'
import {
  FaCheckCircle,
  FaPlusCircle,
  FaMinusCircle,
  FaBook,
  FaTimesCircle,
} from 'react-icons/fa'
import Tooltip from '@reach/tooltip'
import {useQuery, useMutation, queryCache} from 'react-query'

import {client} from 'utils/api-client'
import {useAsync} from 'utils/hooks'
import {CircleButton, Spinner} from './lib'
import * as colors from 'styles/colors'

function TooltipButton({label, highlight, onClick, icon, ...rest}) {
  const {isLoading, isError, error, run} = useAsync()

  function handleClick() {
    run(onClick())
  }

  return (
    <Tooltip label={isError ? error.message : label}>
      <CircleButton
        css={{
          backgroundColor: 'white',
          ':hover,:focus': {
            color: isLoading
              ? colors.gray80
              : isError
              ? colors.danger
              : highlight,
          },
        }}
        disabled={isLoading}
        onClick={handleClick}
        aria-label={isError ? error.message : label}
        {...rest}
      >
        {isLoading ? <Spinner /> : isError ? <FaTimesCircle /> : icon}
      </CircleButton>
    </Tooltip>
  )
}

function StatusButtons({user, book}) {
  const {data: listItems} = useQuery({
    queryKey: 'list-items',
    queryFn: key =>
      client(key, {token: user.token}).then(data => data.listItems),
  })
  const listItem = listItems?.find(li => li.bookId === book.id) ?? null

  const [update] = useMutation(
    data =>
      client(`list-items/${listItem.id}`, {
        token: user.token,
        data,
        method: 'PUT',
      }),
    {
      onSettled: () => queryCache.invalidateQueries('list-items'), // will re-fetch list-items query
    },
  )

  const [remove] = useMutation(
    () =>
      client(`list-items/${listItem.id}`, {
        token: user.token,
        method: 'DELETE',
      }),
    {
      onSettled: () => queryCache.invalidateQueries('list-items'),
    },
  )

  const [create] = useMutation(
    data =>
      client('list-items', {
        token: user.token,
        data,
      }),
    {
      onSettled: () => queryCache.invalidateQueries('list-items'),
    },
  )

  return (
    <React.Fragment>
      {listItem ? (
        Boolean(listItem.finishDate) ? (
          <TooltipButton
            label="Unmark as read"
            highlight={colors.yellow}
            onClick={update.bind(null, {finishDate: null})}
            icon={<FaBook />}
          />
        ) : (
          <TooltipButton
            label="Mark as read"
            highlight={colors.green}
            onClick={update.bind(null, {finishDate: Date.now()})}
            icon={<FaCheckCircle />}
          />
        )
      ) : null}
      {listItem ? (
        <TooltipButton
          label="Remove from list"
          highlight={colors.danger}
          onClick={remove}
          icon={<FaMinusCircle />}
        />
      ) : (
        <TooltipButton
          label="Add to list"
          highlight={colors.indigo}
          onClick={create.bind(null, {bookId: book.id})}
          icon={<FaPlusCircle />}
        />
      )}
    </React.Fragment>
  )
}

export {StatusButtons}
