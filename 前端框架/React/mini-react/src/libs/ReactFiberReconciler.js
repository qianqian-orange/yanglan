import FiberNode, {
  ChildDeletion,
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
  NoFlags,
  NoLanes,
  Placement,
  Update,
} from './FiberNode'
import { beginWork } from './ReactFiberBeginWork'

let workInProgress = null
let renderLanes = NoLanes

/**
 * @param {*} current FiberNode节点
 * @param {*} pendingProps 对应ReactElement对象的props
 */
export function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate
  if (workInProgress !== null) {
    workInProgress.flags = NoFlags
    workInProgress.subtreeFlags = NoFlags
    workInProgress.deletions = null
    workInProgress.pendingProps = pendingProps
  } else {
    workInProgress = new FiberNode(current.tag, pendingProps)
    workInProgress.alternate = current
    current.alternate = workInProgress
  }
  workInProgress.key = current.key
  workInProgress.elementType = current.elementType
  workInProgress.child = current.child
  workInProgress.sibling = current.sibling
  workInProgress.stateNode = current.stateNode
  workInProgress.memoizedState = current.memoizedState
  workInProgress.lanes = current.lanes
  return workInProgress
}

// 是否需要处理副作用，即插入、更新、删除等操作
// 举例，在首次渲染时，按理每个FiberNode节点的flags属性值应该都赋值为Placement，
// 但是并不需要，只需要将App Component对应的FiberNode节点的flags的属性值赋值为Placement即可，
// 因为在构建DOM树阶段会构建好整个DOM树，在更新DOM阶段，当递归遍历到App Component FiberNode节点
// 我们只需要将其对应的DOM节点直接插入到页面指定节点即可完成DOM更新操作，不需要再递归遍历FiberNode节点
function createChildReconciler(shouldTrackSideEffects) {
  function placeChild(newFiber) {
    // 当需要处理副作用时，且旧FiberNode Tree中没有新节点对应的旧节点时，说明是新增节点，将其flags属性值赋值为Placement
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      newFiber.flags |= Placement
    }
    return newFiber
  }

  // 遍历旧FiberNode节点及其兄弟节点添加到父节点的deletions属性中，将父节点的flags赋值为ChildDeletion
  function deleteChild(returnFiber, oldFiber, traverse = true) {
    if (oldFiber === null) {
      return null
    }
    returnFiber.flags |= ChildDeletion
    returnFiber.deletions = returnFiber.deletions || []
    returnFiber.deletions.push(oldFiber)
    oldFiber = oldFiber.sibling
    while (oldFiber && traverse) {
      returnFiber.deletions.push(oldFiber)
      oldFiber = oldFiber.sibling
    }
    return null
  }

  function useFiber(fiber, pendingProps) {
    const clone = createWorkInProgress(fiber, pendingProps)
    clone.sibling = null
    return clone
  }

  // 创建ReactElement对应的FiberNode节点
  function createFiberFormElement(element) {
    let fiber
    if (typeof element.type === 'function') {
      fiber = new FiberNode(FunctionComponent, element.props)
    } else {
      fiber = new FiberNode(HostComponent, element.props)
    }
    fiber.key = element.key
    fiber.elementType = element.type
    return fiber
  }

  // 创建文本对应的FiberNode节点
  function creaetFiberFromText(text) {
    const fiber = new FiberNode(HostText, text + '')
    return fiber
  }

  // 创建文本FiberNode节点
  function reconcileSingleTextNode(returnFiber, oldFiber, text) {
    if (oldFiber !== null && oldFiber.tag === HostText) {
      deleteChild(returnFiber, oldFiber.sibling)
      const existing = useFiber(oldFiber, text)
      existing.return = returnFiber
      return existing
    }
    deleteChild(returnFiber, oldFiber)
    const fiber = creaetFiberFromText(text)
    fiber.return = returnFiber
    return placeChild(fiber)
  }

  // 创建单个ReactElement对象对应的FiberNode节点
  function reconcileSingleElement(returnFiber, oldFiber, newChild) {
    if (
      oldFiber !== null &&
      oldFiber.key === newChild.key &&
      oldFiber.elementType === newChild.type
    ) {
      deleteChild(returnFiber, oldFiber.sibling)
      const fiber = useFiber(oldFiber, newChild.props)
      fiber.return = returnFiber
      return fiber
    }
    deleteChild(returnFiber, oldFiber)
    const fiber = createFiberFormElement(newChild)
    fiber.return = returnFiber
    return placeChild(fiber)
  }

  function reconcileChildrenArray(returnFiber, oldFiber, newChild) {
    let firstChildFiber = null
    let prevChildFiber = null
    for (let newIdx = 0; newIdx < newChild.length; newIdx++) {
      let nextFiber = null
      if (typeof newChild[newIdx] === 'object' && newChild[newIdx] !== null) {
        const { key, type, props } = newChild[newIdx]
        if (
          oldFiber !== null &&
          oldFiber.key === key &&
          oldFiber.elementType === type
        ) {
          nextFiber = placeChild(useFiber(oldFiber, props))
        } else {
          deleteChild(returnFiber, oldFiber, false)
          nextFiber = placeChild(createFiberFormElement(newChild[newIdx]))
        }
      } else if (
        typeof newChild[newIdx] === 'string' ||
        typeof newChild[newIdx] === 'number'
      ) {
        if (oldFiber !== null && oldFiber.tag === HostText) {
          nextFiber = placeChild(useFiber(oldFiber, newChild[newIdx] + ''))
        } else {
          deleteChild(returnFiber, oldFiber, false)
          nextFiber = placeChild(creaetFiberFromText(newChild[newIdx]))
        }
      } else {
        if (oldFiber) deleteChild(returnFiber, oldFiber, false)
      }
      if (oldFiber) oldFiber = oldFiber.sibling
      if (nextFiber !== null) {
        nextFiber.return = returnFiber
        // 记录第一个child FiberNode节点
        if (firstChildFiber === null) {
          firstChildFiber = nextFiber
        }
        // 建立兄弟FiberNode节点关联关系
        if (prevChildFiber === null) {
          prevChildFiber = nextFiber
        } else {
          prevChildFiber.sibling = nextFiber
          prevChildFiber = nextFiber
        }
      }
    }
    return firstChildFiber
  }

  /**
   * @param {*} returnFiber 父FiberNode节点
   * @param {*} currentFirstChild 旧FiberNode节点的子节点
   * @param {*} newChild ReactElement对象
   */
  function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
    if (typeof newChild === 'object' && newChild !== null) {
      if (Array.isArray(newChild)) {
        return reconcileChildrenArray(returnFiber, currentFirstChild, newChild)
      }
      const firstChildFiber = reconcileSingleElement(
        returnFiber,
        currentFirstChild,
        newChild,
      )
      return firstChildFiber
    }
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      const firstChildFiber = reconcileSingleTextNode(
        returnFiber,
        currentFirstChild,
        newChild,
      )
      return firstChildFiber
    }
    return deleteChild(returnFiber, currentFirstChild)
  }

  return reconcileChildFibers
}

