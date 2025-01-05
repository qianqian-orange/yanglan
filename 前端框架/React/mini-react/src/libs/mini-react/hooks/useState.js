import { HostRoot, NoLanes, SyncLane } from '../FiberNode'
import { ensureRootIsScheduled } from '../ReactFiberRootScheduler'

// 记录当前FiberNode节点
let currentlyRenderingFiber = null
// 记录旧FiberNode节点的useState hook链表节点
let currentHook = null
// 记录新FiberNode节点useState hook链表节点
let workInProgressHook = null

// 组件方法调用装饰器，在调用组件方法前后做一些逻辑处理
/**
 * @param {*} current 旧FiberNode节点
 * @param {*} workInProgress 新FiberNode节点
 * @param {*} Component 函数组件方法
 * @param {*} props 函数组将方法入参属性
 */
export function renderWithHooks(current, workInProgress, Component, props) {
  // 记录当前FiberNode节点
  currentlyRenderingFiber = workInProgress
  if (current !== null) {
    // 记录旧FiberNode节点的useState hook链表
    currentHook = current.memoizedState
  }
  // 调用组件方法获取child ReactElement
  const children = Component(props)
  currentlyRenderingFiber = null
  currentHook = null
  workInProgressHook = null
  return children
}

// 每次调用useState方法都会创建一个Hook对象，通过next指针进行索引，构建单链表结构
function Hook() {
  this.memoizedState = null // 记录state值
  this.next = null // 记录下一个hook
  this.queue = [] // 收集更新state方法
}

// 获取FiberRootNode对象
function getRootForUpdatedFiber(fiber) {
  while (fiber.tag !== HostRoot) {
    fiber = fiber.return
  }
  return fiber.stateNode
}

function basicStateReducer(state, action) {
  return typeof action === 'function' ? action(state) : action
}

/**
 * @param {*} fiber FiberNode节点
 * @param {*} hook useState hook链表节点
 * @param {*} action 调用dispatch方法时传入的值
 */
function dispatchSetState(fiber, hook, action) {
  if (fiber.lanes === NoLanes) {
    // 获取旧state值
    const currentState = hook.memoizedState
    // 获取新state值
    const newState = basicStateReducer(currentState, action)
    // 如果state值相同则当前这次dispatch不需要触发更新
    if (Object.is(currentState, newState)) {
      return
    }
  }
  // 获取FiberRootNode对象
  const root = getRootForUpdatedFiber(fiber)
  // 收集更新state的方法，在创建新FiberNode节点时执行
  hook.queue.push((state) => basicStateReducer(state, action))
  root.pendingLanes = SyncLane
  fiber.lanes = SyncLane
  // 触发更新
  ensureRootIsScheduled(root)
}

// 首次调用组件方法useState处理逻辑
function mountState(initialState) {
  // 如果传入的初始值是functIon，则调用执行获取返回值作为初始state值
  if (typeof initialState === 'function') {
    initialState = initialState()
  }
  const hook = new Hook()
  hook.memoizedState = initialState
  // 构建hook链表
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook
  } else {
    workInProgressHook = workInProgressHook.next = hook
  }
  // 触发更新渲染方法
  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, hook)
  return [hook.memoizedState, dispatch]
}

// 触发更新再次调用函数组件处理逻辑
function updateReducer() {
  const hook = new Hook()
  // 执行更新state方法逻辑，获取新的state值
  hook.memoizedState = currentHook.queue.reduce(
    (state, action) => action(state),
    currentHook.memoizedState,
  )
  // 构建hook链表
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook
  } else {
    workInProgressHook = workInProgressHook.next = hook
  }
  currentHook = currentHook.next
  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, hook)
  // 返回新的state值和dispatch
  return [hook.memoizedState, dispatch]
}

function useState(initialState) {
  const current = currentlyRenderingFiber.alternate
  if (current === null) {
    return mountState(initialState)
  } else {
    return updateReducer()
  }
}

export { useState }
