import {
  currentlyRenderingFiber,
  mountWorkInProgressHook,
  updateWorkInProgressHook,
} from './ReactFiberHooks'

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

export function useRef(initialValue = null) {
  const current = currentlyRenderingFiber.alternate
  if (current === null) {
    return mountRef(initialValue)
  } else {
    return updateRef()
  }
}
