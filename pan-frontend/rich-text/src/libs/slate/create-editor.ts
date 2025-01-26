import { ActionDispatch, AnyActionArg } from 'react'
import insertText from './editor/insert-text'
import { SlateNode, SlateNodeType } from './interfaces/node'

export const noop = () => {}

export interface Editor {
  slateRootNode: SlateNode // SlateNode Tree根节点
  domEl: HTMLElement | null // 编辑容器节点
  selection: { node: Node; offset: number } | null
  forceUpdate: ActionDispatch<AnyActionArg> // 触发更新渲染
  insertText: (text: string, range: StaticRange) => void // 插入文本
}

export function createEditor(initialValue?: SlateNode[]): Editor {
  const editor: Editor = {
    slateRootNode: {
      type: SlateNodeType.paragraph,
      text: '',
      children: initialValue || [],
    },
    domEl: null,
    selection: null,
    forceUpdate: noop,
    insertText: (...args) => insertText(editor, ...args),
  }
  return editor
}
