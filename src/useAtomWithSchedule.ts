import type {
  Atom,
  ExtractAtomArgs,
  ExtractAtomResult,
  ExtractAtomValue,
  PrimitiveAtom,
  SetStateAction,
  WritableAtom,
} from 'jotai';
import { useAtomValueWithSchedule } from './useAtomValueWithSchedule';
import { useSetAtomWithSchedule } from './useSetAtomWithSchedule';

type SetAtom<Args extends unknown[], Result> = (...args: Args) => Result;

type Options = Parameters<typeof useAtomValueWithSchedule>[1];

export function useAtomWithSchedule<Value, Args extends unknown[], Result>(
  atom: WritableAtom<Value, Args, Result>,
  options?: Options,
): [Awaited<Value>, SetAtom<Args, Result>];

export function useAtomWithSchedule<Value>(
  atom: PrimitiveAtom<Value>,
  options?: Options,
): [Awaited<Value>, SetAtom<[SetStateAction<Value>], void>];

export function useAtomWithSchedule<Value>(
  atom: Atom<Value>,
  options?: Options,
): [Awaited<Value>, never];

export function useAtomWithSchedule<
  AtomType extends WritableAtom<unknown, never[], unknown>,
>(
  atom: AtomType,
  options?: Options,
): [
  Awaited<ExtractAtomValue<AtomType>>,
  SetAtom<ExtractAtomArgs<AtomType>, ExtractAtomResult<AtomType>>,
];

export function useAtomWithSchedule<AtomType extends Atom<unknown>>(
  atom: AtomType,
  options?: Options,
): [Awaited<ExtractAtomValue<AtomType>>, never];

export function useAtomWithSchedule<Value, Args extends unknown[], Result>(
  atom: Atom<Value> | WritableAtom<Value, Args, Result>,
  options?: Options,
) {
  return [
    useAtomValueWithSchedule(atom, options),
    // We do wrong type assertion here, which results in throwing an error.
    useSetAtomWithSchedule(atom as WritableAtom<Value, Args, Result>, options),
  ];
}
