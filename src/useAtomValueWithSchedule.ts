/// <reference types="react/experimental" />

import { useDebugValue, useEffect, useReducer } from 'react';
import type { ReducerWithoutAction } from 'react';
import type { Atom, ExtractAtomValue } from 'jotai';
import { useStore } from 'jotai';
import {
  ImmediatePriority,
  LowPriority,
  NormalPriority,
  PriorityLevel,
} from './constants';
import { isLastElement, isPromiseLike, use } from './utils';

type Store = ReturnType<typeof useStore>;

type AnyAtom = Atom<unknown>;

type Options = Parameters<typeof useStore>[0] & {
  delay?: number;
  priority?: PriorityLevel;
};

const ImmediatePriorityReRenderMap = new Map<AnyAtom, Set<() => void>>();
const NormalPriorityPriorityReRenderMap = new Map<AnyAtom, Set<() => void>>();
const LowPriorityReRenderMap = new Map<AnyAtom, Set<() => void>>();
const allReRenderMap = new Set<() => void>();

const priorityMap = new Map<
  PriorityLevel,
  | typeof ImmediatePriorityReRenderMap
  | typeof NormalPriorityPriorityReRenderMap
  | typeof LowPriorityReRenderMap
>([
  [ImmediatePriority, ImmediatePriorityReRenderMap],
  [NormalPriority, NormalPriorityPriorityReRenderMap],
  [LowPriority, LowPriorityReRenderMap],
]);

export function useAtomValueWithSchedule<Value>(
  atom: Atom<Value>,
  options?: Options,
): Awaited<Value>;

export function useAtomValueWithSchedule<AtomType extends Atom<unknown>>(
  atom: AtomType,
  options?: Options,
): Awaited<ExtractAtomValue<AtomType>>;

export function useAtomValueWithSchedule<Value>(
  atom: Atom<Value>,
  options?: Options,
) {
  const store = useStore(options);

  const [[valueFromReducer, storeFromReducer, atomFromReducer], rerender] =
    useReducer<
      ReducerWithoutAction<readonly [Value, Store, typeof atom]>,
      undefined
    >(
      (prev) => {
        const nextValue = store.get(atom);
        if (
          Object.is(prev[0], nextValue) &&
          prev[1] === store &&
          prev[2] === atom
        ) {
          return prev;
        }
        return [nextValue, store, atom];
      },
      undefined,
      () => [store.get(atom), store, atom],
    );

  let value = valueFromReducer;
  if (storeFromReducer !== store || atomFromReducer !== atom) {
    rerender();
    value = store.get(atom);
  }

  const delay = options?.delay;
  const priority = options?.priority ?? NormalPriority;
  useEffect(() => {
    const subscribe = () => {
      if (typeof delay === 'number') {
        // delay rerendering to wait a promise possibly to resolve
        setTimeout(rerender, delay);
        return;
      }
      rerender();
    };

    const listener = priorityMap.get(priority)!.get(atom) ?? new Set();
    allReRenderMap.add(subscribe);
    listener.add(subscribe);
    priorityMap.get(priority)!.set(atom, listener);

    const unsub = store.sub(atom, () => {
      if (isLastElement(allReRenderMap, subscribe)) {
        requestAnimationFrame(() => {
          ImmediatePriorityReRenderMap.get(atom)?.forEach((l) => l());
          requestAnimationFrame(() => {
            NormalPriorityPriorityReRenderMap.get(atom)?.forEach((l) => l());
            requestAnimationFrame(() => {
              LowPriorityReRenderMap.get(atom)?.forEach((l) => l());
            });
          });
        });
      }
    });
    rerender();
    return () => {
      unsub();
      listener.delete(rerender);
      allReRenderMap.delete(rerender);
    };
  }, [store, atom, delay, priority]);

  useDebugValue(value);
  // TS doesn't allow using `use` always.
  // The use of isPromiseLike is to be consistent with `use` type.
  // `instanceof Promise` actually works fine in this case.
  return isPromiseLike(value) ? use(value) : (value as Awaited<Value>);
}
