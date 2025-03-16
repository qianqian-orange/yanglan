import { Observable } from '../Observable'
import { isFunction } from '../utils'

function isEventTarget(target) {
  return (
    isFunction(target.addEventListener) &&
    isFunction(target.removeEventListener)
  )
}

function isNodeStyleEventEmitter(target) {
  return isFunction(target.addListener) && isFunction(target.removeListener)
}

const eventTargetMethods = ['addEventListener', 'removeEventListener']
const nodeEventEmitterMethods = ['addListener', 'removeListener']

export function fromEvent(target, eventName, options) {
  const listeners = (
    isEventTarget(target)
      ? eventTargetMethods
      : isNodeStyleEventEmitter(target)
        ? nodeEventEmitterMethods
        : []
  ).map(
    method =>
      function (handler) {
        target[method](eventName, handler, options)
      },
  )
  if (!listeners.length) throw new TypeError('Invalid event target')
  const addEventListener = listeners[0]
  const removeEventListener = listeners[1]
  return new Observable(subscriber => {
    const handler = function (...args) {
      return subscriber.next(...args)
    }
    addEventListener(handler)
    return () => removeEventListener(handler)
  })
}
