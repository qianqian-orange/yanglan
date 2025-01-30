import React, { PropsWithChildren } from 'react'

function Icon(props: PropsWithChildren) {
  return <span className='material-icons icon' {...props} />
}

function Toolbar() {
  return (
    <div className='editable-toolbar'>
      {/* 加粗 */}
      <Icon>format_bold</Icon>
      {/* 斜体 */}
      <Icon>format_italic</Icon>
      {/* 下划线 */}
      <Icon>format_underlined</Icon>
      {/* 代码块 */}
      <Icon>code</Icon>
      {/* h1 */}
      <Icon>looks_one</Icon>
      {/* h2 */}
      <Icon>looks_two</Icon>
      {/* blockquote */}
      <Icon>format_quote</Icon>
      {/* ol */}
      <Icon>format_list_numbered</Icon>
      {/* ul */}
      <Icon>format_list_bulleted</Icon>
      {/* 文本居左 */}
      <Icon>format_align_left</Icon>
      {/* 文本居中 */}
      <Icon>format_align_center</Icon>
      {/* 文本居右 */}
      <Icon>format_align_right</Icon>
      {/* 文本自适应 */}
      <Icon>format_align_justify</Icon>
    </div>
  )
}

export default Toolbar
