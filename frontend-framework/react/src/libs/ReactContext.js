import { REACT_CONTEXT_TYPE } from './shared/ReactSymbol'

export function createContext(defaultValue) {
  const context = {
    $$typeof: REACT_CONTEXT_TYPE,
    _currentValue: defaultValue,
  }
  context.Provider = context

  return context
}
