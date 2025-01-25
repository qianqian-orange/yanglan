/**
 * @returns `true` if `otherNode` is before `node` in the document; otherwise, `false`.
 */
export const isBefore = (node: Node, otherNode: Node) =>
  node.compareDocumentPosition(otherNode) & Node.DOCUMENT_POSITION_PRECEDING

/**
 * @returns `true` if `otherNode` is after `node` in the document; otherwise, `false`.
 */
export const isAfter = (node: Node, otherNode: Node) =>
  node.compareDocumentPosition(otherNode) & Node.DOCUMENT_POSITION_FOLLOWING
