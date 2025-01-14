function setValueForStyles(node, styles, prevStyles) {
  const style = node.style
  for (const styleName in prevStyles) {
    style[styleName] = ''
  }
  for (const styleName in styles) {
    style[styleName] = styles[styleName]
  }
}

// 设置DOM属性值
function setProp(node, key, value, prevValue) {
  switch (key) {
    case 'children': {
      if (typeof value === 'string' || typeof value === 'number') {
        node.textContent = value
      }
      break
    }
    case 'style': {
      setValueForStyles(node, value, prevValue)
      break
    }
    case 'onClick': {
      node.onClick = value
      break
    }
  }
}

export function setInitialProperties(domElement, props) {
  for (const propKey in props) {
    setProp(domElement, propKey, props[propKey], null)
  }
}

export function updateProperties(domElement, nextProp, prevProps) {
  for (const propKey in prevProps) {
    if (Object.prototype.hasOwnProperty.call(nextProp, propKey)) {
      continue
    }
    setProp(domElement, propKey, null, prevProps[propKey])
  }
  for (const propKey in nextProp) {
    const propValue = nextProp[propKey]
    setProp(domElement, propKey, propValue, prevProps[propKey])
  }
}
