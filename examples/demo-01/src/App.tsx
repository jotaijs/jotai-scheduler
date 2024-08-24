import { atom, useAtom, useAtomValue } from 'jotai'
import {
  useAtomValueWithSchedule,
  useAtomWithSchedule,
  ImmediatePriority,
  LowPriority,
} from 'jotai-scheduler'

import './App.css'

const anAtom = atom(0)

const simulateHeavyRender = () => {
  const start = performance.now()
  while (performance.now() - start < 500) {}
}

function Header() {
  simulateHeavyRender()
  // const num = useAtomValue(anAtom);
  console.log('Header Component Render')
  const num = useAtomValueWithSchedule(anAtom, {
    priority: LowPriority,
  })
  return <div className="header">Header-{num}</div>
}

function Footer() {
  simulateHeavyRender()
  // const num = useAtomValue(anAtom);
  console.log('Footer Component Render')
  const num = useAtomValueWithSchedule(anAtom, {
    priority: LowPriority,
  })
  return <div className="footer">Footer-{num}</div>
}

function Sidebar() {
  simulateHeavyRender()
  // const num = useAtomValue(anAtom);
  console.log('Sidebar Component Render')
  const num = useAtomValueWithSchedule(anAtom)
  return <div className="sidebar">Sidebar-{num}</div>
}

function Content() {
  simulateHeavyRender()
  // const [num, setNum] = useAtom(anAtom);
  console.log('Content Component Render')
  const [num, setNum] = useAtomWithSchedule(anAtom, {
    priority: ImmediatePriority,
  })
  return (
    <div className="content">
      <div>Content-{num}</div>
      <button
        onClick={() => {
          setNum((num) => ++num)
          console.log('trigger')
        }}
      >
        +1
      </button>
    </div>
  )
}

export function App() {
  return (
    <div className="app">
      <Header />
      <div className="body">
        <Sidebar />
        <Content />
      </div>
      <Footer />
    </div>
  )
}
