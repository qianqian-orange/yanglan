import { createWorkInProgress } from './ReactFiber'
import { beginWork } from './ReactFiberBeginWork'
import {
  commitBeforeMutationEffectsOnFiber,
  commitLayoutEffectOnFiber,
  commitMutationEffectsOnFiber,
  flushPassiveEffects,
} from './ReactFiberCommitWork'
import { completeWork } from './ReactFiberCompleteWork'
import {
  claimNextTransitionLane,
  getEntangledLanes,
  includesBlockingLane,
  includesExpiredLane,
  markRootFinished,
  markRootUpdated,
  NoLanes,
} from './ReactFiberLane'
import { PassiveMask } from './ReactFiberFlags'
import {
  ensureRootIsScheduled,
  flushSyncWorkAcrossRoots_impl,
} from './ReactFiberRootScheduler'
import { shouldYieldToHost } from '../scheduler/Scheduler'

export const NoContext = 0
export const RenderContext = 2
export const CommitContext = 4

const RootInProgress = 0
const RootCompleted = 5

let executionContext = NoContext
let workInProgress = null
let workInProgressRoot = null
// 子树节点渲染优先级
let entangledRenderLanes = NoLanes
// 当前任务渲染状态
let workInProgressRootExitStatus = RootInProgress
// FiberRootNode对象渲染优先级
let workInProgressRootRenderLanes = NoLanes
// 延迟渲染优先级
let workInProgressDeferredLane = NoLanes

export function getExecutionContext() {
  return executionContext
}

export function flushSyncWork() {
  if ((executionContext & (RenderContext | CommitContext)) === NoContext)
    flushSyncWorkAcrossRoots_impl()
}

export function scheduleUpdateOnFiber(root, lanes) {
  markRootUpdated(root, lanes)
  ensureRootIsScheduled(root)
}

export function requestDeferredLane() {
  if (workInProgressDeferredLane === NoLanes) {
    workInProgressDeferredLane = claimNextTransitionLane()
  }
  return workInProgressDeferredLane
}

export function getWorkInProgressRoot() {
  return workInProgressRoot
}

export function getWorkInProgressRootRenderLanes() {
  return workInProgressRootRenderLanes
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
  // 递归遍历FiberNode节点，创建ReactElement对应的FiberNode节点，建立关联关系，构建FiberNode Tree
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
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
  const finishWork = root.current.alternate
  root.callbackNode = null
  root.callbackPriority = NoLanes
  const remainingLanes = finishWork.lanes | finishWork.childLanes
  markRootFinished(root, remainingLanes, workInProgressDeferredLane)
  executionContext = CommitContext
  commitBeforeMutationEffectsOnFiber(finishWork)
  // 递归遍历FiberNode节点，执行对应副作用处理逻辑
  commitMutationEffectsOnFiber(finishWork)
  // 1. 调用useLayoutEffect create方法
  // 2. 将DOM节点赋值给ref.current属性
  commitLayoutEffectOnFiber(finishWork)
  // 将FiberRootNode对象current属性指向最新的FiiberNode Tree根节点
  root.current = finishWork
  executionContext = NoContext
  if (finishWork.subtreeFlags & PassiveMask) {
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
  if (workInProgressRootExitStatus === RootCompleted) {
    // 更新DOM
    commitRoot(root)
  }
  ensureRootIsScheduled(root)
}

export { performWorkOnRoot }
