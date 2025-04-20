import { getFiberCurrentPropsFromNode } from '../client/ReactDOMComponentTree'

export function listenToAllSupportedEvents(rootContainerElement) {
  rootContainerElement.addEventListener('click', event => {
    const props = getFiberCurrentPropsFromNode(event.target)
    props?.onClick?.()
  })
}
