import React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { useJSONStore } from '@/stores/useJSONStore'

function Editor() {
  const jsonString = useJSONStore(state => state.jsonString)
  const updateJSONString = useJSONStore(state => state.updateJSONString)

  return (
    <div className='mt-4 flex flex-1 justify-between'>
      <Textarea
        className='mr-4 h-full flex-1 resize-none'
        value={jsonString}
        onChange={e => {
          updateJSONString(e.target.value)
        }}
      />
      <div className='flex-1'></div>
    </div>
  )
}

export default Editor
