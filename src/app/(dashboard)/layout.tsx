'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Home,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [tenant, setTenant] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Get user's tenant
      const { data: userData } = await supabase
        .from('users')
        .select('*, tenant:tenants(*)')
        .eq('id', user.id)
        .single()

      if (userData?.tenant) {
        setTenant(userData.tenant)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/projects', label: 'Projects', icon: FolderOpen },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-[var(--bg-surface)] border-r border-[var(--border-soft)]
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-[var(--border-soft)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-500 flex items-center justify-center text-lg font-bold text-amber-900">
              K
            </div>
            <div>
              <div className="font-semibold text-sm">{tenant?.company_name || 'Kings Optimizer'}</div>
              <div className="text-xs text-[var(--text-soft)]">v2.0</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[var(--text-soft)] hover:bg-[var(--bg-card)] hover:text-white transition-colors"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border-soft)]">
          <div className="flex items-center justify-between">
            <div className="text-xs text-[var(--text-soft)] truncate">
              {user?.email}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-soft)] hover:text-[var(--danger)]"
            >
              <LogOut size={16} />
            </button>
          </div>
          {tenant && (
            <div className="mt-2">
              <span className="badge badge-success">{tenant.plan}</span>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-[var(--bg-surface)] border-b border-[var(--border-soft)] p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-[var(--bg-card)]"
            >
              <Menu size={20} />
            </button>
            <div className="font-semibold">{tenant?.company_name || 'Kings Optimizer'}</div>
            <div className="w-8" />
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}