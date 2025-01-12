import { NoLanes } from '../ReactFiberLane'
import { HostRoot } from '../ReactWorkTags'

// 记录当前FiberNode节点
export let currentlyRenderingFiber = null
// 记录旧Hook对象
export let currentHook = null
// 记录新Hook对象
export let workInProgressHook = null
// 渲染优先级
export let renderLanes = NoLanes

/**
 * @param {*} workInProgress 新FiberNode节点
 * @param {*} Component 函数组件方法
 * @param {*} props 函数组件方法入参属性
 * @param {*} nextRenderLanes 渲染优先级
 */
export function renderWithHooks(
  workInProgress,
  Component,
  props,
  nextRenderLanes,
) {
  // 记录渲染优先级
  renderLanes = nextRenderLanes
  // 记录当前FiberNode节点
  currentlyRenderingFiber = workInProgress
  // 将FiberNode节点的updateQueue属性赋值为null，重新收集useEffect、useLayoutEffect、useInsertionEffect数据
  workInProgress.updateQueue = null
  // 调用组件方法获取child ReactElement
  const children = Component(props)
  currentlyRenderingFiber = null
  currentHook = null
  workInProgressHook = null
  return children
}

// 每次调用React Hook方法都会创建一个Hook对象，多个Hook对象之间通过next指针进行索引，构成单链表数据结构
function Hook() {
  // 记录Hook数据
  this.memoizedState = null
  // 记录下一个Hook对象
  this.next = null
  // 更新state方法
  this.reducer = null
  // 收集更新state方法
  this.queue = []
}

// 通过Object.is方法比对deps属性值是否变更
export function areHookInputsEqual(nextDeps, prevDeps) {
  for (let i = 0; i < nextDeps.length; i++) {
    if (!Object.is(nextDeps[i], prevDeps[i])) {
      return false
    }
  }
  return true
}

export function mountWorkInProgressHook() {
  // 创建Hook对象
  const hook = new Hook()
  // 构建Hook链表
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook
  } else {
    workInProgressHook = workInProgressHook.next = hook
  }
  return hook
}

export function updateWorkInProgressHook() {
  // 获取旧Hook对象
  if (currentHook === null) {
    currentHook = currentlyRenderingFiber.alternate.memoizedState
  } else {
    currentHook = currentHook.next
  }
  // 创建新Hook对象，复制旧Hook对象属性值
  const hook = new Hook()
  hook.memoizedState = currentHook.memoizedState
  hook.reducer = currentHook.reducer
  hook.queue = currentHook.queue
  // 构建Hook链表
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook
  } else {
    workInProgressHook = workInProgressHook.next = hook
  }
  return hook
}

// 获取FiberRootNode对象
export function getRootForUpdatedFiber(fiber) {
  while (fiber.tag !== HostRoot) {
    fiber = fiber.return
  }
  return fiber.stateNode
}
