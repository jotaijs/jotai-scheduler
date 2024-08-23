import { Atom, useStore } from 'jotai';
import { ImmediatePriority, LowPriority, NormalPriority } from './constants';

export type SetAtom<Args extends unknown[], Result> = (...args: Args) => Result;

export type AnyAtom = Atom<unknown>;

export type Store = ReturnType<typeof useStore>;

export type Listener = () => void;

export type PriorityLevel =
  | typeof ImmediatePriority
  | typeof NormalPriority
  | typeof LowPriority;

export type Options = Parameters<typeof useStore>[0] & {
  delay?: number;
  priority?: PriorityLevel;
};

export type Task = {
  priority: PriorityLevel;
  subscribe: Listener;
};
