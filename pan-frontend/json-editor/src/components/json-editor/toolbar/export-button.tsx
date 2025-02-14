import React from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

function ExportButton() {
  const { toast } = useToast()

  return (
    <Button
      onClick={() =>
        toast({
          variant: 'destructive',
          title: '导出失败',
        })
      }
    >
      导出
    </Button>
  )
}

export { ExportButton }
