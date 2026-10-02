'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export default function RouteMotion({children}:{children:ReactNode}){
  const pathname = usePathname()
  return <div key={pathname} className="site-motion-layer route-motion">{children}</div>
}
