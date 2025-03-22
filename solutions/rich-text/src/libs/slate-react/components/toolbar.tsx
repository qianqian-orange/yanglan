import React, { PropsWithChildren } from 'react'
import { useSlate } from '../hooks/use-slate'
import {
  BlockQuote,
  Bold,
  BulletedList,
  Code,
  HeadingOne,
  HeadingTwo,
  Italic,
  NumberedList,
  TextAlignCenter,
  TextAlignJustify,
  TextAlignLeft,
  TextAlignRight,
  Underline,
} from '@/libs/slate/SlateNode'

function Icon(props: PropsWithChildren<{ flag: number }>) {
  const editor = useSlate()
  const { flag, ...rest } = props

  return (
    <span
      onClick={() => {
        editor.addFlag(flag)
      }}
      className={`material-icons editable-icon ${editor.flags & flag ? 'editable-icon-active' : ''}`}
      {...rest}
    />
  )
}

function Toolbar() {
  return (
    <div className='editable-toolbar'>
      {/* 加粗 */}
      <Icon flag={Bold}>format_bold</Icon>
      {/* 斜体 */}
      <Icon flag={Italic}>format_italic</Icon>
      {/* 下划线 */}
      <Icon flag={Underline}>format_underlined</Icon>
      {/* 代码块 */}
      <Icon flag={Code}>code</Icon>
      {/* h1 */}
      <Icon flag={HeadingOne}>looks_one</Icon>
      {/* h2 */}
      <Icon flag={HeadingTwo}>looks_two</Icon>
      {/* blockquote */}
      <Icon flag={BlockQuote}>format_quote</Icon>
      {/* ol */}
      <Icon flag={NumberedList}>format_list_numbered</Icon>
      {/* ul */}
      <Icon flag={BulletedList}>format_list_bulleted</Icon>
      {/* 文本居左 */}
      <Icon flag={TextAlignLeft}>format_align_left</Icon>
      {/* 文本居中 */}
      <Icon flag={TextAlignCenter}>format_align_center</Icon>
      {/* 文本居右 */}
      <Icon flag={TextAlignRight}>format_align_right</Icon>
      {/* 文本自适应 */}
      <Icon flag={TextAlignJustify}>format_align_justify</Icon>
    </div>
  )
}

export default Toolbar
