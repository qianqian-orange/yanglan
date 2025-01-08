import { HostRoot, NoLanes, SyncLane } from './FiberNode'
import {
  Passive as PassiveEffect,
  Update as UpdateEffect,
} from './ReactFiberFlags'
import { ensureRootIsScheduled } from './ReactFiberRootScheduler'
import { HookHasEffect, HookLayout, HookPassive } from './ReactHookEffectFlags'

// 记录当前FiberNode节点
export let currentlyRenderingFiber = null
// 记录旧FiberNode节点的useState hook链表节点
export let currentHook = null
// 记录新FiberNode节点useState hook链表节点
export let workInProgressHook = null

// 组件方法调用装饰器，在调用组件方法前后做一些逻辑处理
/**
 * @param {*} current 旧FiberNode节点
 * @param {*} workInProgress 新FiberNode节点
 * @param {*} Component 函数组件方法
 * @param {*} props 函数组件方法入参属性
 */
export function renderWithHooks(workInProgress, Component, props) {
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
  this.memoizedState = null // 记录Hook数据
  this.next = null // 记录下一个Hook对象
  this.reducer = null // 更新state方法
  this.queue = [] // 收集更新state方法
}

function Ref(initialValue) {
  this.current = initialValue
}

function Effect(tag, create, deps, destroy) {
  this.tag = tag
  this.create = create
  this.deps = deps
  this.destroy = destroy
}

function mountWorkInProgressHook() {
  const hook = new Hook()
  // 构建Hook链表
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook
  } else {
    workInProgressHook = workInProgressHook.next = hook
  }
  return hook
}

function updateWorkInProgressHook() {
  if (currentHook === null) {
    currentHook = currentlyRenderingFiber.alternate.memoizedState
  } else {
    currentHook = currentHook.next
  }
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
function getRootForUpdatedFiber(fiber) {
  while (fiber.tag !== HostRoot) {
    fiber = fiber.return
  }
  return fiber.stateNode
}

function basicStateReducer(state, action) {
  return typeof action === 'function' ? action(state) : action
}

/*****************************  useState start  *****************************/
/**
 * @param {*} fiber FiberNode节点
 * @param {*} hook hook链表节点
 * @param {*} action 调用dispatch方法时传入的值
 */
function dispatchSetState(fiber, hook, action) {
  // 获取更新state方法
  const reducer = hook.reducer
  if (fiber.lanes === NoLanes) {
    // 获取旧state值
    const currentState = hook.memoizedState
    // 获取新state值
    const newState = reducer(currentState, action)
    // 如果state值相同则当前这次dispatch不需要触发更新
    if (Object.is(currentState, newState)) return
  }
  // 获取FiberRootNode对象
  const root = getRootForUpdatedFiber(fiber)
  // 收集更新state的方法，在创建新FiberNode节点时执行
  hook.queue.push((state) => reducer(state, action))
  root.pendingLanes = SyncLane
  fiber.lanes = SyncLane
  if (fiber.alternate !== null) fiber.alternate.lanes = SyncLane
  // 触发更新
  ensureRootIsScheduled(root)
}

function mountReducer(reducer, initialState) {
  // 如果传入的初始值是functIon，则调用执行获取返回值作为初始state值
  if (typeof initialState === 'function') initialState = initialState()
  // 创建Hook对象，构建Hook链表
  const hook = mountWorkInProgressHook()
  // 记录state初始值
  hook.memoizedState = initialState
  // 记录更新state方法
  hook.reducer = reducer
  // 获取触发更新渲染方法
  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, hook)
  return [hook.memoizedState, dispatch]
}

function updateReducer() {
  // 创建Hook对象，复制旧Hook对象属性值，构建Hook链表
  const hook = updateWorkInProgressHook()
  // 执行更新state方法逻辑，获取新的state值
  hook.memoizedState = hook.queue.reduce(
    (state, action) => action(state),
    hook.memoizedState,
  )
  // 清空队列，重新收集更新state方法
  hook.queue = []
  // 获取触发更新渲染方法
  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, hook)
  return [hook.memoizedState, dispatch]
}

