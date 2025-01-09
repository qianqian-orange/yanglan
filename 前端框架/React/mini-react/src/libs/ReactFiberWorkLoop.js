import { createWorkInProgress } from './ReactFiber'
import { beginWork } from './ReactFiberBeginWork'
import {
  commitLayoutEffectOnFiber,
  commitMutationEffectsOnFiber,
  flushPassiveEffects,
} from './ReactFiberCommitWork'
import { completeWork } from './ReactFiberCompleteWork'
import { NoLanes } from './ReactFiberLane'
import { PassiveMask } from './ReactFiberFlags'

export const NoContext = 0
export const RenderContext = 2
export const CommitContext = 4

let executionContext = NoContext

let workInProgress = null
let renderLanes = NoLanes

export function getExecutionContext() {
  return executionContext
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
      break
    }
    // 递归父FiberNode节点
    unitOfWork = unitOfWork.return
    workInProgress = unitOfWork
  }
}

function performUnitOfWork(unitOfWork) {
  let nextFiber = beginWork(unitOfWork, renderLanes)
  // next为null，说明已经遍历到当前分支叶子FiberNode节点，则调用completeWork方法构建DOM树和收集子树FiberNode节点副作用
  if (nextFiber === null) {
    completeUnitOfWork(unitOfWork)
  } else {
    workInProgress = nextFiber
  }
}

// 1. 创建根FiberNode副本节点，赋值给workInProgress
// 2. 递归遍历wokrInProgress节点
/**
 * @param {*} root FiberRootNode对象
 */
function renderRootSync(root, lanes) {
  executionContext |= RenderContext
  renderLanes = lanes
  const current = root.current
  // 创建根FiberNode副本节点，赋值给workInProgress
  workInProgress = createWorkInProgress(current, current.pendingProps)
  // 递归遍历FiberNode节点，创建ReactElement对应的FiberNode节点，建立关联关系，构建FiberNode Tree
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
  executionContext = NoContext
}

/**
 * @param {*} root FiberRootNode
 */
function commitRoot(root) {
  executionContext = CommitContext
  const finishWork = root.current.alternate
  // 递归遍历FiberNode节点，执行对应副作用处理逻辑
  commitMutationEffectsOnFiber(finishWork)
  // 1. 调用useLayoutEffect create方法
  // 2. 将DOM节点赋值给ref.current属性
  commitLayoutEffectOnFiber(finishWork)
  // 将FiberRootNode对象current属性指向最新的FiiberNode Tree根节点
  root.current = finishWork
  if (finishWork.subtreeFlags & PassiveMask) {
    // 执行useEffect
    queueMicrotask(() => {
      flushPassiveEffects(root)
    })
  }
  executionContext = NoContext
}

/**
 * @param {*} root FiberRootNode对象
 */
function performWorkOnRoot(root, lanes) {
  // 构建FiberNode Tree和DOM树
  renderRootSync(root, lanes)
  // 更新DOM
  commitRoot(root)
}

export { performWorkOnRoot }
