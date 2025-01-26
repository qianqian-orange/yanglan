import React, { MouseEventHandler, PropsWithChildren } from 'react'

function Icon(props: PropsWithChildren<{ onMouseDown: MouseEventHandler }>) {
  return <span className='material-icons icon' {...props} />
}

function Toolbar() {
  return (
    <div className='editable-toolbar'>
      <Icon
        onMouseDown={(event) => {
          event.preventDefault()
          console.log(1)
        }}
      >
        format_bold
      </Icon>
      {/* <Icon>format_italic</Icon>
    <Icon>format_underlined</Icon>
    <Icon>code</Icon>
    <Icon>looks_one</Icon>
    <Icon>looks_two</Icon>
    <Icon>format_quote</Icon>
    <Icon>format_list_numbered</Icon>
    <Icon>format_list_bulleted</Icon>
    <Icon>format_align_left</Icon>
    <Icon>format_align_center</Icon>
    <Icon>format_align_right</Icon>
    <Icon>format_align_justify</Icon> */}
    </div>
  )
}

export default Toolbar
