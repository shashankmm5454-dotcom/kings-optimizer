import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kings Optimizer Hub',
  description: 'Window & Door Manufacturing Optimization System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}