import React from 'react'
import { BaseElement } from '@/libs/slate/interfaces/element'
import { useChildren } from '../../hooks/use-children'

function Element({ node }: { node: BaseElement }) {
  const children = useChildren({ node })

  return <p>{children}</p>
}

export default Element
