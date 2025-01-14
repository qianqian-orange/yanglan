import Link from 'next/link'
import Image from 'next/image'
import HelloWorld from '@/app/_components/HelloWorld'

export default function Home() {
  return (
    <div>
      <HelloWorld />
      <div className='w-10 h-10 bg-red-800' />
      <Link href='/blog'>blog</Link>
      <Image src='/avatar.jpg' alt='avatar' width={100} height={100} />
    </div>
  )
}
