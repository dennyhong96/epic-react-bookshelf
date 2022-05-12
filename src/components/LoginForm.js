import React, {useRef} from 'react'

const LoginForm = ({buttonText = 'Login', onSubmit}) => {
  const usernameRef = useRef('')
  const passwordRef = useRef('')

  const handleSubmit = evt => {
    evt.preventDefault()
    onSubmit({
      username: usernameRef.current.value,
      password: passwordRef.current.value,
    })
    usernameRef.current.value = ''
    passwordRef.current.value = ''
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          <span>Username</span>
          <input ref={usernameRef} type="text" />
        </label>
      </div>
      <div>
        <label>
          <span>Password</span>
          <input ref={passwordRef} type="password" />
        </label>
      </div>
      <button type="submit">{buttonText}</button>
    </form>
  )
}

export {LoginForm}
