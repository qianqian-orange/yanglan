import { Descendant } from './interfaces/node'

export interface Editor {
  children: Descendant[]
}

export function createEditor(initialValue?: Descendant[]): Editor {
  const editor: Editor = {
    children: initialValue || [],
  }
  return editor
}
