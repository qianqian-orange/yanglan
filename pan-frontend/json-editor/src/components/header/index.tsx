import React, { useLayoutEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from '../ui/button'

type Theme = 'light' | 'dark'

function Header() {
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem('theme') || 'light') as Theme,
  )

  function toggleTheme(newTheme: Theme) {
    if (newTheme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }

  useLayoutEffect(() => {
    toggleTheme(theme)
  }, [])

  return (
    <div className='border-grid bg-background/95 sticky top-0 flex h-16 w-full items-center justify-end border-b px-4 backdrop-blur'>
      <Button
        variant='outline'
        size='icon'
        onClick={() => {
          const newTheme = theme === 'light' ? 'dark' : 'light'
          setTheme(newTheme)
          localStorage.setItem('theme', newTheme)
          toggleTheme(newTheme)
        }}
      >
        {theme === 'light' ? <Moon /> : <Sun />}
      </Button>
    </div>
  )
}

export { Header }
