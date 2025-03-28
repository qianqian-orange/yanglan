import React from 'react'
import { uniqueId } from 'lodash-es'
import { Button } from '@/components/ui/button'
import { useJsonStore } from '../../stores'

export function ExportButton() {
  const jsonString = useJsonStore(state => state.jsonString)

  return (
    <Button
      onClick={() => {
        const blob = new Blob([jsonString])
        const url = URL.createObjectURL(blob)
        const fileName = `${uniqueId()}.json`
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
        URL.revokeObjectURL(url)
      }}
    >
      导出
    </Button>
  )
}
