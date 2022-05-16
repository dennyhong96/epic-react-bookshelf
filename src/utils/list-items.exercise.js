import {useQuery, useMutation, queryCache} from 'react-query'

import {client} from 'utils/api-client'
import {setQueryDataForBook} from './books.exercise'

export function useListItems(user) {
  const {data: listItems} = useQuery({
    queryKey: 'list-items',
    queryFn: async key =>
      await client(key, {token: user.token}).then(data => data.listItems),
    config: {
      onSuccess: listItems => {
        listItems.forEach(li => setQueryDataForBook(li.book))
      },
    },
  })
  return listItems ?? []
}

export function useListItem(user, bookId) {
  const listItems = useListItems(user)
  const listItem = listItems?.find(li => li.bookId === bookId) ?? null
  return listItem
}

const defaultMutationOptions = {
  onSettled: () => queryCache.invalidateQueries('list-items'), // will re-fetch list-items query
  onerror: (err, variables, recover) => {
    if (typeof recover !== 'function') return
    recover()
  },
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
      ...defaultMutationOptions,
      throwOnError,
      onMutate(updatedItem) {
        const prevListItems = queryCache.getQueryData('list-items')
        queryCache.setQueryData('list-items', prev =>
          prev.map(li =>
            li.id === updatedItem.id ? {...li, ...updatedItem} : li,
          ),
        )
        const recover = () =>
          queryCache.setQueryData('list-items', prevListItems)
        return recover
      },
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
      ...defaultMutationOptions,
      throwOnError,
      onMutate({listItemId}) {
        const prevListItems = queryCache.getQueryData('list-items')
        queryCache.setQueryData('list-items', prev =>
          prev.filter(li => li.id !== listItemId),
        )
        const recover = () =>
          queryCache.setQueryData('list-items', prevListItems)
        return recover
      },
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
      ...defaultMutationOptions,
      throwOnError,
      onMutate({bookId}) {
        const prevListItems = queryCache.getQueryData('list-items')
        queryCache.setQueryData('list-items', prev => [...prev, bookId])
        const recover = () =>
          queryCache.setQueryData('list-items', prevListItems)
        return recover
      },
    },
  )
}
