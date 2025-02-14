import { uniqueId } from 'lodash-es'
import { JSX } from 'react'
import { JSONObject } from '../stores'

class JsonNode {
  tag: keyof JSX.IntrinsicElements // 节点标签类型
  key: string // 唯一标识
  value?: string | number | boolean | null // 原始值
  text: string // 文本内容
  collapsed: boolean // 是否折叠
  className: string // 样式
  children: JsonNode[] // 子节点

  constructor({
    tag = 'div',
    key = uniqueId(),
    value = undefined,
    text = '',
    collapsed = false,
    className = '',
    children = [],
  }: Partial<JsonNode>) {
    this.tag = tag
    this.key = key
    this.value = value
    this.text = text
    this.collapsed = collapsed
    this.className = className
    this.children = children
  }
}

const renderText = (props: Partial<JsonNode> = {}) =>
  new JsonNode({ tag: 'span', ...props })

const renderParagraph = (props: Partial<JsonNode> = {}) =>
  new JsonNode({ tag: 'p', ...props })

const renderContainer = (props: Partial<JsonNode> = {}) =>
  new JsonNode({ tag: 'div', ...props })

export const buildTree = (
  propKey: string | number,
  obj: JSONObject | Array<null | string | number | boolean | JSONObject>,
) => {
  const children = []
  children.push(
    renderParagraph({
      children: [
        ...(propKey !== ''
          ? [
              renderText({
                text:
                  typeof propKey === 'string' ? `"${propKey}"` : `${propKey}`,
                value: propKey,
              }),
              renderText({ text: ' : ' }),
            ]
          : []),
        renderText({ text: Array.isArray(obj) ? '[' : '{' }),
      ],
    }),
  )
  for (const key in obj) {
    const value = (obj as Record<string, typeof obj>)[key]
    if (value !== null && typeof value === 'object') {
      children.push(buildTree(!key || Number.isNaN(+key) ? key : +key, value))
    } else {
      children.push(
        renderParagraph({
          className: 'pl-4',
          children: [
            renderText({
              text: !key || Number.isNaN(+key) ? `"${key}"` : key,
              value,
            }),
            renderText({ text: ' : ' }),
            value === null
              ? renderText({ text: 'NULL', value })
              : renderText({
                  text: typeof value === 'string' ? `"${value}"` : `${value}`,
                  value,
                }),
          ],
        }),
      )
    }
  }
  children.push(
    renderParagraph({
      children: [renderText({ text: Array.isArray(obj) ? ']' : '}' })],
    }),
  )
  const root = renderContainer({
    children,
    className: propKey !== '' ? 'pl-4' : '',
  })
  return root
}

export { JsonNode }
