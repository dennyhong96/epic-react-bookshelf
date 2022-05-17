/** @jsx jsx */
import {jsx} from '@emotion/core'
import VisuallyHidden from '@reach/visually-hidden'
import {
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react'
import {callAll} from 'utils/misc'

import {CircleButton, Dialog} from './lib'

const ModalContext = createContext()

export const Modal = ({children}) => {
  const [open, setOpen] = useState(false)

  const onOpen = useCallback(() => {
    setOpen(true)
  }, [setOpen])

  const onClose = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  return (
    <ModalContext.Provider value={{open, onOpen, onClose}}>
      {typeof children === 'function'
        ? children({open, onOpen, onClose})
        : children}
    </ModalContext.Provider>
  )
}

export const ModalOpenButton = ({children: child, ...restProps}) => {
  const {onOpen} = useContext(ModalContext)
  return cloneElement(child, {
    onClick: callAll(child.props.onClick, onOpen),
    ...restProps,
  })
}

export const ModalDismissButton = ({children: child, ...restProps}) => {
  const {onClose} = useContext(ModalContext)
  return cloneElement(child, {
    onClick: callAll(child.props.onClick, onClose),
    ...restProps,
  })
}

export const ModalContentsBase = ({children, ...restProps}) => {
  const {open, onClose} = useContext(ModalContext)
  return (
    <Dialog isOpen={open} onDismiss={onClose} {...restProps}>
      {children}
    </Dialog>
  )
}

const circleDismissButton = (
  <ModalDismissButton>
    <CircleButton>
      <VisuallyHidden>Close</VisuallyHidden>
      <span aria-hidden>{'x'}</span>
    </CircleButton>
  </ModalDismissButton>
)

export const ModalContents = ({children, title, ...restProps}) => {
  return (
    <ModalContentsBase {...restProps}>
      {circleDismissButton}
      <h3 css={{textAlign: 'center', fontSize: '2em'}}>{title}</h3>
      {children}
    </ModalContentsBase>
  )
}

/*
<Modal>
  <ModalOpenButton>
    <button>Open Modal</button>
  </ModalOpenButton>
  <ModalContents aria-label="Modal label (for screen readers)">
    <ModalDismissButton>
      <button>Close Modal</button>
    </ModalDismissButton>
    <h3>Modal title</h3>
    <div>Some great contents of the modal</div>
  </ModalContents>
</Modal>
*/
