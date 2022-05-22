import {renderHook, act} from '@testing-library/react'

import {useAsync} from '../hooks'

/*
  helper to imperatively resolve or reject whenever you want.

  const {promise, resolve} = deferPromise()
  promise.then(() => console.log('resolved'))

  do stuff/make assertions you want to before calling resolve
  resolve()
  await promise
  do stuff/make assertions you want to after the promise has resolved
*/
function deferPromise() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return {promise, resolve, reject}
}

// Avoid hasty abstractions in test (AHA)
// Or just merge objects when calling `expect`
function asyncStateFactory(overwrites) {
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

// We use renderHook so we don't neet to create a dummy React component
// to test the hook
describe('useAsync hook', () => {
  beforeEach(() => {
    // spy on before each and clean up after each for test isolation
    jest.spyOn(console, 'error')
  })

  afterEach(() => {
    console.error.mockRestore() // stop spying on conosle.error
  })

  test('calling run with a promise which resolves', async () => {
    const {promise, resolve} = deferPromise()
    const {result} = renderHook(() => useAsync())
    expect(result.current).toEqual(asyncStateFactory())
    const mockResolvedValue = Symbol()
    let ranPromise
    act(() => {
      // `run` trigger state updates so it needs to be wrapped in an `act` callback
      // this is so we make sure to flush all side effect before continuing
      // with the rest of the tests
      ranPromise = result.current.run(promise)
    })
    expect(result.current).toEqual(
      asyncStateFactory({
        isIdle: false,
        isLoading: true,
        status: 'pending',
      }),
    )
    await act(async () => {
      // this updates state so it needs to be done in an `act` callback
      // async because we need to wait for the promise to be resolved
      resolve(mockResolvedValue)
      await ranPromise // wait for promise returned from `run` to resolve before continuing rest of the test
    })
    expect(result.current).toEqual(
      asyncStateFactory({
        isIdle: false,
        isSuccess: true,
        status: 'resolved',
        data: mockResolvedValue,
      }),
    )
    act(() => {
      result.current.reset()
    })
    expect(result.current).toEqual(asyncStateFactory())
  })

  test('calling run with a promise which rejects', async () => {
    const {promise, reject} = deferPromise()
    const {result} = renderHook(() => useAsync())
    expect(result.current).toEqual(asyncStateFactory())
    let useAsyncPromise
    act(() => {
      useAsyncPromise = result.current.run(promise)
    })
    const mockError = new Error()
    await act(async () => {
      reject(mockError) // rejects the promise
      try {
        await useAsyncPromise
      } catch (error) {
        expect(error).toBe(mockError)
        // catches the error thrown by rejected useAsyncPromise
        // avoid the promise to fail the test
      }
    })
    expect(result.current).toEqual(
      asyncStateFactory({
        isIdle: false,
        isError: true,
        error: mockError,
        status: 'rejected',
      }),
    )
  })

  test('can specify an initial state', async () => {
    const mockInitialState = {
      status: 'rejected',
      data: null,
      error: new Error('Test'),
    }
    const {result} = renderHook(() => useAsync(mockInitialState))
    expect(result.current).toEqual(
      asyncStateFactory({
        isIdle: false,
        isError: true,
        error: mockInitialState.error,
        status: mockInitialState.status,
        data: mockInitialState.data,
      }),
    )
  })

  test('can set the data', async () => {
    const {result} = renderHook(() => useAsync())
    expect(result.current).toEqual(asyncStateFactory())
    const customData = 'data'
    act(() => {
      result.current.setData(customData)
    })
    expect(result.current).toEqual(
      asyncStateFactory({
        isIdle: false,
        isSuccess: true,
        status: 'resolved',
        data: customData,
      }),
    )
  })

  test('can set the error', async () => {
    const {result} = renderHook(() => useAsync())
    expect(result.current).toEqual(asyncStateFactory())
    const error = new Error('test')
    act(() => {
      result.current.setError(error)
    })
    expect(result.current).toEqual(
      asyncStateFactory({
        isIdle: false,
        isError: true,
        error: error,
        status: 'rejected',
      }),
    )
  })

  test('No state updates happen if the component is unmounted while pending', async () => {
    const {promise, resolve} = deferPromise()
    const {result, unmount} = renderHook(() => useAsync())

    let asyncPromise
    act(() => {
      asyncPromise = result.current.run(promise)
    })
    unmount()
    await act(async () => {
      resolve()
      await asyncPromise
    })
    expect(console.error).not.toHaveBeenCalled() // React calls console.error if state updates happen when unmounted)
  })

  test('calling "run" without a promise results in an early error', () => {
    const {result} = renderHook(() => useAsync())
    // Early return will not update state, so no need to wrap in `act`
    // try {
    //   act(() => {
    //     result.current.run()
    //   })
    // } catch (error) {
    //   expect(error).toBeDefined()
    // }

    // When using `toThrow`, make sure fn is not invoked in the `expect` call
    // instead, pass `expect` an inline arrow fn
    expect(() => result.current.run()).toThrow()

    // Use snapshots for error messages to be more explicit
    expect(() => result.current.run()).toThrowErrorMatchingInlineSnapshot(
      `"The argument passed to useAsync().run must be a promise. Maybe a function that's passed isn't returning anything?"`,
    )
  })
})
