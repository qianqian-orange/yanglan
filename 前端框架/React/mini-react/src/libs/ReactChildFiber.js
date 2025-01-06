import FiberNode, {
  FunctionComponent,
  HostComponent,
  HostText,
} from './FiberNode'
import { ChildDeletion, Placement } from './ReactFiberFlags'
import { createWorkInProgress } from './ReactFiberReconciler'

function coerceRef(fiber, element) {
  const ref = element.props.ref
  fiber.ref = ref || null
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
    coerceRef(fiber, element)
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
      coerceRef(fiber, newChild)
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
          coerceRef(nextFiber, newChild[newIdx])
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

export const mountChildFibers = createChildReconciler(false)
export const reconcileChildFibers = createChildReconciler(true)
