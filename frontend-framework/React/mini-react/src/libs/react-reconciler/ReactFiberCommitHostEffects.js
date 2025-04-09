import {
  hideInstance,
  hideTextInstance,
  unhideInstance,
  unhideTextInstance,
} from '../react-dom-bindings/client/ReactFiberConfigDOM'
import { appendAllChildren } from './ReactFiberCompleteWork'
import {
  Fragment,
  FunctionComponent,
  HostComponent,
  HostRoot,
} from './ReactWorkTags'

export function commitHostPlacement(finishedWork) {
  let parentFiber = finishedWork.return
  while (parentFiber !== null) {
    if (parentFiber.tag === HostComponent || parentFiber.tag === HostRoot) break
    parentFiber = parentFiber.return
  }
  let parentNode =
    parentFiber.tag === HostComponent
      ? parentFiber.stateNode
      : parentFiber.stateNode.containerInfo
  if (finishedWork.tag === FunctionComponent || finishedWork.tag === Fragment) {
    appendAllChildren(parentNode, finishedWork)
  } else {
    parentNode.appendChild(finishedWork.stateNode)
  }
}

export function commitShowHideHostInstance(node, isHidden) {
  const instance = node.stateNode
  if (isHidden) hideInstance(instance)
  else unhideInstance(instance)
}

export function commitShowHideHostTextInstance(node, isHidden) {
  const instance = node.stateNode
  if (isHidden) hideTextInstance(instance)
  else unhideTextInstance(instance, node.pendingProps)
}
