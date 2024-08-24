import { Task } from './types'

let isMessageLoopRunning: boolean = false

const taskQueue: Array<Task> = []

function workLoop(): boolean {
  const highestPriority = Math.min(...taskQueue.map((task) => task.priority))
  const highestPriorityList = taskQueue.filter(
    (task) => task.priority === highestPriority,
  )
  highestPriorityList.forEach((task) => {
    task.subscribe()
    taskQueue.splice(taskQueue.indexOf(task), 1)
  })
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

export const addTask = (newTask: Task) => {
  taskQueue.push(newTask)
}
