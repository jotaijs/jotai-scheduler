import { useEffect, useState, useRef } from 'react'
import { atom, useAtom } from 'jotai'
import {
  useAtomWithSchedule,
  NORMAL_PRIORITY,
  IMMEDIATE_PRIORITY,
} from 'jotai-scheduler'

const anAtom = atom(0)

const simulateHeavyRender = () => {
  const start = performance.now()
  while (performance.now() - start < 10) {}
}

function useIsVisible() {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting)
    })

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [ref])

  return [ref, isVisible] as const
}

const Item = () => {
  simulateHeavyRender()
  const [ref, isVisible] = useIsVisible()
  // const [num, setNum] = useAtom(anAtom);
  const [num, setNum] = useAtomWithSchedule(anAtom, {
    priority: isVisible ? IMMEDIATE_PRIORITY : NORMAL_PRIORITY,
  })
  return (
    <div
      ref={ref}
      style={{
        height: '50px',
        width: '50%',
        margin: '10px',
        textAlign: 'center',
        border: '2px solid black',
      }}
    >
      <div>
        {num} {isVisible ? 'visible' : 'not visible'}
      </div>
      <button
        onClick={() => {
          setNum(num + 1)
        }}
      >
        +1
      </button>
    </div>
  )
}

export const App = () => {
  const items = new Array(100).fill(0)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {items.map(() => (
        <Item />
      ))}
    </div>
  )
}
