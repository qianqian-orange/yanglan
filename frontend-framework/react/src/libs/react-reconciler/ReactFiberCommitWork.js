import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
  MemoComponent,
  OffscreenComponent,
  SuspenseComponent,
} from './ReactWorkTags'
import {
  ChildDeletion,
  Passive,
  PassiveMask,
  Placement,
  Ref,
  Snapshot,
  Update,
  Visibility,
} from './ReactFiberFlags'
import { HookHasEffect, HookLayout, HookPassive } from './ReactHookEffectFlags'
import { commitUpdate } from '../react-dom-bindings/client/ReactFiberConfigDOM'
import { resolveRetryWakeable } from './ReactFiberWorkLoop'
import {
  commitHostPlacement,
  commitShowHideHostInstance,
  commitShowHideHostTextInstance,
} from './ReactFiberCommitHostEffects'
import {
  commitHookEffectListMount,
  commitHookEffectListUnmount,
  safelyAttachRef,
  safelyDetachRef,
} from './ReactFiberCommitEffects'

let hostParent = null

// 插入新节点
function commitReconciliationEffects(finishedWork) {
  if (finishedWork.flags & Placement) {
    commitHostPlacement(finishedWork)
    finishedWork.flags &= ~Placement
  }
}

/*****************************  deletions start  *****************************/
function recursivelyTraverseDeletionEffects(finishedWork) {
  let child = finishedWork.child
  while (child !== null) {
    commitDeletionEffectsOnFiber(child)
    child = child.sibling
  }
}

function commitDeletionEffectsOnFiber(finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent:
      commitHookEffectListUnmount(finishedWork, HookLayout)
      recursivelyTraverseDeletionEffects(finishedWork)
      break
    case HostComponent: {
      safelyDetachRef(finishedWork)
      const prevHostParent = hostParent
      hostParent = null
      recursivelyTraverseDeletionEffects(finishedWork)
      hostParent = prevHostParent
      if (hostParent !== null) hostParent.removeChild(finishedWork.stateNode)
      break
    }
    case HostText:
      if (hostParent !== null) hostParent.removeChild(finishedWork.stateNode)
      break
    default:
      recursivelyTraverseDeletionEffects(finishedWork)
      break
  }
}

function commitDeletionEffects(returnFiber, deletedFiber) {
  // 获取deletedFiber节点的父DOM节点
  let parentFiber = returnFiber
  while (parentFiber !== null) {
    switch (parentFiber.tag) {
      case HostRoot:
        hostParent = returnFiber.stateNode.containerInfo
        break
      case FunctionComponent:
        parentFiber = parentFiber.return
        break
      case HostComponent:
        hostParent = parentFiber.stateNode
        break
    }
    parentFiber = parentFiber.return
  }
  commitDeletionEffectsOnFiber(deletedFiber)
  hostParent = null
}
/*****************************  deletions end  *****************************/
function getRetryCache(finishedWork) {
  let retryCache = finishedWork.stateNode
  if (retryCache === null) {
    retryCache = finishedWork.stateNode = new WeakSet()
  }
  return retryCache
}

// 监听promise.then回调
function attachSuspenseRetryListeners(finishedWork, wakeables) {
  const retryCache = getRetryCache(finishedWork)
  wakeables.forEach(wakeable => {
    if (!retryCache.has(wakeable)) retryCache.add(wakeable)
    const retry = resolveRetryWakeable.bind(null, finishedWork, wakeable)
    wakeable.then(retry, retry)
  })
}

function recursivelyTraverseMutationEffects(finishedWork) {
  if (finishedWork.deletions !== null) {
    finishedWork.deletions.forEach(fiber => {
      commitDeletionEffects(finishedWork, fiber)
    })
  }
  // 为true说明子树FiberNode节点有副作用需要处理，递归遍历child FiberNode
  if (finishedWork.subtreeFlags & (Placement | Update | ChildDeletion)) {
    let child = finishedWork.child
    while (child !== null) {
      commitMutationEffectsOnFiber(child)
      child = child.sibling
    }
  }
}

function disappearLayoutEffects(finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent:
      commitHookEffectListUnmount(finishedWork, HookLayout)
      recursivelyTraverseDisappearLayoutEffects(finishedWork)
      break
    case HostComponent:
      safelyDetachRef(finishedWork)
      recursivelyTraverseDisappearLayoutEffects(finishedWork)
      break
    default:
      recursivelyTraverseDisappearLayoutEffects(finishedWork)
  }
}

// 递归调用OffscreenComponent类型组件子树节点useLayoutEffect destroy方法
function recursivelyTraverseDisappearLayoutEffects(parentFiber) {
  let child = parentFiber.child
  while (child !== null) {
    disappearLayoutEffects(child)
    child = child.sibling
  }
}

function hideOrUnhideAllChildren(finishedWork, isHidden) {
  let node = finishedWork
  while (true) {
    if (node.tag === HostComponent) {
      commitShowHideHostInstance(node, isHidden)
    } else if (node.tag === HostText) {
      commitShowHideHostTextInstance(node, isHidden)
    } else if (node.tag === OffscreenComponent) {
      node.child.return = node
      node = node.child
      continue
    } else if (node.child !== null) {
      node.child.return = node
      node = node.child
      continue
    }
    while (node.sibling === null) {
      if (node.return === finishedWork) return
      node = node.return
    }
    node = node.sibling
  }
}

