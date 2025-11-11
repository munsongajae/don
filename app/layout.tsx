import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '환율 투자 관리',
  description: '달러/엔화 투자 관리 애플리케이션',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  )
}

