import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useJsonStore } from '../../stores'

export function ImportButton({ className = '' }: { className?: string }) {
  const { toast } = useToast()
  const setJsonString = useJsonStore(state => state.setJsonString)

  return (
    <div className={className}>
      <Button asChild>
        <Label htmlFor='json-import'>导入</Label>
      </Button>
      <Input
        id='json-import'
        type='file'
        className='hidden'
        accept='.json'
        multiple={false}
        onInput={evt => {
          const target = evt.target as HTMLInputElement
          const files = target.files
          if (!files?.length) return
          const file = files[0]
          const type = file.type
          if (type !== 'application/json') {
            toast({
              variant: 'destructive',
              title: '文件格式不正确',
            })
            return
          }
          const reader = new FileReader()
          reader.readAsText(file)
          reader.onload = function (evt) {
            const content = evt.target?.result
            if (content) setJsonString(content as string)
          }
        }}
      />
    </div>
  )
}
