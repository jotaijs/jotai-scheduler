/// <reference types="react/experimental" />

import { useDebugValue, useEffect, useReducer } from 'react'
import type { ReducerWithoutAction } from 'react'
import type { Atom, ExtractAtomValue } from 'jotai'
import { useStore } from 'jotai'

import { NORMAL_PRIORITY } from './constants'
import { isPromiseLike, use } from './utils'
import { addTask, initiateWorkLoop } from './workLoop'
import { AnyAtom, Options, Store, PriorityLevel, Listener } from './types'

const prioritySubscriptionsMap = new Map<Listener, PriorityLevel>()

export function useAtomValueWithSchedule<Value>(
  atom: Atom<Value>,
  options?: Options,
): Awaited<Value>

export function useAtomValueWithSchedule<AtomType extends AnyAtom>(
  atom: AtomType,
  options?: Options,
): Awaited<ExtractAtomValue<AtomType>>

export function useAtomValueWithSchedule<Value>(
  atom: Atom<Value>,
  options?: Options,
) {
  const store = useStore(options)

  const [[valueFromReducer, storeFromReducer, atomFromReducer], rerender] =
    useReducer<
      ReducerWithoutAction<readonly [Value, Store, typeof atom]>,
      undefined
    >(
      (prev) => {
        const nextValue = store.get(atom)
        if (
          Object.is(prev[0], nextValue) &&
          prev[1] === store &&
          prev[2] === atom
        ) {
          return prev
        }
        return [nextValue, store, atom]
      },
      undefined,
      () => [store.get(atom), store, atom],
    )

  let value = valueFromReducer
  if (storeFromReducer !== store || atomFromReducer !== atom) {
    rerender()
    value = store.get(atom)
  }

  const delay = options?.delay
  const priority = options?.priority ?? NORMAL_PRIORITY

  useEffect(() => {
    const subscribe = () => {
      if (typeof delay === 'number') {
        // delay rerendering to wait a promise possibly to resolve
        setTimeout(rerender, delay)
        return
      }
      rerender()
    }

    prioritySubscriptionsMap.set(subscribe, priority)

    const unsub = store.sub(atom, () => {
      addTask(prioritySubscriptionsMap.get(subscribe)!, subscribe)
      initiateWorkLoop()
    })

    return () => {
      unsub()
      prioritySubscriptionsMap.delete(subscribe)
    }
  }, [atom, delay, priority, store])

  useDebugValue(value)
  // TS doesn't allow using `use` always.
  // The use of isPromiseLike is to be consistent with `use` type.
  // `instanceof Promise` actually works fine in this case.
  return isPromiseLike(value) ? use(value) : (value as Awaited<Value>)
}
