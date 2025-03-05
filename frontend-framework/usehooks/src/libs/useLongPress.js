import React from 'react'

function isTouchEvent({ nativeEvent }) {
  return window.TouchEvent
    ? nativeEvent instanceof TouchEvent
    : 'touches' in nativeEvent
}

function isMouseEvent(event) {
  return event.nativeEvent instanceof MouseEvent
}

export function useLongPress(callback, options = {}) {
  const { threshold = 400, onStart, onFinish, onCancel } = options
  const isLongPressActive = React.useRef(false)
  const isPressed = React.useRef(false)
  const timerId = React.useRef()

  return React.useMemo(() => {
    if (typeof callback !== 'function') return

    const start = event => {
      if (!isMouseEvent(event) && !isTouchEvent(event)) return
      if (onStart) onStart(event)
      isPressed.current = true
      timerId.current = setTimeout(() => {
        callback(event)
        isLongPressActive.current = true
      }, threshold)
    }

    const cancel = event => {
      if (!isMouseEvent(event) && !isTouchEvent(event)) return
      if (isLongPressActive.current) {
        onFinish?.(event)
      } else if (isPressed.current) {
        onCancel?.(event)
      }
      isLongPressActive.current = false
      isPressed.current = false
      if (timerId.current) clearTimeout(timerId.current)
    }

    const mouseHandlers = {
      onMouseDown: start,
      onMouseUp: cancel,
      onMouseLeave: cancel,
    }

    const touchHandlers = {
      onTouchStart: start,
      onTouchEnd: cancel,
    }

    return {
      ...mouseHandlers,
      ...touchHandlers,
    }
  }, [callback, threshold, onStart, onFinish, onCancel])
}
