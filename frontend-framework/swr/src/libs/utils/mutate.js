import { SWRGlobalState } from './global-state'
import { createCacheHelper } from './helper'

export const internalMutate = (cache, key, data) => {
  const [EVENT_REVALIDATORS, , FETCH] = SWRGlobalState.get(cache)
  const [getCache, setCache] = createCacheHelper(cache, key)

  const startRevalidate = () => {
    const revalidators = EVENT_REVALIDATORS[key]
    // 将请求实例缓存清空掉确保能够重新发起请求
    delete FETCH[key]
    revalidators[0]().then(() => getCache().data)
  }

  // 如果data为undefined，则直接重新校验请求
  if (data === undefined) {
    return startRevalidate()
  }

  setCache({ data })
  startRevalidate()
  return data
}
