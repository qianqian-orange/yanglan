import { SWRGlobalState } from './global-state'

export const createCacheHelper = (cache, key) => {
  const [, , , , setter, subscribe] = SWRGlobalState.get(cache)
  // getter
  const getCache = () => {
    if (!cache.has(key)) {
      cache.set(key, {
        data: undefined,
        error: undefined,
        isValidating: true,
        isLoading: true,
      })
    }
    return cache.get(key)
  }

  // setter
  const setCache = data => {
    const prev = getCache()
    setter(key, { ...prev, ...data }, prev)
  }

  return [getCache, setCache, subscribe]
}
