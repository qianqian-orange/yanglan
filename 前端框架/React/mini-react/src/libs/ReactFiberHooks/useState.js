import { NoLanes, SyncLane } from '../ReactFiberLane'
import {
  currentlyRenderingFiber,
  getRootForUpdatedFiber,
  mountWorkInProgressHook,
  updateWorkInProgressHook,
} from '.'
import { scheduleUpdateOnFiber } from '../ReactFiberWorkLoop'

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
  // 获取FiberRootNode对象
  const root = getRootForUpdatedFiber(fiber)
  // 收集更新state的方法，在创建新FiberNode节点时执行
  hook.queue.push((state) => reducer(state, action))
  fiber.lanes = SyncLane
  if (fiber.alternate !== null) fiber.alternate.lanes = SyncLane
  // 触发更新
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