export function useState(initialState) {
  const current = currentlyRenderingFiber.alternate
  if (current === null) {
    return mountReducer(basicStateReducer, initialState)
  } else {
    return updateReducer()
  }
}

export function useReducer(reducer, initialState) {
  const current = currentlyRenderingFiber.alternate
  if (current === null) {
    return mountReducer(reducer, initialState)
  } else {
    return updateReducer()
  }
}
/*****************************  useState end  *****************************/

/*****************************  useEffect start  *****************************/
// 通过Object.is方法比对deps属性值是否变更
function areHookInputsEqual(nextDeps, prevDeps) {
  for (let i = 0; i < nextDeps.length; i++) {
    if (!Object.is(nextDeps[i], prevDeps[i])) {
      return false
    }
  }
  return true
}

/**
 * @param {*} tag HookFlags类型
 * @param {*} create 入参执行函数
 * @param {*} deps 入参依赖
 * @param {*} destroy 入参执行函数返回值
 */
function pushEffect(tag, create, deps, destroy = null) {
  const effect = new Effect(tag, create, deps, destroy)
  if (currentlyRenderingFiber.updateQueue === null)
    currentlyRenderingFiber.updateQueue = []
  const queue = currentlyRenderingFiber.updateQueue
  queue.push(effect)
  return effect
}

/**
 * @param {*} fiberFlags FiberNode节点副作用
 * @param {*} hookFlags Effect类型
 * @param {*} create 入参执行函数
 * @param {*} deps 入参依赖
 */
function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
  // 创建Hook对象，构建Hook单链表
  const hook = mountWorkInProgressHook()
  currentlyRenderingFiber.flags |= fiberFlags
  hook.memoizedState = pushEffect(hookFlags | HookHasEffect, create, deps)
}

/**
 * @param {*} fiberFlags FiberNode节点副作用
 * @param {*} hookFlags Effect类型
 * @param {*} create 入参执行函数
 * @param {*} deps 入参依赖
 */
function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
  // 创建Hook对象，复制旧Hook对象属性值，构建Hook链表
  const hook = updateWorkInProgressHook()
  // 获取旧Effect对象
  const effect = hook.memoizedState
  // 判断新旧Effect deps是否相同
  if (deps !== null && areHookInputsEqual(deps, effect.deps)) {
    hook.memoizedState = pushEffect(
      hookFlags | HookHasEffect,
      create,
      deps,
      effect.destroy,
    )
    return
  }
  currentlyRenderingFiber.flags |= fiberFlags
  hook.memoizedState = pushEffect(hookFlags | HookHasEffect, create, deps)
}

function mountEffect(create, deps) {
  mountEffectImpl(PassiveEffect, HookPassive, create, deps)
}

function updateEffect(create, deps) {
  updateEffectImpl(PassiveEffect, HookPassive, create, deps)
}

export function useEffect(create, deps = null) {
  const current = currentlyRenderingFiber.alternate
  if (current === null) {
    mountEffect(create, deps)
  } else {
    updateEffect(create, deps)
  }
}

function mountLayoutEffect(create, deps) {
  mountEffectImpl(UpdateEffect, HookLayout, create, deps)
}

function updateLayoutEffect(create, deps) {
  updateEffectImpl(UpdateEffect, HookLayout, create, deps)
}

export function useLayoutEffect(create, deps = null) {
  const current = currentlyRenderingFiber.alternate
  if (current === null) {
    mountLayoutEffect(create, deps)
  } else {
    updateLayoutEffect(create, deps)
  }
}
/*****************************  useEffect end  *****************************/

/*****************************  useRef start  *****************************/
function mountRef(initialValue) {
  const hook = mountWorkInProgressHook()
  const ref = new Ref(initialValue)
  return (hook.memoizedState = ref)
}

function updateRef() {
  // 创建Hook对象，复制旧Hook对象属性值，构建Hook链表
  const hook = updateWorkInProgressHook()
  return hook.memoizedState
}

export function useRef(initialValue = null) {
  const current = currentlyRenderingFiber.alternate
  if (current === null) {
    return mountRef(initialValue)
  } else {
    return updateRef()
  }
}
/*****************************  useRef end  *****************************/
