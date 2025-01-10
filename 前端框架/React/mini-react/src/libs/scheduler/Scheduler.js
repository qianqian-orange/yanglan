import { peek, pop, push } from './SchedulerMinHeap'
import { ImmediatePriority, NormalPriority } from './SchedulerPriorities'

// 任务队列
const taskQueue = []
// 任务计数器
let taskIdCounter = 1

// 是否正在执行任务队列任务
let isMessageLoopRunning = false
// 任务开始执行时间
let startTime = -1

const normalPriorityTimeout = 5000 // 5s
const frameYieldMs = 5 // 5纳秒

// 如果时间间隔小于5纳秒，说明JS引擎处于空闲状态
export function shouldYieldToHost() {
  return performance.now() - startTime > frameYieldMs
}

function workLoop() {
  let currentTime = performance.now()
  startTime = currentTime
  // 获取任务
  let currentTask = peek(taskQueue)
  while (currentTask !== null) {
    // 如果已到任务过期时间则继续执行，如果没有到任务过期时间则判断JS引擎是否处于空闲状态
    if (
      currentTask.expirationTime > currentTime &&
      shouldYieldToHost(currentTime)
    ) {
      break
    }
    // 获取回调任务
    const callback = currentTask.callback
    if (typeof callback === 'function') {
      currentTask.callback = null
      const continuationCallback = callback(
        currentTask.expirationTime <= currentTime,
      )
      currentTime = performance.now()
      if (typeof continuationCallback === 'function') {
        currentTask.callback = continuationCallback
        return true
      }
      // 因为有可能中途插入更高优先级的任务，所以需要判断队列最高优先级的任务和当前执行任务是否是同一个，是才可以删除
      if (currentTask === peek(taskQueue)) pop(taskQueue)
    } else {
      pop(taskQueue)
    }
    currentTask = peek(taskQueue)
  }
  if (currentTask !== null) return true
  return false
}

function performWorkUntilDeadline() {
  if (isMessageLoopRunning) {
    let hasMoreWork = false
    try {
      hasMoreWork = workLoop()
    } finally {
      if (hasMoreWork) {
        channel.port2.postMessage(null)
      } else {
        isMessageLoopRunning = false
      }
    }
  }
}

const channel = new MessageChannel()
channel.port1.onmessage = performWorkUntilDeadline

/**
 * @param {*} priorityLevel 任务优先级
 * @param {*} callback 任务回调
 * @returns
 */
export function scheduleCallback(priorityLevel, callback) {
  // 获取当前时间戳
  const startTime = performance.now()
  // 根据任务优先级获取过期时间
  let timeout
  switch (priorityLevel) {
    // 高优先级任务
    case ImmediatePriority:
      timeout = -1
      break
    // 正常优先级任务
    case NormalPriority:
      timeout = normalPriorityTimeout
      break
  }
  // 获取过期时间
  const expirationTime = startTime + timeout
  // 创建任务
  const task = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime, // TODO: 是否可以移除
    expirationTime,
    sortIndex: expirationTime,
  }
  push(taskQueue, task)

  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true
    channel.port2.postMessage(null)
  }

  return task
}

export function cancelCallback(task) {
  task.callback = null
}
