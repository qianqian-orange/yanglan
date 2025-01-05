import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from './FiberNode'
import { NoFlags, Update } from './ReactFiberFlags'

// 设置DOM属性值
export function setProp(el, key, value) {
  switch (key) {
    case 'children': {
      if (typeof value === 'string' || typeof value === 'number') {
        el.textContent = value
      }
      break
    }
    case 'onClick': {
      el.onClick = value
      break
    }
  }
}

export function appendAllChildren(el, workInProgress) {
  let nextChild = workInProgress.child
  while (nextChild !== null) {
    if (nextChild.tag === HostComponent || nextChild.tag === HostText) {
      el.appendChild(nextChild.stateNode)
    } else {
      appendAllChildren(el, nextChild)
    }
    nextChild = nextChild.sibling
  }
}

function bubbleProperties(workInProgress) {
  let subtreeFlags = NoFlags
  let child = workInProgress.child
  while (child !== null) {
    subtreeFlags |= child.flags
    subtreeFlags |= child.subtreeFlags
    child = child.sibling
  }
  workInProgress.subtreeFlags |= subtreeFlags
}

function completeWork(workInProgress) {
  const current = workInProgress.alternate
  switch (workInProgress.tag) {
    // HostRoot和FunctionComponent类型的FiberNode节点没有对应的DOM节点，没有构建DOM树逻辑，只需要收集子树FiberNode节点副作用即可
    case HostRoot:
    case FunctionComponent:
      bubbleProperties(workInProgress)
      return null
    case HostComponent: {
      if (current != null) {
        if (workInProgress.pendingProps) {
          workInProgress.flags |= Update
        }
        bubbleProperties(workInProgress)
        return
      }
      // 创建DOM节点
      const { elementType, pendingProps } = workInProgress
      const instance = document.createElement(elementType)
      // 将DOM节点赋值给FiberNode的stateNode属性
      workInProgress.stateNode = instance
      // 设置DOM节点属性
      for (const propKey in pendingProps) {
        const prpoValue = pendingProps[propKey]
        setProp(instance, propKey, prpoValue)
      }
      // 递归遍历FiberNode节点将对应的DOM节点添加到父DOM节点中，构建DOM树
      appendAllChildren(instance, workInProgress)
      // 收集子树FiberNode节点副作用
      bubbleProperties(workInProgress)
      return null
    }
    case HostText: {
      if (current !== null) {
        if (workInProgress.pendingProps !== current.pendingProps) {
          workInProgress.flags |= Update
        }
        bubbleProperties(workInProgress)
        return null
      }
      const { pendingProps } = workInProgress
      const instance = document.createTextNode(pendingProps)
      workInProgress.stateNode = instance
      bubbleProperties(workInProgress)
      return null
    }
  }
}

export { completeWork }
