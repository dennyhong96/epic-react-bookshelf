import * as React from 'react'
import {screen} from '@testing-library/react'
import {buildBook} from 'test/generate'
import {App} from 'app'
import * as booksDB from 'test/data/books'
import userEvent from '@testing-library/user-event'
import {waitForLoadingToFinish, render} from 'test/app-test-utils'

describe('App', () => {
  test('renders all the book information', async () => {
    const book = await booksDB.create(buildBook())
    const route = `/book/${book.id}`
    await render(<App />, {route})
    screen.debug()
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
    const book = await booksDB.create(buildBook())
    const route = `/book/${book.id}`
    await render(<App />, {route})

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
})
