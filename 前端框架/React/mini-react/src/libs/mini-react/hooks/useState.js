import { HostRoot } from '../FiberNode'
import { performWorkOnRoot } from '../ReactFiberReconciler'

// 记录当前FiberNode节点
let currentlyRenderingFiber = null
// 记录旧state hook
let currentHook = null
// 记录新state hook
let workInProgressHook = null

// 组件方法调用装饰器，在调用组件方法前后做一些逻辑处理
export function renderWithHooks(current, workInProgress, Component, props) {
  currentlyRenderingFiber = workInProgress
  if (current !== null) {
    currentHook = current.memoizedState
  }
  workInProgressHook = null
  const children = Component(props)
  currentlyRenderingFiber = null
  currentHook = null
  workInProgress = null
  return children
}

// 获取FiberRootNode对象
function getRootForUpdatedFiber(fiber) {
  while (fiber.tag !== HostRoot) {
    fiber = fiber.return
  }
  return fiber.stateNode
}

// 触发更新方法
function dispatchSetState(fiber, hook, action) {
  // 获取FiberRootNode对象
  const root = getRootForUpdatedFiber(fiber)
  const executor = typeof action === 'function' ? action : () => action
  // 收集更新state的方法，在创建新FiberNode节点时执行，将新的state赋值给节点的memoizedState属性
  hook.queue.push((state) => executor(state))
  // 触发更新
  performWorkOnRoot(root, null)
}

// 创建state hook
function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null, // 记录更新state值
    queue: [], // 更新state方法队列
    next: null, // 记录下一个hook
  }
  return hook
}

// 首次调用组件方法处理逻辑
function mountState(initialState) {
  const hook = mountWorkInProgressHook()
  hook.memoizedState = initialState
  // 建立hook链表
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook
  } else {
    workInProgressHook.next = hook
    workInProgressHook = hook
  }
  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, hook)
  return [hook.memoizedState, dispatch]
}

// 触发更新再次调用函数组件处理逻辑
function updateState() {
  const hook = mountWorkInProgressHook()
  // 调用更新state方法获取新的state
  hook.memoizedState = currentHook.queue.reduce(
    (state, action) => action(state),
    currentHook.memoizedState,
  )
  // 建立hook链表
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook
  } else {
    workInProgressHook.next = hook
    workInProgressHook = hook
  }
  currentHook = currentHook.next
  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, hook)
  return [hook.memoizedState, dispatch]
}

function useState(initialState) {
  const current = currentlyRenderingFiber.alternate
  if (current === null) {
    return mountState(initialState)
  } else {
    return updateState()
  }
}

export { useState }
