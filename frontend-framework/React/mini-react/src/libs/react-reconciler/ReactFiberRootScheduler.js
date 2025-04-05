import {
  getNextLanes,
  markStarvedLanesAsExpired,
  NoLanes,
  SyncLane,
} from './ReactFiberLane'
import {
  CommitContext,
  executionContext,
  NoContext,
  performWorkOnRoot,
  RenderContext,
  workInProgressRoot,
  workInProgressRootRenderLanes,
} from './ReactFiberWorkLoop'
import { cancelCallback, scheduleCallback } from '../scheduler/Scheduler'
import {
  ImmediatePriority,
  NormalPriority,
} from '../scheduler/SchedulerPriorities'

// 同步更新渲染是否完成
let isFlushingWork = false
// 是否触发同步渲染
let mightHavePendingSyncWork = false
// 是否添加一个更新渲染的微任务
let didScheduleMicrotask = false
// 记录FiberRootNode节点
let firstScheduledRoot = null

// 同步更新渲染
export function flushSyncWorkAcrossRoots_impl() {
  if (isFlushingWork || !mightHavePendingSyncWork) return
  isFlushingWork = true
  let didPerformSomeWork
  do {
    didPerformSomeWork = false
    let root = firstScheduledRoot
    if (root !== null) {
      const nextLanes = getNextLanes(
        root,
        root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes,
      )
      if ((nextLanes & SyncLane) !== NoLanes) {
        didPerformSomeWork = true
        performWorkOnRoot(root, nextLanes, true)
      }
    }
  } while (didPerformSomeWork)
  isFlushingWork = false
}

// 异步更新渲染
function performWorkOnRootViaSchedulerTask(root, didTimeout) {
  const originalCallbackNode = root.callbackNode
  const lanes = getNextLanes(
    root,
    root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes,
  )
  if (lanes === NoLanes) return null
  performWorkOnRoot(root, lanes, didTimeout)
  // 当还没有到任务过期时间但JS引擎不处于空闲状态会暂停执行该任务，即暂停重新渲染，作为下一次宏任务执行
  if (
    root.callbackNode !== null &&
    root.callbackNode === originalCallbackNode
  ) {
    return performWorkOnRootViaSchedulerTask.bind(null, root)
  }
  return null
}

// 获取任务优先级，创建任务
function scheduleTaskForRootDuringMicrotask(root) {
  markStarvedLanesAsExpired(root, performance.now())
  const nextLanes = getNextLanes(
    root,
    root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes,
  )
  const existingCallbackNode = root.callbackNode
  if (nextLanes === NoLanes) {
    if (existingCallbackNode !== null) {
      cancelCallback(existingCallbackNode)
    }
    root.callbackNode = null
    root.callbackPriority = NoLanes
    return NoLanes
  }
  // 优先执行同步任务，中断旧任务
  if ((nextLanes & SyncLane) !== NoLanes) {
    if (existingCallbackNode !== null) {
      cancelCallback(existingCallbackNode)
    }
    root.callbackNode = null
    root.callbackPriority = SyncLane
    return SyncLane
  }
  // 如果新旧任务优先级相同则继续执行旧任务
  if (root.callbackPriority === nextLanes) return nextLanes
  // 中断旧任务，执行新任务
  else if (existingCallbackNode !== null) cancelCallback(existingCallbackNode)
  const callbackNode = scheduleCallback(
    NormalPriority,
    performWorkOnRootViaSchedulerTask.bind(null, root),
  )
  root.callbackNode = callbackNode
  root.callbackPriority = nextLanes
  return nextLanes
}

// 添加React同步/异步渲染任务
function processRootScheduleInMicrotask() {
  mightHavePendingSyncWork = false
  didScheduleMicrotask = false
  const root = firstScheduledRoot
  const nextLanes = scheduleTaskForRootDuringMicrotask(root)
  if (nextLanes === NoLanes) {
    firstScheduledRoot = null
  } else if ((nextLanes & SyncLane) !== NoLanes) {
    mightHavePendingSyncWork = true
  }
  flushSyncWorkAcrossRoots_impl()
}

// 确保完成React更新渲染
export function ensureRootIsScheduled(root) {
  mightHavePendingSyncWork = true
  if (didScheduleMicrotask) return
  firstScheduledRoot = root
  didScheduleMicrotask = true
  queueMicrotask(() => {
    if ((executionContext & (RenderContext | CommitContext)) === NoContext)
      processRootScheduleInMicrotask()
    else scheduleCallback(ImmediatePriority, processRootScheduleInMicrotask)
  })
}
