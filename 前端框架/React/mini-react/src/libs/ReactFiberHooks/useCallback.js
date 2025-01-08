import {
  currentlyRenderingFiber,
  mountWorkInProgressHook,
  updateWorkInProgressHook,
  areHookInputsEqual,
} from '.'

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

export function useCallback(callback, deps = null) {
  const current = currentlyRenderingFiber.alternate
  if (current === null) {
    return mountCallback(callback, deps)
  } else {
    return updateCallback(callback, deps)
  }
}
