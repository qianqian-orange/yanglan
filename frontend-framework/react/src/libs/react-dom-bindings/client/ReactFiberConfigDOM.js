import { updateProperties } from './ReactDOMComponent'
import { precacheFiberNode, updateFiberProps } from './ReactDOMComponentTree'

const SUSPENSE_START_DATA = '$'
const SUSPENSE_END_DATA = '/$'
const SUSPENSE_PENDING_START_DATA = '$?'
const SUSPENSE_FALLBACK_START_DATA = '$!'

const DOCUMENT_READY_STATE_COMPLETE = 'complete'

// 获取可hydrate dom节点
function getNextHydratable(node) {
  for (; node !== null; node = node.nextSibling) {
    const nodeType = node.nodeType
    if (nodeType === Node.ELEMENT_NODE || nodeType === Node.TEXT_NODE) break
    if (nodeType === Node.COMMENT_NODE) {
      const nodeData = node.data
      if (
        nodeData === SUSPENSE_START_DATA ||
        nodeData === SUSPENSE_FALLBACK_START_DATA ||
        nodeData === SUSPENSE_PENDING_START_DATA
      )
        break
      if (nodeData === SUSPENSE_END_DATA) return null
    }
  }
  return node
}

// 获取当前hydrate dom节点第一个child节点
export function getFirstHydratableChild(instance) {
  return getNextHydratable(instance.firstChild)
}

// 获取当前hydrate dom节点兄弟节点
export function getNextHydratableSibling(instance) {
  return getNextHydratable(instance.nextSibling)
}

// 获取SuspenseComponent类型FiberNode hydrate 子dom节点
export function getFirstHydratableChildWithinSuspenseInstance(parentInstance) {
  return getNextHydratable(parentInstance.nextSibling)
}

// 获取SuspenseComponent类型FiberNode hydrate 兄弟dom节点
export function getNextHydratableInstanceAfterSuspenseInstance(
  suspenseInstance,
) {
  let node = suspenseInstance.nextSibling
  let depth = 0
  while (node) {
    if (node.nodeType === Node.COMMENT_NODE) {
      const data = node.data
      if (data === SUSPENSE_END_DATA) {
        if (depth === 0) {
          return getNextHydratableSibling(node)
        } else depth--
      } else if (
        data === SUSPENSE_START_DATA ||
        data === SUSPENSE_FALLBACK_START_DATA ||
        data === SUSPENSE_PENDING_START_DATA
      ) {
        depth++
      }
    }
    node = node.nextSibling
  }
}

// 获取SuspenseComponent类型FiberNode hydrate dom节点
export function canHydrateSuspenseInstance(instance) {
  while (instance.nodeType !== Node.COMMENT_NODE) {
    const nextInstance = getNextHydratableSibling(instance)
    if (nextInstance === null) return null
    instance = nextInstance
  }
  return instance
}

export function isSuspenseInstancePending(instance) {
  return instance.data === SUSPENSE_PENDING_START_DATA
}

// 判断SuspenseComponent类型FiberNode的children是否为fallback
export function isSuspenseInstanceFallback(instance) {
  return (
    instance.data === SUSPENSE_FALLBACK_START_DATA ||
    (instance.data === SUSPENSE_PENDING_START_DATA &&
      instance.ownerDocument.readyState === DOCUMENT_READY_STATE_COMPLETE)
  )
}

// 将FiberNode和props属性赋值给dom节点
export function hydrateInstance(instance, props, internalInstanceHandle) {
  precacheFiberNode(instance, internalInstanceHandle)
  updateFiberProps(instance, props)
}

// 将props属性赋值给dom节点
export function hydrateTextInstance(instance, internalInstanceHandle) {
  precacheFiberNode(instance, internalInstanceHandle)
}

// 将FiberNode赋值给dom节点
export function hydrateSuspenseInstance(instance, internalInstanceHandle) {
  precacheFiberNode(instance, internalInstanceHandle)
}

export function createInstance(type, props, internalInstanceHandle) {
  const instance = document.createElement(type)
  precacheFiberNode(instance, internalInstanceHandle)
  updateFiberProps(instance, props)
  return instance
}

export function createTextInstance(text, internalInstanceHandle) {
  const instance = document.createTextNode(text)
  precacheFiberNode(instance, internalInstanceHandle)
  return instance
}

export function commitUpdate(domElement, oldProps, newProps) {
  updateProperties(domElement, newProps, oldProps)
  updateFiberProps(domElement, newProps)
}

export function hideInstance(instance) {
  instance.style.display = 'none'
}

export function unhideInstance(instance) {
  instance.style.display = ''
}

export function hideTextInstance(textInstance) {
  textInstance.nodeValue = ''
}

export function unhideTextInstance(textInstance, text) {
  textInstance.nodeValue = text
}
