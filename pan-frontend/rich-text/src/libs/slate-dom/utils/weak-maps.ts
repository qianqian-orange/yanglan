import { SlateNode } from '@/libs/slate/interfaces/node'

// dom节点与slateNode节点映射关系
export const ELEMENT_TO_NODE: WeakMap<Node, SlateNode> = new WeakMap()
