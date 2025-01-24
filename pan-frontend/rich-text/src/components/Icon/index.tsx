import React, { PropsWithChildren } from 'react'

function Icon({ children }: PropsWithChildren) {
  return <span className='material-icons'>{children}</span>
}

export default Icon
