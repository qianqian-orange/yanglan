import SlateEditor from '@/libs/slate/SlateEditor'
import { createContext, useContext } from 'react'

export const SlateContext = createContext<{ editor: SlateEditor } | null>(null)

export function useSlate(): SlateEditor {
  const context = useContext(SlateContext)

  return context!.editor
}
