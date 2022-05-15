import {useQuery, useMutation, queryCache} from 'react-query'

import {client} from 'utils/api-client'
import {setQueryDataForBook} from './books.exercise'

export function useListItems(user) {
  return useQuery({
    queryKey: 'list-items',
    queryFn: async key =>
      await client(key, {token: user.token}).then(data => data.listItems),
    config: {
      onSuccess: listItems => {
        listItems.forEach(li => setQueryDataForBook(li.book))
      },
    },
  })
}

export function useListItem(user, bookId) {
  const {data: listItems} = useListItems(user)
  const listItem = listItems?.find(li => li.bookId === bookId) ?? null
  return listItem
}

export function useUpdateListItem(user, {throwOnError = false} = {}) {
  return useMutation(
    async listItem =>
      await client(`list-items/${listItem.id}`, {
        token: user.token,
        data: listItem,
        method: 'PUT',
      }),
    {
      onSettled: () => queryCache.invalidateQueries('list-items'), // will re-fetch list-items query
      throwOnError,
    },
  )
}

export function useRemoveListItem(user, {throwOnError = false} = {}) {
  return useMutation(
    async ({listItemId}) =>
      await client(`list-items/${listItemId}`, {
        token: user.token,
        method: 'DELETE',
      }),
    {
      onSettled: () => queryCache.invalidateQueries('list-items'),
      throwOnError,
    },
  )
}

export function useCreateListItem(user, {throwOnError = false} = {}) {
  return useMutation(
    async listItem =>
      await client('list-items', {
        token: user.token,
        data: listItem,
      }),
    {
      onSettled: () => queryCache.invalidateQueries('list-items'),
      throwOnError,
    },
  )
}
