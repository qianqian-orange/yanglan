import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useJsonStore } from '../../stores'
import { buildTree, JsonNode } from '../../object/json-node'
import { Element } from './element'

export function Preview({ className = '' }: { className?: string }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [jsonTree, setJSONTree] = useState<JsonNode | null>(null)
  const jsonString = useJsonStore(state => state.jsonString)
  const setJsonObject = useJsonStore(state => state.setJsonObject)

  useEffect(() => {
    setErrorMessage('')
    setJsonObject(null)
    setJSONTree(null)
    try {
      if (!jsonString) return
      // The Object, Array, string, number, boolean, or null value corresponding to the given JSON text
      const ans = JSON.parse(jsonString)
      if (typeof ans === 'number' || typeof ans === 'boolean' || ans === null) {
        setErrorMessage(
          'The current input data parsing type is incorrect. Expected input object type data',
        )
        return
      }
      setJsonObject(ans)
      setJSONTree(buildTree('', ans))
    } catch (e) {
      setErrorMessage((e as Error).message)
    }
  }, [jsonString])

  function renderContent() {
    if (errorMessage) return errorMessage
    if (!jsonTree) return
    return <Element node={jsonTree} />
  }

  return (
    <div
      className={cn('bg-foreground text-background rounded-md p-3', className)}
    >
      {renderContent()}
    </div>
  )
}
