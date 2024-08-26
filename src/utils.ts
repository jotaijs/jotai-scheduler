import ReactExports from 'react'
import { Listener } from './types'

export function isLastElement(set: Set<Listener>, element: Listener) {
  const iterator = set.values()
  let result = iterator.next()
  let last = result.value
  while (!result.done) {
    last = result.value
    result = iterator.next()
  }
  return last === element
}

export const isPromiseLike = (x: unknown): x is PromiseLike<unknown> =>
  typeof (x as any)?.then === 'function'

export const use =
  ReactExports.use ||
  (<T>(
    promise: PromiseLike<T> & {
      status?: 'pending' | 'fulfilled' | 'rejected'
      value?: T
      reason?: unknown
    },
  ): T => {
    if (promise.status === 'pending') {
      throw promise
    } else if (promise.status === 'fulfilled') {
      return promise.value as T
    } else if (promise.status === 'rejected') {
      throw promise.reason
    } else {
      promise.status = 'pending'
      promise.then(
        (v) => {
          promise.status = 'fulfilled'
          promise.value = v
        },
        (e) => {
          promise.status = 'rejected'
          promise.reason = e
        },
      )
      throw promise
    }
  })
