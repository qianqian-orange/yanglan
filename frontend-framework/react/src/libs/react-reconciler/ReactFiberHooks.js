import { enqueueConcurrentRenderForLane } from './ReactFiberConcurrentUpdates'
import { NoLanes, SyncLane, SyncUpdateLanes } from './ReactFiberLane'
import { readContext } from './ReactFiberNewContext'
import {
  requestDeferredLane,
  scheduleUpdateOnFiber,
} from './ReactFiberWorkLoop'
import { HookHasEffect, HookLayout, HookPassive } from './ReactHookEffectFlags'
import {
  Passive as PassiveEffect,
  Update as UpdateEffect,
} from './ReactFiberFlags'
import ReactSharedInternals from '../shared/ReactSharedInternals'
import { trackUsedThenable } from './ReactFiberThenable'

// 渲染优先级
let renderLanes = NoLanes
// 记录当前FiberNode节点
let currentlyRenderingFiber = null
// 记录旧Hook对象
let currentHook = null
// 记录新Hook对象
let workInProgressHook = null

// promise实例索引
// let thenableIndexCounter = 0
// 记录promise实例
// let thenableState = null

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
  ReactSharedInternals.H =
    workInProgress.alternate === null
      ? HooksDispatcherOnMount
      : HooksDispatcherOnUpdate
  // 调用组件方法获取child ReactElement
  const children = Component(props)
  renderLanes = NoLanes
  currentlyRenderingFiber = null
  currentHook = null
  workInProgressHook = null
  ReactSharedInternals.H = ContextOnlyDispatcher
  // thenableIndexCounter = 0
  // thenableState = null
  return children
}

