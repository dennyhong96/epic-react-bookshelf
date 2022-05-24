import * as React from 'react'
import {buildBook, buildListItem} from 'test/generate'
import {App} from 'app'
import * as booksDB from 'test/data/books'
import * as listItemsDB from 'test/data/list-items'
import {
  waitForLoadingToFinish,
  render,
  userEvent,
  screen,
  loginUser,
} from 'test/app-test-utils'
import faker from 'faker'

const renderBookScreen = async ({listItem, user, book} = {}) => {
  if (user === undefined) {
    user = await loginUser()
  }
  if (book === undefined) {
    book = await booksDB.create(buildBook())
  }
  if (listItem === undefined) {
    listItem = await listItemsDB.create(buildListItem({owner: user, book}))
  }
  const route = `/book/${book.id}`
  const utils = await render(<App />, {route, user})
  return {...utils, book, user, listItem}
}

describe('App', () => {
  test('renders all the book information', async () => {
    const {book} = await renderBookScreen({listItem: null})

    expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()
    expect(screen.getByText(book.author)).toBeInTheDocument()
    expect(screen.getByText(book.publisher)).toBeInTheDocument()
    expect(screen.getByText(book.synopsis)).toBeInTheDocument()
    expect(screen.getByRole('img', {name: /book cover/i})).toHaveAttribute(
      'src',
      book.coverImageUrl,
    )
    expect(
      screen.getByRole('button', {name: /add to list/i}),
    ).toBeInTheDocument()

    // queryByRole will return null, no error
    expect(
      screen.queryByRole('button', {name: /remove from list/i}),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', {name: /mark as read/i}),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', {name: /mark as unread/i}),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('textbox', {name: /notes/i}),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument()
  })

  test('can create a list item for the book', async () => {
    const {book} = await renderBookScreen({listItem: null})

    const addToListButton = screen.getByRole('button', {name: /add to list/i})
    expect(addToListButton).toBeInTheDocument()
    await userEvent.click(addToListButton)
    expect(addToListButton).toBeDisabled()
    await waitForLoadingToFinish()

    expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()
    expect(screen.getByText(book.author)).toBeInTheDocument()
    expect(screen.getByText(book.publisher)).toBeInTheDocument()
    expect(screen.getByText(book.synopsis)).toBeInTheDocument()
    expect(screen.getByRole('img', {name: /book cover/i})).toHaveAttribute(
      'src',
      book.coverImageUrl,
    )
    expect(
      screen.queryByRole('button', {name: /add to list/i}),
    ).not.toBeInTheDocument()

    expect(
      screen.getByRole('button', {name: /remove from list/i}),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {name: /mark as read/i}),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', {name: /mark as unread/i}),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox', {name: /notes/i})).toBeInTheDocument()
    expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
    expect(screen.getByLabelText(/Start date/i)).toBeInTheDocument()
  })

  test('can remove a list item for the book', async () => {
    await renderBookScreen()

    const remoteFromlistButton = screen.getByRole('button', {
      name: /remove from list/i,
    })
    expect(remoteFromlistButton).toBeInTheDocument()
    await userEvent.click(remoteFromlistButton)
    expect(remoteFromlistButton).toBeDisabled()
    await waitForLoadingToFinish()

    expect(
      screen.getByRole('button', {name: /add to list/i}),
    ).toBeInTheDocument()

    // queryByRole will return null, no error
    expect(
      screen.queryByRole('button', {name: /remove from list/i}),
    ).not.toBeInTheDocument()
  })

  test('can mark a list item as read', async () => {
    const {book} = await renderBookScreen()

    const markAsReadButton = screen.getByRole('button', {name: /mark as read/i})
    expect(markAsReadButton).toBeInTheDocument()
    await userEvent.click(markAsReadButton)
    await waitForLoadingToFinish()

    expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()
    expect(screen.getByText(book.author)).toBeInTheDocument()
    expect(screen.getByText(book.publisher)).toBeInTheDocument()
    expect(screen.getByText(book.synopsis)).toBeInTheDocument()
    expect(screen.getByRole('img', {name: /book cover/i})).toHaveAttribute(
      'src',
      book.coverImageUrl,
    )
    expect(
      screen.queryByRole('button', {name: /add to list/i}),
    ).not.toBeInTheDocument()

    expect(
      screen.getByRole('button', {name: /remove from list/i}),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', {name: /mark as read/i}),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', {name: /mark as unread/i}),
    ).toBeInTheDocument()
    expect(screen.queryByRole('textbox', {name: /notes/i})).toBeInTheDocument()
    expect(screen.getAllByRole('radio', {name: /star/i}).length).toBe(5)
    expect(screen.queryByLabelText(/Start date/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/Start and finish date/i)).toBeInTheDocument()
  })

  test('can edit a note', async () => {
    // using fake timers to skip debounce time
    jest.useFakeTimers()

    const {listItem} = await renderBookScreen()

    const newNotes = faker.lorem.words()
    const notesTextarea = screen.getByRole('textbox', {name: /notes/i})

    // Must setup userEvent to use advanceTimers when using fake timers
    const fakeTimerUserEvent = userEvent.setup({
      advanceTimers: () => jest.runOnlyPendingTimers(),
    })
    await fakeTimerUserEvent.clear(notesTextarea)
    await fakeTimerUserEvent.type(notesTextarea, newNotes)

    // wait for the loading spinner to show up
    await screen.findByLabelText(/loading/i)
    // wait for the loading spinner to go away
    await waitForLoadingToFinish()

    expect(notesTextarea).toHaveValue(newNotes)

    expect(await listItemsDB.read(listItem.id)).toMatchObject({
      notes: newNotes,
    })
  })
})
