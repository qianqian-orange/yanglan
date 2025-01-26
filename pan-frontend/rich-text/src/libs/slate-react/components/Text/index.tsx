import React from 'react'
import { BaseText } from '@/libs/slate/interfaces/text'

function Text({ node }: { node: BaseText }) {
  return <span>{node.text}</span>
}

export default Text
