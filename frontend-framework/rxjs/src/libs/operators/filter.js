import { operate } from '../utils'

export function filter(cb, thisArg) {
  return operate(function (source, subscriber) {
    source.subscribe(function (value) {
      if (cb.call(thisArg, value)) subscriber.next(value)
    })
  })
}
