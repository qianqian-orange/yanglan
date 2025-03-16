import { operate } from '../utils'

export function map(cb, thisArg) {
  return operate(function (source, subscriber) {
    source.subscribe(function (value) {
      subscriber.next(cb.call(thisArg, value))
    })
  })
}
