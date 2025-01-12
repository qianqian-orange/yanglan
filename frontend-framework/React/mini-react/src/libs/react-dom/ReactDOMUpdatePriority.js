import ReactDOMSharedInternals from '../shared/ReactDOMSharedInternals'

export function setCurrentUpdatePriority(newPriority) {
  ReactDOMSharedInternals.p = newPriority
}

export function getCurrentUpdatePriority() {
  return ReactDOMSharedInternals.p
}
