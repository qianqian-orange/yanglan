import { updateProperties } from './ReactDOMComponent'
import { precacheFiberNode, updateFiberProps } from './ReactDOMComponentTree'

function getNextHydratable(node) {
  for (; node !== null; node = node.nextSibling) {
    const nodeType = node.nodeType
    if (nodeType === Node.ELEMENT_NODE || nodeType === Node.TEXT_NODE) {
      break
    }
  }
  return node
}

export function getFirstHydratableChild(instance) {
  return getNextHydratable(instance.firstChild)
}

export function getNextHydratableSibling(instance) {
  return getNextHydratable(instance.nextSibling)
}

export function hydrateInstance(instance, props, internalInstanceHandle) {
  precacheFiberNode(instance, internalInstanceHandle)
  updateFiberProps(instance, props)
}

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
