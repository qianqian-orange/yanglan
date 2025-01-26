import { Editor } from '@/libs/slate/create-editor'
import { createContext, useContext } from 'react'

export const SlateContext = createContext<{ editor: Editor } | null>(null)

export function useSlate() {
  const context = useContext(SlateContext)

  return context?.editor
}
