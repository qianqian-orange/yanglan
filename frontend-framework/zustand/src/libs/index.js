import { useSyncExternalStore } from 'react'

function create(createState) {
  // state状态
  let state
  // 收集更新渲染方法
  const listeners = new Set()
  // 修改state
  const setState = partial => {
    const nextState = typeof partial === 'function' ? partial(state) : partial
    if (!Object.is(nextState, state)) {
      state =
        typeof nextState !== 'object' || nextState === null
          ? nextState
          : Object.assign({}, state, nextState)
      listeners.forEach(listener => listener())
    }
  }

  // 获取state
  const getState = () => state

  // useSyncExternalStore方法第一个入参
  const subscribe = callback => {
    listeners.add(callback)
    return () => listeners.delete(callback)
  }

  const api = { getState, setState, subscribe }

  const useStore = (api, selector) => {
    const slice = useSyncExternalStore(api.subscribe, () =>
      selector(api.getState()),
    )
    return slice
  }

  // 获取初始state
  state = createState(setState, getState, api)
  const useBoundStore = selector => useStore(api, selector)
  return useBoundStore
}

export { create }
