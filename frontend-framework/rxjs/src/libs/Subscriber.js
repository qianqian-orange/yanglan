import { isFunction } from './utils'

export function Subscriber(observerOrNext, error, complete) {
  // 是否终止执行next、error、complete事件
  this.isStopped = false
  this.closed = false
  this._finalizers = []

  if (isFunction(observerOrNext)) {
    this.partialObserver = {
      next: observerOrNext,
      error,
      complete,
    }
  } else {
    this.partialObserver = observerOrNext
  }
}

Subscriber.prototype.next = function (value) {
  if (this.isStopped) return
  if (this.partialObserver.next) this.partialObserver.next(value)
}

Subscriber.prototype.error = function (err) {
  if (this.isStopped) return
  if (this.partialObserver.error) this.partialObserver.error(err)
}

Subscriber.prototype.complete = function () {
  if (this.isStopped) return
  this.isStopped = true
  if (this.partialObserver.complete) this.partialObserver.complete()
}

Subscriber.prototype.add = function (finalizer) {
  if (finalizer) {
    if (this.closed) {
      finalizer()
    } else {
      this._finalizers.push(finalizer)
    }
  }
}

Subscriber.prototype.unsubscribe = function () {
  if (this.closed) return
  this.closed = true
  this.isStopped = true
  this._finalizers.forEach(cb => cb())
}
