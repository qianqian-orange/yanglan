import {
  currentlyRenderingFiber,
  mountWorkInProgressHook,
  updateWorkInProgressHook,
  areHookInputsEqual,
} from './ReactFiberHooks'

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

export function useMemo(nextCreate, deps = null) {
  const current = currentlyRenderingFiber.alternate
  if (current === null) {
    return mountMemo(nextCreate, deps)
  } else {
    return updateMemo(nextCreate, deps)
  }
}
