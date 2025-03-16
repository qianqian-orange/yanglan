export function isFunction(value) {
  return typeof value === 'function'
}

export function operate(init) {
  return function (source) {
    return source.lift(function (liftedSource) {
      try {
        return init(liftedSource, this)
      } catch (err) {
        this.error(err)
      }
    })
  }
}
