import { atom } from 'jotai'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  IMMEDIATE_PRIORITY,
  LOW_PRIORITY,
  NORMAL_PRIORITY,
  useAtomValueWithSchedule,
  useSetAtomWithSchedule,
} from '../src'

it('batching rendering if we pass different `priority`', async () => {
  const anAtom = atom(0)
  function ImmediatePriorityCpn() {
    const num = useAtomValueWithSchedule(anAtom, {
      priority: IMMEDIATE_PRIORITY,
    })
    return <div>number of ImmediatePriorityCpn: {num}</div>
  }
  function NormalPriorityCpn() {
    const num = useAtomValueWithSchedule(anAtom, {
      priority: NORMAL_PRIORITY,
    })
    return <div>number of NormalPriorityCpn: {num}</div>
  }
  function LowPriorityCpn() {
    const num = useAtomValueWithSchedule(anAtom, {
      priority: LOW_PRIORITY,
    })
    return <div>number of LowPriorityCpn: {num}</div>
  }
  function App() {
    const dispatch = useSetAtomWithSchedule(anAtom)
    return (
      <>
        <ImmediatePriorityCpn />
        <NormalPriorityCpn />
        <LowPriorityCpn />
        <button type="button" onClick={() => dispatch((num) => num + 1)}>
          button
        </button>
      </>
    )
  }
  const { findByText, getByText } = render(<App />)

  await userEvent.click(getByText('button'))

  await waitFor(() => {
    findByText('number of ImmediatePriorityCpn: 1')
    findByText('number of NormalPriorityCpn: 0')
    findByText('number of LowPriorityCpn: 0')
  })

  await waitFor(() => {
    findByText('number of ImmediatePriorityCpn: 1')
    findByText('number of NormalPriorityCpn: 1')
    findByText('number of LowPriorityCpn: 0')
  })

  await waitFor(() => {
    findByText('number of ImmediatePriorityCpn: 1')
    findByText('number of NormalPriorityCpn: 1')
    findByText('number of LowPriorityCpn: 1')
  })
})
