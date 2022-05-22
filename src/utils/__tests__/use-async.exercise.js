import {renderHook, act} from '@testing-library/react'

import {useAsync} from '../hooks'

// helper to imperatively resolve or reject whenever you want.
function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return {promise, resolve, reject}
}

// Use it like this:
// const {promise, resolve} = deferred()
// promise.then(() => console.log('resolved'))
// do stuff/make assertions you want to before calling resolve
// resolve()
// await promise
// do stuff/make assertions you want to after the promise has resolved

function getAsyncState(overwrites) {
  return {
    isIdle: true,
    isLoading: false,
    isError: false,
    isSuccess: false,
    data: null,
    status: 'idle',
    error: null,
    run: expect.any(Function),
    setData: expect.any(Function),
    setError: expect.any(Function),
    reset: expect.any(Function),
    ...overwrites,
  }
}

describe('useAsync hook', () => {
  test('calling run with a promise which resolves', async () => {
    const {promise, resolve} = deferred()
    const {result} = renderHook(() => useAsync())
    expect(result.current).toEqual(getAsyncState())
    act(() => {
      // this updates state so it needs to be done in an `act` callback
      result.current.run(promise)
    })
    expect(result.current).toEqual(
      getAsyncState({
        isIdle: false,
        isLoading: true,
        status: 'pending',
      }),
    )
    await act(async () => {
      // this updates state so it needs to be done in an `act` callback
      // async because we need to wait for the promise to be resolved
      await resolve()
    })
    expect(result.current).toEqual(
      getAsyncState({
        isIdle: false,
        isSuccess: true,
        status: 'resolved',
        data: undefined,
      }),
    )
    act(() => {
      result.current.reset()
    })
    expect(result.current).toEqual(getAsyncState())
  })

  test('calling run with a promise which rejects', async () => {
    const {promise, reject} = deferred()
    const {result} = renderHook(() => useAsync())
    expect(result.current).toEqual(getAsyncState())
    let useAsyncPromise
    act(() => {
      useAsyncPromise = result.current.run(promise)
    })
    await act(async () => {
      reject() // rejects the promise
      try {
        await useAsyncPromise
      } catch (error) {
        // catches the error thrown by rejected promise
        // avoid the promise actually failing your test
      }
    })
    expect(result.current).toEqual(
      getAsyncState({
        isIdle: false,
        isError: true,
        error: undefined,
        status: 'rejected',
      }),
    )
  })

  test('can specify an initial state', async () => {
    const initialState = {
      status: 'rejected',
      data: null,
      error: new Error('Test'),
    }
    const {result} = renderHook(() => useAsync(initialState))
    expect(result.current).toEqual(
      getAsyncState({
        isIdle: false,
        isError: true,
        error: initialState.error,
        status: initialState.status,
        data: initialState.data,
      }),
    )
  })

  test('can set the data', async () => {
    const {result} = renderHook(() => useAsync())
    expect(result.current).toEqual(getAsyncState())
    const customData = 'data'
    act(() => {
      result.current.setData(customData)
    })
    expect(result.current).toEqual(
      getAsyncState({
        isIdle: false,
        isSuccess: true,
        status: 'resolved',
        data: customData,
      }),
    )
  })

  test('can set the error', async () => {
    const {result} = renderHook(() => useAsync())
    expect(result.current).toEqual(getAsyncState())
    const error = new Error('test')
    act(() => {
      result.current.setError(error)
    })
    expect(result.current).toEqual(
      getAsyncState({
        isIdle: false,
        isError: true,
        error: error,
        status: 'rejected',
      }),
    )
  })

  test('No state updates happen if the component is unmounted while pending', () => {
    const {result, unmount} = renderHook(() => useAsync())
    const consoleErrorSpy = jest.spyOn(console, 'error')
    unmount()
    act(() => {
      result.current.setData('')
    })
    expect(consoleErrorSpy).toHaveBeenCalledTimes(0) // React calls console.error if state updates happen when unmounted)
  })

  test('calling "run" without a promise results in an early error', () => {
    const {result} = renderHook(() => useAsync())
    try {
      act(() => {
        result.current.run(undefined)
      })
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
