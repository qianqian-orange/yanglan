import {
  stringToPrecomputedChunk,
  writeChunk,
} from '../../react-server/ReactServerStreamConfigNode'

export const doctypeChunk = stringToPrecomputedChunk('<!DOCTYPE html>')
// const styleAttributeStart = stringToPrecomputedChunk(' style="')
// const styleAssign = stringToPrecomputedChunk(':')
// const styleSeparator = stringToPrecomputedChunk(';')
// const attributeSeparator = stringToPrecomputedChunk(' ')
// const attributeAssign = stringToPrecomputedChunk('="')
// const attributeEnd = stringToPrecomputedChunk('"')
// const endOfStartTag = stringToPrecomputedChunk('>')
// const endOfStartTagSelfClosing = stringToPrecomputedChunk('/>')

const uppercasePattern = /([A-Z])/g

function pushStyleAttribute(target, style) {
  const ans = []
  for (const styleName in style) {
    const styleValue = style[styleName]
    ans.push(
      `${styleName
        .replace(uppercasePattern, '-$1')
        .toLowerCase()}:${styleValue}`,
    )
  }
  target.push(` style="${ans.join(';')}"`)
}

function pushAttribute(target, name, value) {
  switch (name) {
    case 'className':
      target.push(` class="${value}"`)
      break
    case 'style':
      pushStyleAttribute(target, value)
      break
    default:
      if (!name.startsWith('on')) target.push(` ${name}="${value}"`)
  }
}

export function pushStartGenericElement(target, props, tag) {
  target.push(stringToPrecomputedChunk(`<${tag}`))
  let children = null
  for (const propKey in props) {
    switch (propKey) {
      case 'children':
        children = props[propKey]
        break
      default:
        pushAttribute(target, propKey, props[propKey])
    }
  }
  target.push(stringToPrecomputedChunk('>'))
  if (typeof children === 'string') {
    target.push(children)
    return null
  }
  return children
}

export function pushStartInstance(target, type, props, renderState) {
  const { preamble, hoistableChunks } = renderState
  switch (type) {
    case 'html': {
      preamble.htmlChunks = [doctypeChunk]
      return pushStartGenericElement(preamble.htmlChunks, props, 'html')
    }
    case 'head':
      return pushStartGenericElement(preamble.headChunks, props, 'head')
    case 'body':
      return pushStartGenericElement(preamble.bodyChunks, props, 'body')
    case 'title':
      pushStartGenericElement(hoistableChunks, props, 'title')
      hoistableChunks.push(stringToPrecomputedChunk('</title>'))
      return null
    case 'script':
      return
    case 'link':
      return
  }
  return pushStartGenericElement(target, props, type)
}

export function pushEndInstance(target, type, resumableState) {
  switch (type) {
    case 'html':
      resumableState.hasHtml = true
      return
    case 'body':
      resumableState.hasBody = true
      return
    case 'head':
    case 'title':
    case 'script':
    case 'link':
      return
  }
  target.push(stringToPrecomputedChunk(`</${type}>`))
}

export function writePreambleStart(destination, renderState) {
  const { preamble } = renderState
  const { htmlChunks, headChunks } = preamble
  for (let i = 0; i < htmlChunks.length; i++) {
    writeChunk(destination, htmlChunks[i])
  }
  if (headChunks.length) {
    for (let i = 0; i < headChunks.length; i++) {
      writeChunk(destination, headChunks[i])
    }
  } else writeChunk(destination, stringToPrecomputedChunk('<head>'))
  const { hoistableChunks } = renderState
  for (let i = 0; i < hoistableChunks.length; i++)
    writeChunk(destination, hoistableChunks[i])
  hoistableChunks.length = 0
}

export function writePreambleEnd(destination) {
  writeChunk(destination, stringToPrecomputedChunk('</head>'))
}

export function writeBootstrap(destination, renderState) {
  const { bootstrapChunks } = renderState
  for (let i = 0; i < bootstrapChunks.length; i++) {
    writeChunk(destination, bootstrapChunks[i])
  }
  bootstrapChunks.length = 0
}

export function writePostamble(destination, resumableState) {
  if (resumableState.hasBody)
    writeChunk(destination, stringToPrecomputedChunk('</body>'))
  if (resumableState.hasHtml)
    writeChunk(destination, stringToPrecomputedChunk('</html>'))
}

export function createResumableState(bootstrapScripts) {
  return {
    bootstrapScripts,
    hasHtml: false, // 是否有html标签
    hasBody: false, // 是否有body标签
  }
}

export function createPreambleState() {
  return {
    htmlChunks: [], // html标签chunk
    headChunks: [], // head标签chunk
    bodyChunks: [], // body标签chunk
  }
}

export function createRenderState(resumableState) {
  const { bootstrapScripts } = resumableState
  // javascript脚本chunks
  const bootstrapChunks = []
  if (bootstrapScripts !== undefined) {
    for (let i = 0; i < bootstrapScripts.length; i++) {
      const scriptConfig = bootstrapScripts[i]
      let src
      if (typeof scriptConfig === 'string') src = scriptConfig
      else src = scriptConfig.src
      bootstrapChunks.push('<script src="')
      bootstrapChunks.push(src)
      // 注意script aysnc属性，意味着脚本的执行是没有先后顺序的
      bootstrapChunks.push(stringToPrecomputedChunk('" async></script>'))
    }
  }
  const renderState = {
    preamble: createPreambleState(),
    hoistableChunks: [],
    bootstrapChunks,
  }
  return renderState
}
