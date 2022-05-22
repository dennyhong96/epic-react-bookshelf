import React from 'react'
import {render, screen} from '@testing-library/react'
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

  await userEvent.click(screen.getByRole('button', {name: /Open/i}))
  const modal = screen.getByRole('dialog') // added by reach modal
  expect(modal).toBeInTheDocument()
  expect(modal).toHaveAttribute('aria-label', label)
  expect(screen.getByRole('heading', {name: title})).toBeInTheDocument()
  expect(screen.getByText(content)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', {name: /Close/i}))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
