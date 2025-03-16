import { Subscriber } from './Subscriber'

export function Observable(subscribe) {
  if (subscribe) this._subscribe = subscribe
}

Observable.prototype.subscribe = function (observerOrNext, error, complete) {
  const subscriber = new Subscriber(observerOrNext, error, complete)
  subscriber.add(this._trySubscribe(subscriber))
  return subscriber
}

Observable.prototype._trySubscribe = function (subscriber) {
  try {
    return this._subscribe(subscriber)
  } catch (err) {
    subscriber.error(err)
  }
}
