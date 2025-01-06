import { performWorkOnRoot } from './ReactFiberReconciler'

// 是否添加一个更新渲染的微任务
let didScheduleMicrotask = false
// 记录FiberRootNode节点
let firstScheduledRoot = null

function processRootScheduleInMicrotask() {
  didScheduleMicrotask = false
  const root = firstScheduledRoot
  firstScheduledRoot = null
  performWorkOnRoot(root, root.pendingLanes)
}

export function ensureRootIsScheduled(root) {
  if (didScheduleMicrotask) return
  firstScheduledRoot = root
  didScheduleMicrotask = true
  queueMicrotask(processRootScheduleInMicrotask)
}
