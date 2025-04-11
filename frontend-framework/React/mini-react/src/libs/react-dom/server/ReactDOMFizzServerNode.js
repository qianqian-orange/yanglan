import {
  createRenderState,
  createResumableState,
} from '../../react-dom-bindings/server/ReactFizzConfigDOM'
import {
  createRequest,
  performWork,
  startFlowing,
} from '../../react-server/ReactFizzServer'

function renderToPipeableStream(children, options) {
  const { bootstrapScripts, onShellReady } = options
  const resumableState = createResumableState(bootstrapScripts)
  const renderState = createRenderState(resumableState)
  const request = createRequest(
    children,
    resumableState,
    renderState,
    onShellReady,
  )
  queueMicrotask(() => performWork(request))

  return {
    pipe(destination) {
      startFlowing(request, destination)
      // 当缓冲区空闲状态且还有数据块要返回时会触发该事件
      destination.on('drain', () => startFlowing(request, destination))
    },
  }
}

export { renderToPipeableStream }
