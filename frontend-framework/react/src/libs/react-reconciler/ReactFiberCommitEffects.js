// 调用effect create方法，获取destroy
export function commitHookEffectListMount(finishedWork, hookFlags) {
  const queue = finishedWork.updateQueue
  queue.forEach(effect => {
    if ((effect.tag & hookFlags) === hookFlags) {
      effect.destroy = effect.create()
    }
  })
}

// 调用effect destroy方法
export function commitHookEffectListUnmount(finishedWork, hookFlags) {
  const queue = finishedWork.updateQueue
  if (queue !== null) {
    queue.forEach(effect => {
      if ((effect.tag & hookFlags) === hookFlags && effect.destroy) {
        const destroy = effect.destroy
        effect.destroy = null
        destroy()
      }
    })
  }
}

// 解绑ref
export function safelyDetachRef(finishedWork) {
  if (finishedWork !== null && finishedWork.ref !== null)
    finishedWork.ref.current = null
}

// 绑定ref
export function safelyAttachRef(finishedWork) {
  const { ref, stateNode } = finishedWork
  if (ref !== null) ref.current = stateNode
}