export function resetHooksAfterThrow() {
  currentlyRenderingFiber = null
  ReactSharedInternals.H = ContextOnlyDispatcher
  // thenableIndexCounter = 0
  // thenableState = null
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
function areHookInputsEqual(nextDeps, prevDeps) {
  for (let i = 0; i < nextDeps.length; i++) {
    if (!Object.is(nextDeps[i], prevDeps[i])) {
      return false
    }
  }
  return true
}

function mountWorkInProgressHook() {
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

function updateWorkInProgressHook() {
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

function basicStateReducer(state, action) {
  return typeof action === 'function' ? action(state) : action
}

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
  // 收集更新state的方法，在创建新FiberNode节点时执行
  hook.queue.push(state => reducer(state, action))
  const root = enqueueConcurrentRenderForLane(fiber, SyncLane)
  // 触发更新渲染
  scheduleUpdateOnFiber(root, SyncLane)
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

function mountState(initialState) {
  return mountReducer(basicStateReducer, initialState)
}

function Effect(tag, create, deps, destroy) {
  this.tag = tag
  this.create = create
  this.deps = deps
  this.destroy = destroy
}

/**
 * @param {*} tag HookFlags类型
 * @param {*} create 入参执行函数
 * @param {*} deps 入参依赖
 * @param {*} destroy 入参执行函数返回值
 */
function pushEffect(tag, create, deps, destroy = null) {
  // 创建Efect对象
  const effect = new Effect(tag, create, deps, destroy)
  if (currentlyRenderingFiber.updateQueue === null)
    currentlyRenderingFiber.updateQueue = []
  // 将Effect对象保存到新节点的updateQueue属性
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
  // 创建Hook对象，构建Hook链表
  const hook = mountWorkInProgressHook()
  // 修改新节点的flags属性值
  currentlyRenderingFiber.flags |= fiberFlags
  // 将Effect对象保存到Hook对象的memoizedState属性
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
    hook.memoizedState = pushEffect(hookFlags, create, deps, effect.destroy)
    return
  }
  // 修改新节点flags属性值
  currentlyRenderingFiber.flags |= fiberFlags
  // 将Effect对象保存到Hook对象的memoizedState属性
  hook.memoizedState = pushEffect(
    hookFlags | HookHasEffect,
    create,
    deps,
    effect.destroy,
  )
}

function mountEffect(create, deps) {
  mountEffectImpl(PassiveEffect, HookPassive, create, deps)
}

function updateEffect(create, deps) {
  updateEffectImpl(PassiveEffect, HookPassive, create, deps)
}

function mountLayoutEffect(create, deps) {
  mountEffectImpl(UpdateEffect, HookLayout, create, deps)
}

function updateLayoutEffect(create, deps) {
  updateEffectImpl(UpdateEffect, HookLayout, create, deps)
}

function Ref(initialValue) {
  this.current = initialValue
}

function mountRef(initialValue) {
  // 创建Hook对象，构建Hook链表
  const hook = mountWorkInProgressHook()
  // 创建Ref对象
  const ref = new Ref(initialValue)
  return (hook.memoizedState = ref)
}

function updateRef() {
  // 创建Hook对象，复制旧Hook对象属性值，构建Hook链表
  const hook = updateWorkInProgressHook()
  return hook.memoizedState
}

function imperativeHandleEffect(ref, create) {
  ref.current = create()

  return () => {
    ref.current = null
  }
}

function mountImperativeHandle(ref, create, deps) {
  mountLayoutEffect(imperativeHandleEffect.bind(null, ref, create), deps)
}

function updateImperativeHandle(ref, create, deps) {
  updateLayoutEffect(imperativeHandleEffect.bind(null, ref, create), deps)
}

function mountMemo(nextCreate, deps) {
  // 创建Hook对象，构建Hook单链表
  const hook = mountWorkInProgressHook()
  // 调用nextCreate方法获取初始值
  const nextValue = nextCreate()
  // 将初始值和deps保存到Hook对象的memoizedState属性中
  hook.memoizedState = [nextValue, deps]
  return nextValue
}

function updateMemo(nextCreate, deps) {
  // 创建Hook对象，复制旧Hook对象属性值，构建Hook链表
  const hook = updateWorkInProgressHook()
  // 获取旧值和依赖deps
  const prevState = hook.memoizedState
  // 比对新旧deps是否相同，相同则直接返回旧值
  if (deps !== null && areHookInputsEqual(deps, prevState[1])) {
    return prevState[0]
  }
  // 重新调用nextCreate方法获取新值
  const nextValue = nextCreate()
  // 将新值和deps保存到Hook对象的memoizedState属性中
  hook.memoizedState = [nextValue, deps]
  return nextValue
}

function mountCallback(callback, deps) {
  // 创建Hook对象，构建Hook单链表
  const hook = mountWorkInProgressHook()
  // 将callback和deps保存到Hook对象的memoizedState属性
  hook.memoizedState = [callback, deps]
  return callback
}

function updateCallback(callback, deps) {
  // 创建Hook对象，复制旧Hook对象属性值，构建Hook链表
  const hook = updateWorkInProgressHook()
  // 获取旧函数和依赖deps
  const prevState = hook.memoizedState
  // 比对新旧deps是否相同，相同则直接返回旧值
  if (deps !== null && areHookInputsEqual(deps, prevState[1])) {
    return prevState[0]
  }
  // 将新函数和deps保存到Hook对象的memoizedState属性
  hook.memoizedState = [callback, deps]
  return callback
}

function mountDeferredValue(value, initialValue) {
  // 创建Hook对象，构建Hook单链表
  const hook = mountWorkInProgressHook()
  if (initialValue === undefined) {
    // 记录延迟更新value
    hook.memoizedState = value
    return value
  }
  // 记录初始值
  hook.memoizedState = initialValue
  // 获取延迟更新优先级
  const deferredLane = requestDeferredLane()
  // 变更当前FiberNode节点优先级
  currentlyRenderingFiber.lanes |= deferredLane
  return initialValue
}

function updateDeferredValue(value) {
  // 创建Hook对象，复制旧Hook对象属性值，构建Hook链表
  const hook = updateWorkInProgressHook()
  const prevValue = hook.memoizedState
  // 如果比对新旧值相同直接返回
  if (Object.is(prevValue, value)) return value
  // 判断当前渲染优先级是否有同步更新优先级，如果有则延迟更新value，返回旧值，如果没有同步更新优先级，返回新值
  if ((renderLanes & SyncUpdateLanes) !== NoLanes) {
    // 获取延迟更新优先级
    const deferredLane = requestDeferredLane()
    // 更新FiberNode节点优先级
    currentlyRenderingFiber.lanes |= deferredLane
    return prevValue
  }
  hook.memoizedState = value
  return value
}

function forceStoreRerender(fiber) {
  const root = enqueueConcurrentRenderForLane(fiber, SyncLane)
  // 触发更新渲染
  scheduleUpdateOnFiber(root, SyncLane)
}

// 调用subscribe方法，并获取返回的destroy方法
function subscribeToStore(fiber, hook, subscribe) {
  // 当触发监听事件时，会调用callback方法
  const callback = () => {
    const [prevSnapshot, getSnapshot] = hook.memoizedState
    const nextSnapshot = getSnapshot()
    // 比对新旧值是否相同，如果不相同更新Hook对象memoizedState属性，触发更新渲染
    if (!Object.is(prevSnapshot, nextSnapshot)) {
      hook.memoizedState[0] = nextSnapshot
      forceStoreRerender(fiber)
    }
  }
  return subscribe(callback)
}

function mountSyncExternalStore(subscribe, getSnapshot) {
  // 创建Hook对象，构建Hook单链表
  const hook = mountWorkInProgressHook()
  // 监听subscribe函数，在DOM更新阶段调用subscribe方法
  mountEffect(
    subscribeToStore.bind(null, currentlyRenderingFiber, hook, subscribe),
    [subscribe],
  )
  // 调用getSnapshot方法获取初始值
  const nextSnapshot = getSnapshot()
  hook.memoizedState = [nextSnapshot, getSnapshot]
  return nextSnapshot
}

function updateSyncExternalStore(subscribe, getSnapshot) {
  // 创建Hook对象，复制旧Hook对象属性值，构建Hook链表
  const hook = updateWorkInProgressHook()
  hook.memoizedState[1] = getSnapshot
  updateEffect(
    subscribeToStore.bind(null, currentlyRenderingFiber, hook, subscribe),
    [subscribe],
  )
  return hook.memoizedState[0]
}

// function useThenable(thenable) {
//   const index = thenableIndexCounter
//   thenableIndexCounter += 1
//   if (thenableState === null) thenableState = createThenableState()
//   const result = trackUsedThenable(thenableState, thenable, index)
//   return result
// }

function useThenable(thenable) {
  const result = trackUsedThenable(thenable)
  return result
}

function use(usable) {
  if (typeof usable === 'object' && usable !== null) {
    // 判断是否是promsie实例
    if (typeof usable.then === 'function') {
      return useThenable(usable)
    } else {
      return readContext(usable)
    }
  }
}

const HooksDispatcherOnMount = {
  useState: mountState,
  useReducer: mountReducer,
  useEffect: mountEffect,
  useLayoutEffect: mountLayoutEffect,
  useRef: mountRef,
  useImperativeHandle: mountImperativeHandle,
  useMemo: mountMemo,
  useCallback: mountCallback,
  useContext: readContext,
  useDeferredValue: mountDeferredValue,
  useSyncExternalStore: mountSyncExternalStore,
  use,
}

const HooksDispatcherOnUpdate = {
  useState: updateReducer,
  useReducer: updateReducer,
  useEffect: updateEffect,
  useLayoutEffect: updateLayoutEffect,
  useRef: updateRef,
  useImperativeHandle: updateImperativeHandle,
  useMemo: updateMemo,
  useCallback: updateCallback,
  useContext: readContext,
  useDeferredValue: updateDeferredValue,
  useSyncExternalStore: updateSyncExternalStore,
  use,
}

function throwInvalidHookError() {
  throw new Error(
    'Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for' +
      ' one of the following reasons:\n' +
      '1. You might have mismatching versions of React and the renderer (such as React DOM)\n' +
      '2. You might be breaking the Rules of Hooks\n' +
      '3. You might have more than one copy of React in the same app\n' +
      'See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.',
  )
}

const ContextOnlyDispatcher = {
  useState: throwInvalidHookError,
  useReducer: throwInvalidHookError,
  useEffect: throwInvalidHookError,
  useLayoutEffect: throwInvalidHookError,
  useRef: throwInvalidHookError,
  useImperativeHandle: throwInvalidHookError,
  useMemo: throwInvalidHookError,
  useCallback: throwInvalidHookError,
  useContext: throwInvalidHookError,
  useDeferredValue: throwInvalidHookError,
  useSyncExternalStore: throwInvalidHookError,
}
