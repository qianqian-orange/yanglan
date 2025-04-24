import { trackUsedThenable } from './ReactFizzThenable'

function noop() {}

function basicStateReducer(state, action) {
  return typeof action === 'function' ? action(state) : action
}

function useState(initialState) {
  return useReducer(basicStateReducer, initialState)
}

function useReducer(reducer, initialState) {
  // 如果传入的初始值是functIon，则调用执行获取返回值作为初始state值
  if (typeof initialState === 'function') initialState = initialState()
  return [initialState, noop]
}

function use(usable) {
  return trackUsedThenable(usable)
}

export const HooksDispatcher = {
  use,
  useState,
  useReducer,
  useEffect: noop,
  useLayoutEffect: noop,
}
