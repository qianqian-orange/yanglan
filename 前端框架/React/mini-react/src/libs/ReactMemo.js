import { REACT_MEMO_TYPE } from './ReactSymbol'

export function memo(Component, compare = null) {
  const elementType = {
    $$typeof: REACT_MEMO_TYPE,
    type: Component,
    compare,
  }
  return elementType
}
