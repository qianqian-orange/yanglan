export * from './react-dom/client/ReactDOMRoot'
export * from './react-dom/server/ReactDOMLegacyServerNode'
export * from './ReactHook'
export * from './ReactMemo'
export * from './ReactContext'
export { REACT_SUSPENSE_TYPE as Suspense } from './shared/ReactSymbol'
import { createElement } from './ReactElement'

export default {
  createElement,
}
