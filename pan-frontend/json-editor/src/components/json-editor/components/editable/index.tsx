import React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { useJsonStore } from '../../stores'

export function Editable() {
  const jsonString = useJsonStore(state => state.jsonString)
  const setJsonString = useJsonStore(state => state.setJsonString)

  return (
    <Textarea
      className='mr-4 h-full flex-1 resize-none'
      value={jsonString}
      onChange={e => {
        setJsonString(e.target.value)
      }}
    />
  )
}
