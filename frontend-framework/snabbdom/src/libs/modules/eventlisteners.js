function invokeHandler(handler, vnode, event) {
  if (typeof handler === 'function') {
    handler.call(vnode, event)
  } else if (typeof handler === 'object') {
    for (let i = 0; i < handler.length; i++) {
      invokeHandler(handler[i], vnode, event)
    }
  }
}

function handleEvent(event, vnode) {
  const name = event.type
  const on = vnode.data?.on
  if (on && on[name]) {
    invokeHandler(on[name], vnode, event)
  }
}

function createListener() {
  return function handler(event) {
    handleEvent(event, handler.vnode)
  }
}

function updateEventListeners(oldVnode, newVnode) {
  const oldOn = oldVnode.data?.on
  const oldListener = oldVnode.listener
  const oldElm = oldVnode.elm
  const on = newVnode?.data?.on
  const elm = newVnode?.elm
  if (oldOn === on) return
  if (oldOn && oldListener) {
    if (!on) {
      for (const name in oldOn) {
        oldElm.removeEventListener(name, oldListener, false)
      }
    } else {
      for (const name in oldOn) {
        if (!on[name]) {
          oldElm.removeEventListener(name, oldListener, false)
        }
      }
    }
  }
  if (on) {
    const listener = (newVnode.listener = oldListener || createListener())
    listener.vnode = newVnode
    if (!oldOn) {
      for (const name in on) {
        elm.addEventListener(name, listener, false)
      }
    } else {
      for (const name in on) {
        if (!oldOn[name]) {
          elm.addEventListener(name, listener, false)
        }
      }
    }
  }
}

export const eventListenersModule = {
  create: updateEventListeners,
  update: updateEventListeners,
  destroy: updateEventListeners,
}
