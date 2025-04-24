import ReactSharedInternals from './shared/ReactSharedInternals'

function resolveDispatcher() {
  const dispatcher = ReactSharedInternals.H
  return dispatcher
}

export function useState(initialState) {
  const dispatcher = resolveDispatcher()
  return dispatcher.useState(initialState)
}

export function useReducer(reducer, initialState) {
  const dispatcher = resolveDispatcher()
  return dispatcher.useReducer(reducer, initialState)
}

export function useEffect(create, deps = null) {
  const dispatcher = resolveDispatcher()
  return dispatcher.useEffect(create, deps)
}

export function useLayoutEffect(create, deps = null) {
  const dispatcher = resolveDispatcher()
  return dispatcher.useLayoutEffect(create, deps)
}

export function useRef(initialValue = null) {
  const dispatcher = resolveDispatcher()
  return dispatcher.useRef(initialValue)
}

export function useImperativeHandle(ref, create, deps = null) {
  const dispatcher = resolveDispatcher()
  return dispatcher.useImperativeHandle(ref, create, deps)
}

export function useMemo(nextCreate, deps = null) {
  const dispatcher = resolveDispatcher()
  return dispatcher.useMemo(nextCreate, deps)
}

export function useCallback(callback, deps = null) {
  const dispatcher = resolveDispatcher()
  return dispatcher.useCallback(callback, deps)
}

export function useContext(context) {
  const dispatcher = resolveDispatcher()
  return dispatcher.useContext(context)
}

export function useDeferredValue(value, initialValue) {
  const dispatcher = resolveDispatcher()
  return dispatcher.useDeferredValue(value, initialValue)
}

export function useSyncExternalStore(subscribe, getSnapshot) {
  const dispatcher = resolveDispatcher()
  return dispatcher.useSyncExternalStore(subscribe, getSnapshot)
}

export function use(usable) {
  const dispatcher = resolveDispatcher()
  return dispatcher.use(usable)
}
