import React, {Fragment} from 'react'
import {createRoot} from 'react-dom/client'
import Dialog from '@reach/dialog'
import VisuallyHidden from '@reach/visually-hidden'
import '@reach/dialog/styles.css'

import {Logo} from './components/logo'
import {LoginForm} from 'components/LoginForm'

const Root = () => {
  const [dialogMode, setDialogMode] = React.useState(null)
  const open = mode => setDialogMode(mode)
  const close = () => setDialogMode(null)

  const handleSubmit = ({username, password}) => {
    if (dialogMode === 'LOGIN') {
      console.log('login', {username, password})
    } else {
      // dialogMode === 'REGISTER'
      console.log('register', {username, password})
    }
    close()
  }

  return (
    <Fragment>
      <div>
        <Logo width="80" height="80" />
        <h1>Bookshelf</h1>
        <div>
          <button onClick={open.bind(null, 'LOGIN')}>Login</button>
        </div>
        <div>
          <button onClick={open.bind(null, 'REGISTER')}>Register</button>
        </div>
      </div>
      <Dialog
        aria-label={dialogMode === 'LOGIN' ? 'Login form' : 'Register form'}
        isOpen={!!dialogMode}
        onDismiss={close}
      >
        <button className="close-button" onClick={close}>
          <VisuallyHidden>Close</VisuallyHidden>
          <span aria-hidden>x</span>
        </button>
        <h3>{dialogMode === 'LOGIN' ? 'Login' : 'Register'}</h3>
        <LoginForm
          buttonText={dialogMode === 'LOGIN' ? 'Login' : 'Register'}
          onSubmit={handleSubmit}
        />
      </Dialog>
    </Fragment>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<Root />)
