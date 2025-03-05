import React from 'react'

export function useHover() {
  const [hovering, setHovering] = React.useState(false)
  const previousNode = React.useRef(null)

  const handleMouseEnter = React.useCallback(() => {
    setHovering(true)
  }, [])

  const handleMouseLeave = React.useCallback(() => {
    setHovering(false)
  }, [])

  const customRef = React.useCallback(
    node => {
      if (previousNode.current?.nodeType === Node.ELEMENT_NODE) {
        previousNode.current.removeEventListener('mouseenter', handleMouseEnter)
        previousNode.current.removeEventListener('mouseleave', handleMouseLeave)
      }
      if (node?.nodeType === Node.ELEMENT_NODE) {
        node.addEventListener('mouseenter', handleMouseEnter)
        node.addEventListener('mouseleave', handleMouseLeave)
      }
      previousNode.current = node
    },
    [handleMouseEnter, handleMouseLeave],
  )

  return [customRef, hovering]
}
