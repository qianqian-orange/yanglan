import React from 'react'
import { JsonNode } from '../../object/json-node'

export function Text({ node }: { node: JsonNode }) {
  return <span className={node.className}>{node.text}</span>
}
