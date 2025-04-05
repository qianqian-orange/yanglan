const randomKey = Math.random().toString(36).slice(2)
const internalInstanceKey = '__reactFiber$' + randomKey
const internalPropsKey = '__reactProps$' + randomKey

// 记录FiberNode
export function precacheFiberNode(hostInst, node) {
  node[internalInstanceKey] = hostInst
}

// 记录FiberNode props
export function updateFiberProps(node, props) {
  node[internalPropsKey] = props
}

export function getInstanceFromNode(node) {
  return node[internalInstanceKey] || null
}

export function getFiberCurrentPropsFromNode(node) {
  return node[internalPropsKey] || null
}
