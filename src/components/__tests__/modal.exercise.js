import React from 'react'
import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {Modal, ModalContents, ModalOpenButton} from '../modal'

test('can be opened and closed', async () => {
  const label = 'Modal Label'
  const title = 'Modal Title' // title is rendered in a h3 (role heading)
  const content = 'Modal content'

  render(
    <Modal>
      <ModalOpenButton>
        <button>Open</button>
      </ModalOpenButton>
      <ModalContents aria-label={label} title={title}>
        <div>{content}</div>
      </ModalContents>
    </Modal>,
  )
  // screen.debug()

  await userEvent.click(screen.getByRole('button', {name: /Open/i}))
  const modal = screen.getByRole('dialog') // added by reach modal
  expect(modal).toBeInTheDocument()
  expect(modal).toHaveAttribute('aria-label', label)
  // screen.debug() // prints out markup

  const inModal = within(modal) // to scope queries with in modal, same usage as screen
  expect(inModal.getByRole('heading', {name: title})).toBeInTheDocument()
  expect(inModal.getByText(content)).toBeInTheDocument()

  await userEvent.click(inModal.getByRole('button', {name: /Close/i}))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
