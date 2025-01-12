import {
  currentlyRenderingFiber,
  mountWorkInProgressHook,
  renderLanes,
  updateWorkInProgressHook,
} from './ReactFiberHooks'
import { NoLanes, SyncUpdateLanes } from '../ReactFiberLane'
import { requestDeferredLane } from '../ReactFiberWorkLoop'

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

export function useDeferredValue(value, initialValue) {
  const current = currentlyRenderingFiber.alternate
  if (current === null) {
    return mountDeferredValue(value, initialValue)
  } else {
    return updateDeferredValue(value, initialValue)
  }
}
