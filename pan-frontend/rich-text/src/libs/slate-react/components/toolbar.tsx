import React, { PropsWithChildren } from 'react'
import { useSlate } from '../hooks/use-slate'

function Icon(props: PropsWithChildren<{ format: string }>) {
  const editor = useSlate()
  const { format, ...rest } = props

  return (
    <span
      onClick={() => {
        editor.addMark(format)
      }}
      className={`material-icons editable-icon ${editor.marks.has(format) ? 'editable-icon-active' : ''}`}
      {...rest}
    />
  )
}

function Toolbar() {
  return (
    <div className='editable-toolbar'>
      {/* 加粗 */}
      <Icon format='bold'>format_bold</Icon>
      {/* 斜体 */}
      <Icon format='italic'>format_italic</Icon>
      {/* 下划线 */}
      <Icon format='underline'>format_underlined</Icon>
      {/* 代码块 */}
      <Icon format='code'>code</Icon>
      {/* h1 */}
      <Icon format='h1'>looks_one</Icon>
      {/* h2 */}
      <Icon format='h2'>looks_two</Icon>
      {/* blockquote */}
      <Icon format='blockquote'>format_quote</Icon>
      {/* ol */}
      <Icon format='ol'>format_list_numbered</Icon>
      {/* ul */}
      <Icon format='ul'>format_list_bulleted</Icon>
      {/* 文本居左 */}
      <Icon format='left'>format_align_left</Icon>
      {/* 文本居中 */}
      <Icon format='center'>format_align_center</Icon>
      {/* 文本居右 */}
      <Icon format='right'>format_align_right</Icon>
      {/* 文本自适应 */}
      <Icon format='justify'>format_align_justify</Icon>
    </div>
  )
}

export default Toolbar
