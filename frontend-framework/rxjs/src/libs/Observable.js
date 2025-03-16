import { Subscriber } from './Subscriber'

export function Observable(subscribe) {
  if (subscribe) this._subscribe = subscribe
}

Observable.prototype.subscribe = function (observerOrNext, error, complete) {
  const subscriber = new Subscriber(observerOrNext, error, complete)
  const operator = this.operator
  const source = this.source
  subscriber.add(
    operator
      ? operator.call(subscriber, source)
      : this._trySubscribe(subscriber),
  )
  return subscriber
}

Observable.prototype._trySubscribe = function (subscriber) {
  try {
    return this._subscribe(subscriber)
  } catch (err) {
    subscriber.error(err)
  }
}

Observable.prototype.lift = function (operator) {
  const observable = new Observable()
  observable.source = this
  observable.operator = operator
  return observable
}

Observable.prototype.pipe = function (...operations) {
  return (function piped(input) {
    return operations.reduce((prev, operation) => operation(prev), input)
  })(this)
}
