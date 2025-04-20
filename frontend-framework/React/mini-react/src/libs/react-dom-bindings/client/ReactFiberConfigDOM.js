import { updateProperties } from './ReactDOMComponent'
import { precacheFiberNode, updateFiberProps } from './ReactDOMComponentTree'

function getNextHydratable(node) {
  for (; node !== null; node = node.nextSibling) {
    const nodeType = node.nodeType
    if (nodeType === Node.ELEMENT_NODE || nodeType === Node.TEXT_NODE) break
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

// 将FiberNode和props属性赋值给dom节点
export function hydrateInstance(instance, props, internalInstanceHandle) {
  precacheFiberNode(instance, internalInstanceHandle)
  updateFiberProps(instance, props)
}

// 将props属性赋值给dom节点
export function hydrateTextInstance(instance, internalInstanceHandle) {
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
