import { useEffect, useSyncExternalStore } from 'react'
import { defaultConfig } from './utils/config'
import { SWRGlobalState } from './utils/global-state'
import { serialize } from './utils/serialize'
import { getTimestamp } from './utils/timestamp'
import { internalMutate } from './utils/mutate'
import { createCacheHelper } from './utils/helper'

/**
 * @param {*} _key 任意数据类型，会作为fetcher的入参
 * @param {*} fetcher 自定义请求方法
 * @param {*} config swr配置
 */
function useSWR(_key, fetcher, config) {
  const { cache } = config
  const [EVENT_REVALIDATORS, , FETCH] = SWRGlobalState.get(cache)
  // _key是任意数据类型，会转成成对应的字符串类型标识
  const [key, fnArg] = serialize(_key)

  // 只需关注data、error、isValidating、isLoading这四个字段的变化
  const isEqual = (current, prev) => {
    const keys = ['data', 'error', 'isValidating', 'isLoading']
    for (const key of keys) {
      if (!Object.is(current[key], prev[key])) return false
    }
    return true
  }

  const [getCache, setCache, subscribeCache] = createCacheHelper(cache, key)

  const cached = useSyncExternalStore(
    callback =>
      subscribeCache(key, (current, prev) => {
        if (!isEqual(current, prev)) callback()
      }),
    getCache,
  )

  const revalidate = async () => {
    if (!key) return
    // 请求返回数据
    let newData
    // 请求标识
    let timestamp
    const cleanup = () => {
      if (FETCH[key] && FETCH[key][1] === timestamp) delete FETCH[key]
    }
    const shouldStartNewRequest = !FETCH[key]
    try {
      if (shouldStartNewRequest) {
        setCache({ isValidating: true, isLoading: !cached.data })
        FETCH[key] = [fetcher(fnArg), getTimestamp()]
      }
      ;[newData, timestamp] = FETCH[key]
      newData = await newData
      if (shouldStartNewRequest) setTimeout(cleanup, config.dedupingInterval)
      // 只要FETCH不存在对应请求实例或者请求标识变了，说明该请求属于过期请求，不需要处理其返回数据
      if (!FETCH[key] || FETCH[key][1] !== timestamp) {
        return
      }
      setCache({
        data: newData,
        error: undefined,
        isValidating: false,
        isLoading: false,
      })
    } catch (error) {
      cleanup()
      setCache({ error, isValidating: false, isLoading: false })
    }
  }

  useEffect(() => {
    if (!EVENT_REVALIDATORS[key]) EVENT_REVALIDATORS[key] = []
    const revalidators = EVENT_REVALIDATORS[key]
    revalidators.push(revalidate)

    revalidate()

    return () => {
      const index = revalidators.indexOf(revalidate)
      if (index >= 0) {
        // O(1): faster than splice
        revalidators[index] = revalidators[revalidators.length - 1]
        revalidators.pop()
      }
    }
  }, [key])

  return { ...cached, mutate: internalMutate.bind(cache, key) }
}

export default (key, fetcher, config) =>
  useSWR(key, fetcher, { ...defaultConfig, ...config })
