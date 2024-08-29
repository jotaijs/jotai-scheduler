import { addTask, initiateWorkLoop } from '../src/workLoop'
import { NORMAL_PRIORITY, IMMEDIATE_PRIORITY, LOW_PRIORITY } from '../src'

describe('Scheduler', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  it('executes normal priority tasks in the order they are scheduled', async () => {
    const log: string[] = []

    addTask(NORMAL_PRIORITY, () => {
      log.push('A')
    })
    addTask(NORMAL_PRIORITY, () => {
      log.push('B')
    })
    addTask(NORMAL_PRIORITY, () => {
      log.push('C')
    })

    expect(log).toEqual([])
    initiateWorkLoop()
    jest.runAllTimers()
    expect(log).toEqual(['A', 'B', 'C'])
  })

  it('executes low priority tasks in the order they are scheduled', async () => {
    const log: string[] = []

    addTask(LOW_PRIORITY, () => {
      log.push('A')
    })
    addTask(LOW_PRIORITY, () => {
      log.push('B')
    })
    addTask(LOW_PRIORITY, () => {
      log.push('C')
    })

    expect(log).toEqual([])
    initiateWorkLoop()
    jest.runAllTimers()
    expect(log).toEqual(['A', 'B', 'C'])
  })

  it('executes callbacks in order of priority', async () => {
    const log: string[] = []

    addTask(NORMAL_PRIORITY, () => {
      log.push('A')
    })
    addTask(NORMAL_PRIORITY, () => {
      log.push('B')
    })
    addTask(IMMEDIATE_PRIORITY, () => {
      log.push('C')
    })
    addTask(IMMEDIATE_PRIORITY, () => {
      log.push('D')
    })

    expect(log).toEqual([])
    initiateWorkLoop()
    jest.runAllTimers()
    expect(log).toEqual(['C', 'D', 'A', 'B'])
  })
})
