const DRAFT_STATE = Symbol.for('immer-state')

function latest(state) {
  return state.copy_ || state.base_
}

// 浅拷贝
function shallowCopy(base) {
  if (Array.isArray(base)) return [...base]
  if (base !== null && typeof base === 'object') return { ...base }
}

function isDraftable(value) {
  return value !== null && typeof value === 'object'
}

function isDraft(value) {
  return !!value && !!value[DRAFT_STATE]
}

function each(obj, iter) {
  if (Array.isArray(obj)) {
    obj.forEach((entry, index) => iter(index, entry, obj))
  } else {
    Reflect.ownKeys(obj).forEach(key => iter(key, obj[key], obj))
  }
}

// 创建state副本
function prepareCopy(state) {
  if (!state.copy_) {
    state.copy_ = shallowCopy(state.base_)
  }
}

const traps = {
  get(state, prop) {
    if (prop === DRAFT_STATE) return state
    const source = latest(state)
    const value = source[prop]
    // 如果非对象或者数组类型，直接返回value
    if (!isDraftable(value)) return value
    const current = state.base_[prop]
    if (current === value) {
      prepareCopy(state)
      return (state.copy_[prop] = createProxy(value))
    }
    return value
  },
  set(state, prop, value) {
    if (!state.modified_) {
      state.modified_ = true
      prepareCopy(state)
    }
    const source = latest(state)
    const current = source[prop]
    if (Object.is(current, value)) return true
    state.copy_[prop] = value
    return true
  },
}

function createProxy(base) {
  let state = {
    base_: base, // 原始state
    copy_: null, // state副本
    draft_: null, // state proxy
    revoke_: null,
    modified_: false, // 记录当前state会否有修改过
  }
  const { proxy, revoke } = Proxy.revocable(state, traps)
  state.draft_ = proxy
  state.revoke_ = revoke
  return proxy
}

function finalize(draft) {
  const state = draft[DRAFT_STATE]
  if (!state.modified_) {
    state.revoke_()
    return state.base_
  }
  const result = state.copy_
  each(result, (key, value) => {
    if (isDraft(value)) result[key] = finalize(value)
  })
  state.revoke_()
  return result
}

export function produce(base, recipe) {
  const draft = createProxy(base)
  recipe(draft)
  return finalize(draft)
}
