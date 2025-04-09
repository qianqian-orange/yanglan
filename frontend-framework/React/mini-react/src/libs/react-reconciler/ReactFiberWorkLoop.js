import { createWorkInProgress } from './ReactFiber'
import { beginWork } from './ReactFiberBeginWork'
import {
  commitBeforeMutationEffectsOnFiber,
  commitLayoutEffectOnFiber,
  commitMutationEffectsOnFiber,
  commitPassiveMountOnFiber,
  commitPassiveUnmountOnFiber,
} from './ReactFiberCommitWork'
import { completeWork } from './ReactFiberCompleteWork'
import {
  claimNextRetryLane,
  claimNextTransitionLane,
  getEntangledLanes,
  includesBlockingLane,
  includesExpiredLane,
  markRootFinished,
  markRootUpdated,
  NoLanes,
} from './ReactFiberLane'
import {
  // Incomplete,
  // NoFlags,
  PassiveMask,
  // ScheduleRetry,
} from './ReactFiberFlags'
import { ensureRootIsScheduled } from './ReactFiberRootScheduler'
import { shouldYieldToHost } from '../scheduler/Scheduler'
import { getSuspendedThenable, SuspenseException } from './ReactFiberThenable'
import { resetHooksAfterThrow } from './ReactFiberHooks'
import { unwindWork } from './ReactFiberUnwindWork'
import { throwException } from './ReactFiberThrow'
import { enqueueConcurrentRenderForLane } from './ReactFiberConcurrentUpdates'
// import { suspenseHandlerStackCursor } from './ReactFiberSuspenseContext'
// import { SuspenseComponent } from './ReactWorkTags'

export const NoContext = 0
export const RenderContext = 2
export const CommitContext = 4

// 当前渲染状态
const RootInProgress = 0
const RootSuspended = 3
const RootCompleted = 5

// 当前FiberNode中断渲染状态
const NotSuspended = 0
const SuspendedOnImmediate = 3

export let executionContext = NoContext
// 记录当前FiberNode
let workInProgress = null
// 记录当前FiberRootNode
export let workInProgressRoot = null
// 子树节点渲染优先级
export let entangledRenderLanes = NoLanes
// 当前任务渲染状态
let workInProgressRootExitStatus = RootInProgress
// FiberRootNode对象渲染优先级
export let workInProgressRootRenderLanes = NoLanes
// 延迟渲染优先级
let workInProgressDeferredLane = NoLanes
// 记录FiberNode中断渲染状态
let workInProgressSuspendedReason = NotSuspended
// 记录FiberNode终止渲染原因或promise实例
let workInProgressThrownValue = null

export function setEntangledRenderLanes(newEntangledRenderLanes) {
  entangledRenderLanes = newEntangledRenderLanes
}

export function scheduleUpdateOnFiber(root, lanes) {
  markRootUpdated(root, lanes)
  ensureRootIsScheduled(root)
}

export function renderDidSuspend() {
  if (workInProgressRootExitStatus === RootInProgress)
    workInProgressRootExitStatus = RootSuspended
}

export function requestDeferredLane() {
  if (workInProgressDeferredLane === NoLanes) {
    workInProgressDeferredLane = claimNextTransitionLane()
  }
  return workInProgressDeferredLane
}

export function resolveRetryWakeable(boundaryFiber, wakeable) {
  const retryCache = boundaryFiber.stateNode
  if (retryCache !== null) retryCache.delete(wakeable)
  const retryLane = claimNextRetryLane()
  const root = enqueueConcurrentRenderForLane(boundaryFiber, retryLane)
  // 触发更新渲染
  scheduleUpdateOnFiber(root, retryLane)
}

// 修改Suspense组件类型FiberNode子树状态并返回Suspense组件类型FiberNode
function unwindUnitOfWork(unitOfWork) {
  do {
    const current = unitOfWork.alternate
    const next = unwindWork(current, unitOfWork, entangledRenderLanes)
    if (next !== null) {
      workInProgress = next
      return
    }
    const returnFiber = unitOfWork.return
    if (returnFiber !== null) {
      // returnFiber.flags |= Incomplete
      // returnFiber.subtreeFlags = NoFlags
      // returnFiber.deletions = null
    }
    workInProgress = unitOfWork = returnFiber
  } while (unitOfWork !== null)
}

/**
 * @param {*} unitOfWork FiberNode节点
 */
function completeUnitOfWork(unitOfWork) {
  while (unitOfWork) {
    let nextFiber = unitOfWork
    // 构建FiberNode节点对应的DOM树和收集子树FiberNode节点副作用
    completeWork(nextFiber)
    // 获取兄弟节点
    nextFiber = nextFiber.sibling
    // 如果有兄弟节点，则调用performUnitOfWork方法继续构建FiberNode Tree
    if (nextFiber !== null) {
      workInProgress = nextFiber
      return
    }
    // 递归父FiberNode节点
    unitOfWork = unitOfWork.return
    workInProgress = unitOfWork
  }
  if (workInProgressRootExitStatus === RootInProgress)
    workInProgressRootExitStatus = RootCompleted
}

function performUnitOfWork(unitOfWork) {
  let nextFiber = beginWork(unitOfWork, entangledRenderLanes)
  // next为null，说明已经遍历到当前分支叶子FiberNode节点，则调用completeWork方法构建DOM树和收集子树FiberNode节点副作用
  if (nextFiber === null) {
    completeUnitOfWork(unitOfWork)
  } else {
    workInProgress = nextFiber
  }
}

