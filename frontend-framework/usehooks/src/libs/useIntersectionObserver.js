import React from 'react'

export function useIntersectionObserver(options = {}) {
  const { threshold = 1, root = null, rootMargin = '0px' } = options
  const [entry, setEntry] = React.useState(null)

  const previousObserver = React.useRef(null)

  const customRef = React.useCallback(
    node => {
      if (previousObserver.current) {
        previousObserver.current.disconnect()
        previousObserver.current = null
      }
      if (node?.nodeType === Node.ELEMENT_NODE) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            setEntry(entry)
          },
          { threshold, root, rootMargin },
        )

        observer.observe(node)
        previousObserver.current = observer
      }
    },
    [threshold, root, rootMargin],
  )

  return [customRef, entry]
}
