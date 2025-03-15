function eventProxy(event) {
  const eventHandler = this._listeners[event.type]
  eventHandler?.(event)
}

export function setProperty(dom, name, newValue, oldValue) {
  // 处理style
  if (name === 'style') {
    if (oldValue) {
      for (const key in oldValue) {
        dom.style[key] = ''
      }
    }
    if (newValue) {
      for (const key in newValue) {
        dom.style[key] = newValue[key]
      }
    }
  }
  // 处理事件
  else if (name.startsWith('on')) {
    name = name.toLowerCase().slice(2)
    if (!dom._listeners) dom._listeners = {}
    dom._listeners[name] = newValue
    if (newValue) {
      if (!oldValue) {
        dom.addEventListener(name, eventProxy)
      }
    } else {
      dom.removeEventListener(name, eventProxy)
    }
  }
  // 处理attrs
  else {
    if (newValue) {
      dom.setAttribute(name, newValue)
    } else {
      dom.removeAttribute(name)
    }
  }
}
