import './globals.css'
import Navbar from '@/components/Navbar'
import MotionEffects from '@/components/MotionEffects'
import BackgroundFX from '@/components/BackgroundFX'
import RouteMotion from '@/components/RouteMotion'

export const metadata = {
  title: 'LAN ARENA — Esports LAN Platform',
  description: 'Платформа для LAN-турниров, команд, матчей, статистики и esports-сообщества',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <BackgroundFX/>
        <MotionEffects/>
        <Navbar/>
        <RouteMotion>{children}</RouteMotion>
      </body>
    </html>
  )
}