const mountChildFibers = createChildReconciler(false)
const reconcileChildFibers = createChildReconciler(true)

/**
 * @param {*} current 旧FiberNode节点
 * @param {*} workInProgress FiberNode节点
 * @param {*} nextChildren child ReactElement对象
 */
export function reconcileChildren(current, workInProgress, nextChildren) {
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren)
  } else {
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
    )
  }
  return workInProgress.child
}

// 设置DOM属性值
function setProp(el, key, value) {
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

function appendAllChildren(el, workInProgress) {
  let nextChild = workInProgress.child
  while (nextChild) {
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
  while (child) {
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

/**
 * @param {*} unitOfWork FiberNode节点
 */
function completeUnitOfWork(unitOfWork) {
  while (unitOfWork) {
    let nextFiber = unitOfWork
    // 构建FiberNode节点对应的DOM树和收集子树FiberNode节点副作用
    completeWork(nextFiber)
    // 获取兄弟节点
    nextFiber = nextFiber.sibling
    // 如果有兄弟节点，则调用performUnitOfWork方法继续构建FiberNode Tree
    if (nextFiber !== null) {
      workInProgress = nextFiber
      break
    }
    // 递归父FiberNode节点
    unitOfWork = unitOfWork.return
    workInProgress = unitOfWork
  }
}

function performUnitOfWork(unitOfWork) {
  let nextFiber = beginWork(unitOfWork, renderLanes)
  // next为null，说明已经遍历到当前分支叶子FiberNode节点，则调用completeWork方法构建DOM树和收集子树FiberNode节点副作用
  if (nextFiber === null) {
    completeUnitOfWork(unitOfWork)
  } else {
    workInProgress = nextFiber
  }
}

// 1. 创建根FiberNode副本节点，赋值给workInProgress
// 2. 递归遍历wokrInProgress节点
/**
 * @param {*} root FiberRootNode对象
 */
function renderRootSync(root, lanes) {
  renderLanes = lanes
  const current = root.current
  // 创建根FiberNode副本节点，赋值给workInProgress
  workInProgress = createWorkInProgress(current, current.pendingProps)
  // 递归遍历FiberNode节点，创建ReactElement对应的FiberNode节点，建立关联关系，构建FiberNode Tree
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
}

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
function getChildNode(finishWork) {
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

function recursivelyTraverseMutationEffects(finishWork) {
  if (finishWork.deletions !== null) {
    const parentNode =
      finishWork.tag === HostComponent
        ? finishWork.stateNode
        : getParentNode(finishWork)
    // 将旧节点对应的DOM节点从DOM树移除
    finishWork.deletions.forEach((fiber) => {
      const childNode = getChildNode(fiber)
      parentNode.removeChild(childNode)
    })
  }
  // 为true说明子树FiberNode节点有副作用需要处理，递归遍历child FiberNode
  if (finishWork.subtreeFlags & (Placement | Update | ChildDeletion)) {
    let child = finishWork.child
    while (child) {
      commitMutationEffectsOnFiber(child)
      child = child.sibling
    }
  }
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

function commitMutationEffectsOnFiber(finishWork) {
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

/**
 * @param {*} root FiberRootNode
 */
function commitRoot(root) {
  const finishWork = root.current.alternate
  // 递归遍历FiberNode节点，执行对应副作用处理逻辑
  commitMutationEffectsOnFiber(finishWork)
  // 将FiberRootNode对象current属性指向最新的FiiberNode Tree根节点
  root.current = finishWork
}

/**
 * @param {*} root FiberRootNode对象
 */
function performWorkOnRoot(root, lanes) {
  // 构建FiberNode Tree和DOM树
  renderRootSync(root, lanes)
  // 更新DOM
  commitRoot(root)
}

export { performWorkOnRoot }
