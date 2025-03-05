import React from 'react'

export function useCopyToClipboard() {
  const [state, setState] = React.useState(null)

  const copyToClipboard = React.useCallback(value => {
    const handleCopy = async () => {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else {
        const tempTextArea = document.createElement('textarea')
        tempTextArea.value = value
        document.body.appendChild(tempTextArea)
        tempTextArea.select()
        document.execCommand('copy')
        document.body.removeChild(tempTextArea)
      }
      setState(value)
    }
    handleCopy()
  }, [])

  return [state, copyToClipboard]
}