function prepareFreshStack(root, lanes) {
  // 将FiberRootNode对象赋值给workInProgressRoot
  workInProgressRoot = root
  const current = root.current
  // 创建根FiberNode副本节点，赋值给workInProgress
  workInProgress = createWorkInProgress(current, current.pendingProps)
  workInProgressDeferredLane = NoLanes
  workInProgressRootExitStatus = RootInProgress
  workInProgressRootRenderLanes = lanes
  entangledRenderLanes = getEntangledLanes(root, lanes)
}

function throwAndUnwindWorkLoop(unitOfWork, thrownValue, suspendedReason) {
  // 将Suspense组件类型FiberNode的flags赋值为ShouldCapture且promise实例赋值给FiberNode的updateQueue属性
  throwException(unitOfWork, thrownValue)
  if (suspendedReason === SuspendedOnImmediate) {
    //   const boundary = suspenseHandlerStackCursor.current
    //   if (boundary !== null && boundary.tag === SuspenseComponent)
    //     boundary.flags |= ScheduleRetry
  }
  // 将Suspense组件类型FiberNode赋值给workInProgress且将flags赋值为DidCapture
  unwindUnitOfWork(unitOfWork)
}

function handleThrow(thrownValue) {
  resetHooksAfterThrow()
  if (thrownValue === SuspenseException) {
    // 获取promise实例
    thrownValue = getSuspendedThenable()
    // 记录FiberNode中断渲染状态
    workInProgressSuspendedReason = SuspendedOnImmediate
  }
  workInProgressThrownValue = thrownValue
}

function flushPassiveEffects(root) {
  // 调用useEffect destroy方法
  commitPassiveUnmountOnFiber(root.current)
  // 调用useEffect create方法
  commitPassiveMountOnFiber(root.current)
}

// 1. 创建根FiberNode副本节点，赋值给workInProgress
// 2. 递归遍历wokrInProgress节点
/**
 * @param {*} root FiberRootNode对象
 */
function renderRootSync(root, lanes) {
  executionContext |= RenderContext
  // 如果workInProgressRoot和workInProgressRootRenderLanes和本次渲染的root和lanes相同，说明是执行同一个任务
  if (root !== workInProgressRoot || lanes !== workInProgressRootRenderLanes)
    prepareFreshStack(root, lanes)
  do {
    try {
      if (
        workInProgressSuspendedReason !== NotSuspended &&
        workInProgress !== null
      ) {
        const unitOfWork = workInProgress
        const thrownValue = workInProgressThrownValue
        switch (workInProgressSuspendedReason) {
          case SuspendedOnImmediate: {
            const reason = workInProgressSuspendedReason
            workInProgressSuspendedReason = NotSuspended
            workInProgressThrownValue = null
            throwAndUnwindWorkLoop(unitOfWork, thrownValue, reason)
            break
          }
        }
      }
      // 递归遍历FiberNode节点，创建ReactElement对应的FiberNode节点，建立关联关系，构建FiberNode Tree
      while (workInProgress !== null) {
        performUnitOfWork(workInProgress)
      }
      break
    } catch (thrownValue) {
      handleThrow(thrownValue)
    }
  } while (true)
  executionContext = NoContext
  if (workInProgress === null) {
    workInProgressRoot = null
    workInProgressRootRenderLanes = NoLanes
  }
}

function renderRootConcurrent(root, lanes) {
  executionContext |= RenderContext
  // 如果workInProgressRoot和workInProgressRootRenderLanes和本次渲染的root和lanes相同，说明是执行同一个任务
  if (root !== workInProgressRoot || lanes !== workInProgressRootRenderLanes)
    prepareFreshStack(root, lanes)
  // 每执行一次performUnitOfWork方法后中断下一次执行，在下一个宏任务再继续执行
  while (workInProgress !== null && !shouldYieldToHost()) {
    performUnitOfWork(workInProgress)
  }
  executionContext = NoContext
  if (workInProgress === null) {
    workInProgressRoot = null
    workInProgressRootRenderLanes = NoLanes
  }
}

/**
 * @param {*} root FiberRootNode
 */
function commitRoot(root) {
  const finishedhWork = root.current.alternate
  root.callbackNode = null
  root.callbackPriority = NoLanes
  const remainingLanes = finishedhWork.lanes | finishedhWork.childLanes
  markRootFinished(root, remainingLanes, workInProgressDeferredLane)
  commitBeforeMutationEffectsOnFiber(finishedhWork)
  executionContext = CommitContext
  // 递归遍历FiberNode节点，执行对应副作用处理逻辑
  commitMutationEffectsOnFiber(finishedhWork)
  // 1. 调用useLayoutEffect create方法
  // 2. 将DOM节点赋值给ref.current属性
  commitLayoutEffectOnFiber(finishedhWork)
  // 将FiberRootNode对象current属性指向最新的FiiberNode Tree根节点
  root.current = finishedhWork
  executionContext = NoContext
  if (finishedhWork.subtreeFlags & PassiveMask) {
    // 执行useEffect
    queueMicrotask(() => {
      flushPassiveEffects(root)
    })
  }
}

/**
 * @param {*} root FiberRootNode对象
 * @param {*} lanes 优先级
 */
function performWorkOnRoot(root, lanes, forceSync) {
  // 时间片调度算法
  const shouldTimeSlice =
    !forceSync &&
    !includesBlockingLane(lanes) &&
    !includesExpiredLane(root, lanes)
  // 构建FiberNode Tree和DOM树
  if (shouldTimeSlice) renderRootConcurrent(root, lanes)
  else renderRootSync(root, lanes)
  if (workInProgressRootExitStatus !== RootInProgress) {
    // 更新DOM
    commitRoot(root)
  }
  ensureRootIsScheduled(root)
}

export { performWorkOnRoot }
