import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from './FiberNode'
import { ChildDeletion, Passive, Placement, Update } from './ReactFiberFlags'
import { appendAllChildren, setProp } from './ReactFiberCompleteWork'

// 获取父DOM节点
function getParentNode(finishWork) {
  let parentFiber = finishWork.return
  while (parentFiber !== null) {
    if (parentFiber.tag === FunctionComponent) {
      parentFiber = parentFiber.return
      continue
    }
    break
  }
  return parentFiber.tag === HostRoot
    ? parentFiber.stateNode.containerInfo
    : parentFiber.stateNode
}

// 获取子DOM节点
function getChildrenNode(finishWork) {
  let childFiber = finishWork.child
  while (childFiber !== null) {
    if (childFiber.tag === FunctionComponent) {
      childFiber = childFiber.child
      continue
    }
    break
  }
  return childFiber.stateNode
}

function commitHostPlacement(finishWork) {
  const parentNode = getParentNode(finishWork)
  parentNode.appendChild(finishWork.stateNode)
}

function commitReconciliationEffects(finishWork) {
  if (finishWork.flags & Placement) {
    commitHostPlacement(finishWork)
  }
}

function recursivelyTraverseMutationEffects(finishWork) {
  if (finishWork.deletions !== null) {
    const parentNode =
      finishWork.tag === HostComponent
        ? finishWork.stateNode
        : getParentNode(finishWork)
    // 将旧节点对应的DOM节点从DOM树移除
    finishWork.deletions.forEach((fiber) => {
      const childNode = getChildrenNode(fiber)
      parentNode.removeChild(childNode)
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
      // 为true则需要将对应DOM节点插入到父节点DOM中
      if (finishWork.flags & Placement) {
        // 获取父节点DOM
        const parentNode = getParentNode(finishWork)
        // 获取子节点对应的DOM
        appendAllChildren(parentNode, finishWork)
      }
      break
    }
    case HostComponent: {
      recursivelyTraverseMutationEffects(finishWork)
      commitReconciliationEffects(finishWork)
      // 更新DOM属性
      if (finishWork.flags & Update) {
        const { pendingProps, stateNode } = finishWork
        for (const propKey in pendingProps) {
          const prpoValue = pendingProps[propKey]
          setProp(stateNode, propKey, prpoValue)
        }
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

// 执行useEffect Unmount逻辑
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

// 执行useEffect Mount逻辑
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

export function flushPassiveEffects(root) {
  commitPassiveUnmountOnFiber(root.current)
  commitPassiveMountOnFiber(root.current)
}
