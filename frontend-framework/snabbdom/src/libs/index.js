import { vnode } from './vnode'
export * from './modules'
export { h } from './h'
export { vnode }

const emptyNode = vnode('', {}, [], undefined, undefined)

function sameVnode(vnode1, vnode2) {
  const isSameKey = vnode1.key === vnode2.key
  const isSameSel = vnode1.sel === vnode2.sel
  const isSameText =
    !vnode1.sel && vnode1.sel === vnode2.sel
      ? typeof vnode1.text === typeof vnode2.text
      : true
  return isSameKey && isSameSel && isSameText
}

// 建立vnode.key -> index映射关系
function createKeyToOldIdx(children, beginIdx, endIdx) {
  const map = {}
  for (let i = beginIdx; i <= endIdx; i++) {
    const key = children[i]?.key
    if (key !== undefined) {
      map[key] = i
    }
  }
  return map
}

export function init(modules) {
  const cbs = {
    create: [],
    update: [],
    destroy: [],
  }

  for (const hook in cbs) {
    for (const module of modules) {
      const cb = module[hook]
      if (cb) cbs[hook].push(cb)
    }
  }

  function emptyNodeAt(elm) {
    const id = elm.id ? `#${elm.id}` : ''
    return vnode(elm.tagName.toLowerCase() + id, {}, [], undefined, elm)
  }

  function createElm(vnode) {
    if (vnode.sel === '') {
      vnode.elm = document.createTextNode(vnode.text)
    } else {
      const tag = vnode.sel
      const elm = (vnode.elm = document.createElement(tag))
      const text = vnode.text
      const children = vnode.children
      // 调用module的create钩子
      for (let i = 0; i < cbs.create.length; i++)
        cbs.create[i](emptyNode, vnode)
      if (
        (typeof text === 'string' && !Array.isArray(children)) ||
        children.length === 0
      ) {
        elm.appendChild(document.createTextNode(text))
      }
      if (Array.isArray(children)) {
        for (let i = 0; i < children.length; i++) {
          elm.appendChild(createElm(children[i]))
        }
      }
    }
    return vnode.elm
  }

  function invokeDestroyHook(vnode) {
    if (vnode.data) {
      for (let i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode)
      if (vnode.children) {
        for (let i = 0; i < vnode.children.length; i++) {
          if (typeof vnode.children[i] !== 'string') {
            invokeDestroyHook(vnode.children[i])
          }
        }
      }
    }
  }

  function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      const vnode = vnodes[startIdx]
      if (vnode.sel) {
        invokeDestroyHook(vnode)
      }
      parentElm.removeChild(vnode.elm)
    }
  }

  function addVnodes(parentElm, before, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      if (vnodes[startIdx]) {
        parentElm.insertBefore(createElm(vnodes[startIdx]), before)
      }
    }
  }

  function updateChildren(parentElm, oldChild, newChild) {
    let oldStartIdx = 0
    let oldEndIdx = oldChild.length - 1
    let newStartIdx = 0
    let newEndIdx = newChild.length - 1
    let oldStartVnode = oldChild[oldStartIdx]
    let oldEndVnode = oldChild[oldEndIdx]
    let newStartVnode = newChild[newStartIdx]
    let newEndVnode = newChild[newEndIdx]
    let oldKeyToIdx
    let idxInOld
    let elmToMove
    let before

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (oldStartVnode == null) {
        oldStartVnode = oldChild[++oldStartIdx]
      } else if (oldEndVnode == null) {
        oldEndVnode = oldChild[--oldEndIdx]
      } else if (newStartVnode == null) {
        newStartVnode = newChild[++newStartIdx]
      } else if (newEndVnode == null) {
        newEndVnode = newChild[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode)
        oldStartVnode = oldChild[++oldStartIdx]
        newStartVnode = newChild[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode)
        oldEndVnode = oldChild[--oldEndIdx]
        newEndVnode = newChild[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) {
        patchVnode(oldStartVnode, newEndVnode)
        // 把旧start vnode对应的DOM节点移到末尾
        parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm)
        oldStartVnode = oldChild[++oldStartIdx]
        newEndVnode = newChild[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) {
        patchVnode(oldEndVnode, newStartVnode)
        // 把旧end vnode对应的DOM节点移到开头
        parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldChild[--oldEndIdx]
        newStartVnode = newChild[++newStartIdx]
      } else {
        if (oldKeyToIdx === undefined) {
          oldKeyToIdx = createKeyToOldIdx(oldChild, oldStartIdx, oldEndIdx)
        }
        idxInOld = oldKeyToIdx[newStartVnode.key]
        if (idxInOld === undefined) {
          // `newStartVnode` is new, create and insert it in beginning
          parentElm.insertBefore(createElm(newStartVnode), oldStartVnode.elm)
          newStartVnode = newChild[++newStartIdx]
        } else if (oldKeyToIdx[newEndVnode.key] === undefined) {
          // `newEndVnode` is new, create and insert it in the end
          parentElm.insertBefore(
            createElm(newEndVnode),
            oldEndVnode.elm.nextSibling,
          )
          newEndVnode = newChild[--newEndIdx]
        } else {
          elmToMove = oldChild[idxInOld]
          if (elmToMove.sel !== newStartVnode.sel) {
            parentElm.insertBefore(createElm(newStartVnode), oldStartVnode.elm)
          } else {
            patchVnode(elmToMove, newStartVnode)
            oldChild[idxInOld] = undefined
            parentElm.insertBefore(elmToMove.elm, oldStartVnode.elm)
          }
          newStartVnode = newChild[++newStartIdx]
        }
      }
    }

    if (newStartIdx <= newEndIdx) {
      before =
        newChild[newEndIdx + 1] == null ? null : newChild[newEndIdx + 1].elm
      addVnodes(parentElm, before, newChild, newStartIdx, newEndIdx)
    }

    if (oldStartIdx <= oldEndIdx) {
      removeVnodes(parentElm, oldChild, oldStartIdx, oldEndIdx)
    }
  }

  function patchVnode(oldVnode, newVnode) {
    if (oldVnode === newVnode) return
    const elm = (newVnode.elm = oldVnode.elm)
    if (newVnode.data || (newVnode.text && newVnode.text === oldVnode.text)) {
      newVnode ??= {}
      oldVnode ??= {}
      for (let i = 0; i < cbs.update.length; i++)
        cbs.update[i](oldVnode, newVnode)
    }
    const oldChild = oldVnode.children
    const newChild = newVnode.children
    if (newVnode.text === undefined) {
      if (oldChild && newChild) {
        if (oldChild !== newChild) updateChildren(elm, oldChild, newChild)
      } else if (newChild) {
        if (oldChild.text !== undefined) elm.textContent = ''
        addVnodes(elm, null, newChild, 0, newChild.length - 1)
      } else if (oldChild) {
        removeVnodes(elm, oldChild, 0, oldChild.length - 1)
      } else if (oldChild.text !== undefined) {
        elm.textContent = ''
      }
    } else if (oldVnode.text !== newVnode.text) {
      if (oldChild) {
        removeVnodes(elm, oldChild, 0, oldChild.length - 1)
      }
      elm.textContent = newVnode.text
    }
  }

  return function patch(oldVnode, newVnode) {
    // 将DOM节点转成vnode
    if (oldVnode.nodeType === Node.ELEMENT_NODE) {
      oldVnode = emptyNodeAt(oldVnode)
    }
    if (sameVnode(oldVnode, newVnode)) {
      patchVnode(oldVnode, newVnode)
    } else {
      const elm = oldVnode.elm
      const parent = elm.parentNode
      // 创建vnode对应的DOM节点
      createElm(newVnode)
      // 将新DOM节点插入到页面指定节点
      parent.insertBefore(newVnode.elm, elm.nextSibling)
      // 移除旧vnode对应的DOM节点
      removeVnodes(parent, [oldVnode], 0, 0)
    }
  }
}
