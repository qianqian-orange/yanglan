import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { PropsWithChildren } from 'react'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang='zh-CN' className={geist.className}>
      <body>{children}</body>
    </html>
  )
}
