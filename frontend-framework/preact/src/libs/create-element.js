export function createVNode(type, props, key) {
  const vnode = {
    type, // 元素标签或函数组件
    props, // 属性
    key, // 唯一标识
    _children: null, // 子VNnode
    _parent: null, // 父VNode节点
    _parentDom: null, // 父DOM节点
    _dom: null, // DOM节点
    _flags: 0, // 副作用
    _index: -1, // 虚拟DOM树中位置索引
    _hooks: [], // 存储Hook对象
  }
  return vnode
}

export function createElement(type, props, children) {
  props ??= {}
  const key = props.key
  if (children) {
    props.children = Array.isArray(children)
      ? children
      : Array.prototype.slice.call(arguments, 2)
  }
  return createVNode(type, props, key)
}

export function Fragment(props) {
  return props.children
}
