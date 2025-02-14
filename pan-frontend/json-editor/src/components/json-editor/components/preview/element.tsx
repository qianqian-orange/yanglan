import React from 'react'
import { JsonNode } from '../../object/json-node'
import { useChildren } from '../../hooks/use-children'

export function Element({ node }: { node: JsonNode }) {
  const children = useChildren({ node })
  const Component = node.tag

  return <Component className={node.className}>{children}</Component>
}
