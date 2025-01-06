import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from './FiberNode'
import {
  ChildDeletion,
  Passive,
  Placement,
  Ref,
  Update,
} from './ReactFiberFlags'
import { appendAllChildren } from './ReactFiberCompleteWork'
import { updateProperties } from './ReactDOMComponent'

let hostParent = null

function getHostParentFiber(finishWork) {
  let parentFiber = finishWork.return
  while (parentFiber !== null) {
    if (parentFiber.tag === HostComponent || parentFiber.tag === HostRoot) {
      break
    }
    parentFiber = parentFiber.return
  }
  return parentFiber
}

function commitHostPlacement(finishWork) {
  const parentFiber = getHostParentFiber(finishWork)
  let parentNode = parentFiber.tag === HostComponent ? parentFiber.stateNode : parentFiber.stateNode.containerInfo
  if (finishWork.tag === FunctionComponent) {
    appendAllChildren(parentNode, finishWork)
  } else {
    parentNode.appendChild(finishWork.stateNode)
  }
}

function commitReconciliationEffects(finishWork) {
  if (finishWork.flags & Placement) commitHostPlacement(finishWork)
}

/*****************************  deletions start  *****************************/
function recursivelyTraverseDeletionEffects(finishWork) {
  let child = finishWork.child
  while (child !== null) {
    commitDeletionEffectsOnFiber(child)
    child = child.sibling
  }
}

function commitDeletionEffectsOnFiber(finishWork) {
  switch (finishWork.tag) {
    case HostComponent:
      safelyDetachRef(finishWork)
      hostParent.removeChild(finishWork.stateNode)
      break
    case HostText:
      hostParent.removeChild(finishWork.stateNode)
      break
    default:
      recursivelyTraverseDeletionEffects(finishWork)
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
        hostParent = returnFiber.stateNode
        break
    }
    if (hostParent !== null) break
  }
  commitDeletionEffectsOnFiber(deletedFiber)
  hostParent = null
}
/*****************************  deletions end  *****************************/

function recursivelyTraverseMutationEffects(finishWork) {
  if (finishWork.deletions !== null) {
    finishWork.deletions.forEach((fiber) => {
      commitDeletionEffects(finishWork, fiber)
    })
  }
  // 为true说明子树FiberNode节点有副作用需要处理，递归遍历child FiberNode
  if (finishWork.subtreeFlags & (Placement | Update | ChildDeletion)) {
    let child = finishWork.child
    while (child !== null) {
      commitMutationEffectsOnFiber(child)
      child = child.sibling
    }
  }
}

export function commitMutationEffectsOnFiber(finishWork) {
  // 采用深度优先遍历算法进行DOM更新
  switch (finishWork.tag) {
    case HostRoot: {
      recursivelyTraverseMutationEffects(finishWork)
      break
    }
    case FunctionComponent: {
      recursivelyTraverseMutationEffects(finishWork)
      commitReconciliationEffects(finishWork)
      break
    }
    case HostComponent: {
      recursivelyTraverseMutationEffects(finishWork)
      commitReconciliationEffects(finishWork)
      if (finishWork.flags & Ref) safelyDetachRef(finishWork)
      // 更新DOM属性
      if (finishWork.flags & Update) {
        const { pendingProps, stateNode, alternate } = finishWork
        updateProperties(stateNode, pendingProps, alternate.pendingProps)
      }
      break
    }
    case HostText: {
      commitReconciliationEffects(finishWork)
      // 修改文本内容
      if (finishWork.flags & Update) {
        finishWork.stateNode.textContent = finishWork.pendingProps
      }
      break
    }
  }
}

/*****************************  useEffect destroy start  *****************************/
function commitHookPassiveUnmountEffects(finishWork) {
  const queue = finishWork.updateQueue
  if (queue !== null) {
    queue.forEach((effect) => {
      if (effect.destroy) {
        const destroy = effect.destroy
        effect.destroy = null
        destroy()
      }
    })
  }
}

function recursivelyTraversePassiveUnmountEffects(finishWork) {
  if (finishWork.deletions !== null) {
    // 采用深度优先遍历算法，优先执行分支叶子节点useEffect的destroy方法
    for (let i = 0; i < finishWork.deletions.length; i++) {
      let fiber = finishWork.deletions[i]
      while (true) {
        let nextChild = fiber.child
        while (nextChild !== null) {
          fiber = nextChild
          nextChild = nextChild.child
        }
        commitHookPassiveUnmountEffects(fiber)
        if (fiber.sibling !== null) {
          nextChild = fiber.sibling
          fiber.sibling = null
        } else {
          if (fiber === finishWork.deletions[i]) break
          fiber = fiber.return
          fiber.child = null
        }
      }
    }
  }
  if (finishWork.subtreeFlags & (Passive | ChildDeletion)) {
    let child = finishWork.child
    while (child !== null) {
      commitPassiveUnmountOnFiber(child)
      child = child.sibling
    }
  }
}

function commitPassiveUnmountOnFiber(finishWork) {
  switch (finishWork.tag) {
    case FunctionComponent: {
      recursivelyTraversePassiveUnmountEffects(finishWork)
      if (finishWork.flags & Passive) {
        commitHookPassiveUnmountEffects(finishWork)
      }
      break
    }
    default: {
      recursivelyTraversePassiveUnmountEffects(finishWork)
      break
    }
  }
}
/*****************************  useEffect destroy end  *****************************/

/*****************************  useEffect create start  *****************************/
function commitHookPassiveMountEffects(finishWork) {
  const queue = finishWork.updateQueue
  queue.forEach((effect) => {
    effect.destroy = effect.create()
  })
}

function recursivelyTraversePassiveMountEffects(finishWork) {
  if (finishWork.subtreeFlags & Passive) {
    let child = finishWork.child
    while (child !== null) {
      commitPassiveMountOnFiber(child)
      child = child.sibling
    }
  }
}

function commitPassiveMountOnFiber(finishWork) {
  switch (finishWork.tag) {
    case FunctionComponent: {
      recursivelyTraversePassiveMountEffects(finishWork)
      if (finishWork.flags & Passive) {
        // 调用useEffeact的create方法
        commitHookPassiveMountEffects(finishWork)
      }
      break
    }
    default: {
      recursivelyTraversePassiveMountEffects(finishWork)
      break
    }
  }
}
/*****************************  useEffect create end  *****************************/
export function flushPassiveEffects(root) {
  commitPassiveUnmountOnFiber(root.current)
  commitPassiveMountOnFiber(root.current)
}

/*****************************  useRef start  *****************************/
// 将ref.current赋值为null
function safelyDetachRef(finishWork) {
  if (finishWork !== null && finishWork.ref !== null)
    finishWork.ref.current = null
}

function commitAttachRef(finishWork) {
  const { ref, stateNode } = finishWork
  if (ref !== null) ref.current = stateNode
}

function recursivelyTraverseLayoutEffects(finishWork) {
  if (finishWork.subtreeFlags & Ref) {
    let child = finishWork.child
    while (child !== null) {
      commitLayoutEffectOnFiber(child)
      child = child.sibling
    }
  }
}

export function commitLayoutEffectOnFiber(finishWork) {
  switch (finishWork.tag) {
    case HostComponent: {
      recursivelyTraverseLayoutEffects(finishWork)
      if (finishWork.flags & Ref) commitAttachRef(finishWork)
      break
    }
    default: {
      recursivelyTraverseLayoutEffects(finishWork)
      break
    }
  }
}
/*****************************  useRef end  *****************************/
