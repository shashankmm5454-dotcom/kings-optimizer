import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
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
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#090f24',
              color: '#f9fbff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: '#3be482',
                secondary: '#090f24',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff5b6b',
                secondary: '#090f24',
              },
            },
          }}
        />
      </body>
    </html>
  )
}