import {useQuery, useMutation, queryCache} from 'react-query'

import {client} from 'utils/api-client'

export function useListItems(user) {
  const queryResult = useQuery({
    queryKey: 'list-items',
    queryFn: key =>
      client(key, {token: user.token}).then(data => data.listItems),
  })
  return queryResult
}

export function useListItem(user, bookId) {
  const {data: listItems} = useListItems(user)
  const listItem = listItems?.find(li => li.bookId === bookId) ?? null
  return listItem
}

export function useUpdateListItem(user) {
  const [update] = useMutation(
    listItem => {
      console.log({listItem})
      client(`list-items/${listItem.id}`, {
        token: user.token,
        data: listItem,
        method: 'PUT',
      })
    },
    {
      onSettled: () => queryCache.invalidateQueries('list-items'), // will re-fetch list-items query
    },
  )
  return [update]
}

export function useRemoveListItem(user) {
  const [remove] = useMutation(
    ({listItemId}) =>
      client(`list-items/${listItemId}`, {
        token: user.token,
        method: 'DELETE',
      }),
    {
      onSettled: () => queryCache.invalidateQueries('list-items'),
    },
  )
  return [remove]
}

export function useCreateListItem(user) {
  const [create] = useMutation(
    listItem =>
      client('list-items', {
        token: user.token,
        data: listItem,
      }),
    {
      onSettled: () => queryCache.invalidateQueries('list-items'),
    },
  )
  return [create]
}
