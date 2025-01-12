import { currentlyRenderingFiber } from './ReactFiberHooks'
import { mountLayoutEffect, updateLayoutEffect } from './useEffect'

function imperativeHandleEffect(ref, create) {
  ref.current = create()

  return () => {
    ref.current = null
  }
}

function mountImperativeHandle(ref, create, deps) {
  mountLayoutEffect(imperativeHandleEffect.bind(null, ref, create), deps)
}

function updateImperativeHandle(ref, create, deps) {
  updateLayoutEffect(imperativeHandleEffect.bind(null, ref, create), deps)
}

export function useImperativeHandle(ref, create, deps = null) {
  const current = currentlyRenderingFiber.alternate
  if (current === null) {
    mountImperativeHandle(ref, create, deps)
  } else {
    updateImperativeHandle(ref, create, deps)
  }
}
