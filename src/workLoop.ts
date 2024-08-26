import {
  IMMEDIATE_PRIORITY,
  IMMEDIATE_PRIORITY_TIMEOUT,
  LOW_PRIORITY,
  LOW_PRIORITY_TIMEOUT,
  NORMAL_PRIORITY_TIMEOUT,
} from './constants'
import { Listener, PriorityLevel, Task } from './types'

let isMessageLoopRunning: boolean = false

const taskQueue: Array<Task> = []

function workLoop() {
  const currentTime: number = performance.now()
  const expiredTaskList = taskQueue.filter(
    (task) => task.expirationTime <= currentTime,
  )
  if (expiredTaskList.length > 0) {
    expiredTaskList.forEach((task) => {
      task.subscribe()
      taskQueue.splice(taskQueue.indexOf(task), 1)
    })
  } else {
    const highestPriority = Math.min(...taskQueue.map((task) => task.priority))
    const highestPriorityList = taskQueue.filter(
      (task) => task.priority === highestPriority,
    )
    highestPriorityList.forEach((task) => {
      task.subscribe()
      taskQueue.splice(taskQueue.indexOf(task), 1)
    })
  }

  if (taskQueue.length > 0) {
    return true
  }
  return false
}

function handleNextBatch() {
  const hasMoreWork = workLoop()
  if (hasMoreWork) {
    enqueueWorkExecution()
  } else {
    isMessageLoopRunning = false
  }
}

const channel = new MessageChannel()
const port = channel.port2
channel.port1.onmessage = handleNextBatch

export const enqueueWorkExecution = () => {
  port.postMessage(null)
}

export const initiateWorkLoop = () => {
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true
    enqueueWorkExecution()
  }
}

export const addTask = (priorityLevel: PriorityLevel, subscribe: Listener) => {
  const startTime = performance.now()

  let timeout: number
  switch (priorityLevel) {
    case IMMEDIATE_PRIORITY: {
      timeout = IMMEDIATE_PRIORITY_TIMEOUT
      break
    }
    case LOW_PRIORITY: {
      timeout = LOW_PRIORITY_TIMEOUT
      break
    }
    default: {
      timeout = NORMAL_PRIORITY_TIMEOUT
      break
    }
  }

  taskQueue.push({
    priority: priorityLevel,
    subscribe,
    expirationTime: startTime + timeout,
  })
}
