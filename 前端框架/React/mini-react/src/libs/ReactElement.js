import { REACT_ELEMENT_TYPE } from './ReactSymbol'

/**
 * @param {*} type 组件方法或元素标签类型，例如function App() {}或h1
 * @param {*} key 组件方法或元素标签的标识符，例如<App key='app' />的key属性值
 * @param {*} props 入参属性，例如<h1 onClick={() => {}} />的onClick属性
 */
function ReactElement(type, key, props) {
  this.$$typeof = REACT_ELEMENT_TYPE
  this.type = type
  this.key = key
  this.props = props
}

/**
 * @param {*} type 组件方法或元素标签类型，例如function App() {}或h1
 * @param {*} config ReactElement的key和props
 * @param {*} childrens child ReactElement对象数组
 */
function createElement(type, config, ...childrens) {
  const { key = null, ...props } = config || {}
  if (childrens.length) {
    props.children = childrens.length > 1 ? childrens : childrens[0]
  }
  return new ReactElement(type, key, props)
}

export { createElement }
