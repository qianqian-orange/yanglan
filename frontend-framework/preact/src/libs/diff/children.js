export function insert(newVNode, oldDom, parentDom) {
  if (newVNode._dom !== oldDom) {
    parentDom.insertBefore(newVNode._dom, oldDom || null)
    oldDom = newVNode._dom
  }
  do {
    oldDom = oldDom && oldDom.nextSibling
  } while (oldDom && oldDom.nodeType === Node.COMMENT_NODE)
  return oldDom
}
