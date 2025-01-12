import {
  areHookInputsEqual,
  currentlyRenderingFiber,
  mountWorkInProgressHook,
  updateWorkInProgressHook,
} from './ReactFiberHooks'
import { HookHasEffect, HookLayout, HookPassive } from '../ReactHookEffectFlags'
import {
  Passive as PassiveEffect,
  Update as UpdateEffect,
} from '../ReactFiberFlags'

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
export function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
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
export function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
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
  // 修改新节点flags属性值
  currentlyRenderingFiber.flags |= fiberFlags
  // 将Effect对象保存到Hook对象的memoizedState属性
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
