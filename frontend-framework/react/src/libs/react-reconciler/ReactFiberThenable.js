// 记录pending状态的promise
export let suspendedThenable = null

// 当promise处于pending状态时会抛这个异常
export const SuspenseException = new Error(
  // eslint-disable-next-line quotes
  "Suspense Exception: This is not a real error! It's an implementation " +
    'detail of `use` to interrupt the current render. You must either ' +
    'rethrow it immediately, or move the `use` call outside of the ' +
    '`try/catch` block. Capturing without rethrowing will lead to ' +
    'unexpected behavior.\n\n' +
    'To handle async errors, wrap your component in an error boundary, or ' +
    // eslint-disable-next-line quotes
    "call the promise's `.catch` method and pass the result to `use`.",
)

function noop() {}

export function getSuspendedThenable() {
  const thenable = suspendedThenable
  suspendedThenable = null
  return thenable
}

// thenables属性记录promise实例
export function createThenableState() {
  return { thenables: [] }
}

export function trackUsedThenable(thenable) {
  switch (thenable.status) {
    case 'fulfilled':
      return thenable.value
    case 'rejected':
      throw thenable.reason
    default:
      if (typeof thenable.status === 'string') thenable.then(noop, noop)
      else {
        thenable.status = 'pending'
        thenable.then(
          fulfilledValue => {
            if (thenable.status === 'pending') {
              thenable.status = 'fulfilled'
              thenable.value = fulfilledValue
            }
          },
          error => {
            if (thenable.status === 'pending') {
              thenable.status = 'rejected'
              thenable.reason = error
            }
          },
        )
      }
      switch (thenable.status) {
        case 'fulfilled':
          return thenable.value
        case 'rejected':
          throw thenable.reason
      }
      // 记录promise实例
      suspendedThenable = thenable
      // 当promise处于pending状态时抛异常
      throw SuspenseException
  }
}

export function isThenableResolved(thenable) {
  const status = thenable.status
  return status === 'fulfilled' || status === 'rejected'
}
