import { enqueueConcurrentRenderForLane } from '../ReactFiberConcurrentUpdates'
import { SyncLane } from '../ReactFiberLane'
import { scheduleUpdateOnFiber } from '../ReactFiberWorkLoop'
import {
  currentlyRenderingFiber,
  mountWorkInProgressHook,
  updateWorkInProgressHook,
} from './ReactFiberHooks'
import { mountEffect, updateEffect } from './useEffect'

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

export function useSyncExternalStore(subscribe, getSnapshot) {
  const current = currentlyRenderingFiber.alternate
  if (current === null) {
    return mountSyncExternalStore(subscribe, getSnapshot)
  } else {
    return updateSyncExternalStore(subscribe, getSnapshot)
  }
}
