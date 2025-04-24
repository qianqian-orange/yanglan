import {
  startWork,
  startFlowing,
} from '../../react-server/ReactLegacyFizzServer'

function renderToString(children) {
  const task = {
    node: children, // 当前vnode
    blockedSegment: {
      chunks: [], // html片段
      lastPushedText: false, // 上一个dom节点是否是纯文本
    },
  }
  // 递归遍历vnode，收集html片段
  startWork(task)
  let result = ''
  // 拼接html片段
  startFlowing(task, {
    push(chunk) {
      if (chunk) result += chunk
    },
  })
  return result
}

export { renderToString }
