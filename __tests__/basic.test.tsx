import { atom } from 'jotai'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect, useRef } from 'react'

import { useAtomValueWithSchedule, useSetAtomWithSchedule } from '../src'

const useCommitCount = () => {
  const commitCountRef = useRef(1)
  useEffect(() => {
    commitCountRef.current += 1
  })
  return commitCountRef.current
}

describe('the same behavior as jotai if the `priority` field is not passed', () => {
  it('trigger state updates correctly', async () => {
    const anAtom = atom(0)
    function Control() {
      const dispatch = useSetAtomWithSchedule(anAtom)
      return (
        <>
          <button type="button" onClick={() => dispatch((num) => num + 1)}>
            button
          </button>
          <div>Control commits: {useCommitCount()}</div>
        </>
      )
    }
    function Display() {
      const num = useAtomValueWithSchedule(anAtom)
      return (
        <>
          <div>number: {num}</div>
          <div>Display commits: {useCommitCount()}</div>
        </>
      )
    }
    function App() {
      return (
        <>
          <Display />
          <Control />
        </>
      )
    }
    const { findByText, getByText } = render(<App />)
    await findByText('number: 0')
    await userEvent.click(getByText('button'))
    await waitFor(() => {
      findByText('number: 1')
      findByText('Display commits: 1')
      findByText('Control commits: 2')
    })
  })
})