export function commitMutationEffectsOnFiber(finishedWork) {
  // 采用深度优先遍历算法进行DOM更新
  switch (finishedWork.tag) {
    case HostRoot: {
      recursivelyTraverseMutationEffects(finishedWork)
      break
    }
    case MemoComponent:
    case FunctionComponent: {
      recursivelyTraverseMutationEffects(finishedWork)
      commitReconciliationEffects(finishedWork)
      if (finishedWork.flags & Update) {
        // 调用useLayoutEffect destroy方法
        commitHookEffectListUnmount(finishedWork, HookLayout | HookHasEffect)
      }
      break
    }
    case HostComponent: {
      recursivelyTraverseMutationEffects(finishedWork)
      commitReconciliationEffects(finishedWork)
      if (finishedWork.flags & Ref) safelyDetachRef(finishedWork)
      // 更新DOM属性
      if (finishedWork.flags & Update) {
        const { pendingProps, stateNode, alternate } = finishedWork
        commitUpdate(stateNode, alternate.pendingProps, pendingProps)
      }
      break
    }
    case HostText: {
      commitReconciliationEffects(finishedWork)
      // 修改文本内容
      if (finishedWork.flags & Update)
        finishedWork.stateNode.textContent = finishedWork.pendingProps
      break
    }
    case SuspenseComponent:
      recursivelyTraverseMutationEffects(finishedWork)
      if (finishedWork.flags & Update) {
        const retryQueue = finishedWork.updateQueue
        if (retryQueue !== null) {
          finishedWork.updateQueue = null
          // 添加promise实例then回调，回调逻辑是触发更细渲染
          attachSuspenseRetryListeners(finishedWork, retryQueue)
        }
      }
      break
    case OffscreenComponent:
      recursivelyTraverseMutationEffects(finishedWork)
      if (finishedWork.flags & Visibility) {
        const isHidden = finishedWork.pendingProps.mode === 'hidden'
        if (isHidden) recursivelyTraverseDisappearLayoutEffects(finishedWork)
        // 隐藏或显示子树节点
        hideOrUnhideAllChildren(finishedWork, isHidden)
      }
      break
    default:
      recursivelyTraverseMutationEffects(finishedWork)
      commitReconciliationEffects(finishedWork)
      break
  }
}

/*****************************  useEffect destroy start  *****************************/
function recursivelyTraversePassiveUnmountEffects(finishedWork) {
  if (finishedWork.deletions !== null) {
    // 采用深度优先遍历算法
    for (let i = 0; i < finishedWork.deletions.length; i++) {
      let fiber = finishedWork.deletions[i]
      while (true) {
        let nextChild = fiber.child
        commitHookEffectListUnmount(fiber, HookPassive)
        while (nextChild !== null) {
          fiber = nextChild
          commitHookEffectListUnmount(fiber, HookPassive)
          nextChild = nextChild.child
        }
        if (fiber.sibling !== null) {
          nextChild = fiber.sibling
          fiber.sibling = null
          fiber = nextChild
        } else {
          if (fiber === finishedWork.deletions[i]) break
          fiber = fiber.return
          fiber.child = null
        }
      }
    }
  }
  if (finishedWork.subtreeFlags & PassiveMask) {
    let child = finishedWork.child
    while (child !== null) {
      commitPassiveUnmountOnFiber(child)
      child = child.sibling
    }
  }
}

export function commitPassiveUnmountOnFiber(finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent: {
      recursivelyTraversePassiveUnmountEffects(finishedWork)
      if (finishedWork.flags & Passive) {
        // 调用useEffect的destroy方法
        commitHookEffectListUnmount(finishedWork, HookPassive | HookHasEffect)
      }
      break
    }
    default: {
      recursivelyTraversePassiveUnmountEffects(finishedWork)
      break
    }
  }
}
/*****************************  useEffect destroy end  *****************************/

/*****************************  useEffect create start  *****************************/
function recursivelyTraversePassiveMountEffects(finishedWork) {
  if (finishedWork.subtreeFlags & Passive) {
    let child = finishedWork.child
    while (child !== null) {
      commitPassiveMountOnFiber(child)
      child = child.sibling
    }
  }
}

export function commitPassiveMountOnFiber(finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent: {
      recursivelyTraversePassiveMountEffects(finishedWork)
      if (finishedWork.flags & Passive) {
        // 调用useEffect的create方法
        commitHookEffectListMount(finishedWork, HookPassive | HookHasEffect)
      }
      break
    }
    default: {
      recursivelyTraversePassiveMountEffects(finishedWork)
      break
    }
  }
}
/*****************************  useEffect create end  *****************************/

/*****************************  useLayoutEffect / useRef start  *****************************/
function recursivelyTraverseLayoutEffects(finishedWork) {
  if (finishedWork.subtreeFlags & (Ref | Update)) {
    let child = finishedWork.child
    while (child !== null) {
      commitLayoutEffectOnFiber(child)
      child = child.sibling
    }
  }
}

export function commitLayoutEffectOnFiber(finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent: {
      recursivelyTraverseLayoutEffects(finishedWork)
      if (finishedWork.flags & Update) {
        // 调用useLayoutEffect的create方法
        commitHookEffectListMount(finishedWork, HookLayout | HookHasEffect)
      }
      break
    }
    case HostComponent: {
      recursivelyTraverseLayoutEffects(finishedWork)
      if (finishedWork.flags & Ref) safelyAttachRef(finishedWork)
      break
    }
    default: {
      recursivelyTraverseLayoutEffects(finishedWork)
      break
    }
  }
}
/***************************** useLayoutEffect / useRef end  *****************************/

export function commitBeforeMutationEffectsOnFiber(finishedWork) {
  switch (finishedWork.tag) {
    case HostRoot: {
      // 清空挂载节点内容
      if (finishedWork.flags & Snapshot) {
        const root = finishedWork.stateNode
        root.containerInfo.textContent = ''
      }
      break
    }
  }
}
