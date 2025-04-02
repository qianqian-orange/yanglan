import {
  startWork,
  startFlowing,
} from '../../../libs/react-server/ReactFizzServer'

function renderToString(children) {
  const task = {
    node: children, // 当前vnode
    blockedSegment: {
      chunks: [], // html片段
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
