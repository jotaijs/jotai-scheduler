import { Atom, useStore } from 'jotai'
import { IMMEDIATE_PRIORITY, NORMAL_PRIORITY, LOW_PRIORITY } from './constants'

export type SetAtom<Args extends unknown[], Result> = (...args: Args) => Result

export type AnyAtom = Atom<unknown>

export type Store = ReturnType<typeof useStore>

export type Listener = () => void

export type PriorityLevel =
  | typeof IMMEDIATE_PRIORITY
  | typeof LOW_PRIORITY
  | typeof NORMAL_PRIORITY

export type Options = Parameters<typeof useStore>[0] & {
  delay?: number
  priority?: PriorityLevel
}

export type Task = {
  priority: PriorityLevel
  subscribe: Listener
  expirationTime: number
}
