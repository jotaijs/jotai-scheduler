import { useCallback } from 'react';
import type { ExtractAtomArgs, ExtractAtomResult, WritableAtom } from 'jotai';
import { useStore } from 'jotai';
import { Options, SetAtom } from './types';

export function useSetAtomWithSchedule<Value, Args extends unknown[], Result>(
  atom: WritableAtom<Value, Args, Result>,
  options?: Options,
): SetAtom<Args, Result>;

export function useSetAtomWithSchedule<
  AtomType extends WritableAtom<unknown, never[], unknown>,
>(
  atom: AtomType,
  options?: Options,
): SetAtom<ExtractAtomArgs<AtomType>, ExtractAtomResult<AtomType>>;

export function useSetAtomWithSchedule<Value, Args extends unknown[], Result>(
  atom: WritableAtom<Value, Args, Result>,
  options?: Options,
) {
  const store = useStore(options);
  const setAtom = useCallback(
    (...args: Args) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (import.meta.env?.MODE !== 'production' && !('write' in atom)) {
        // useAtom can pass non writable atom with wrong type assertion,
        // so we should check here.
        throw new Error('not writable atom');
      }
      return store.set(atom, ...args);
    },
    [store, atom],
  );
  return setAtom;
}
