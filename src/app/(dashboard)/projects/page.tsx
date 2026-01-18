'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Filter, MoreVertical, Trash2, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Project } from '@/lib/types'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Failed to load projects')
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }

  const filteredProjects = projects.filter((p) =>
    p.site_name.toLowerCase().includes(search.toLowerCase()) ||
    p.quote_no.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      DRAFT: 'badge-info',
      QUOTED: 'badge-warning',
      CONFIRMED: 'badge-success',
      PRODUCTION: 'badge-success',
      COMPLETED: 'badge-success',
      CANCELLED: 'badge-danger',
    }
    return badges[status] || 'badge-info'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-[var(--text-soft)] mt-1">
            Manage your quotations and projects
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="run-all-btn"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      {/* Search & Filter */}
      <div className="surface mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
            />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field w-full pl-10"
            />
          </div>
          <button className="pill-btn flex items-center gap-2">
            <Filter size={14} />
            Filters
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="spinner" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="surface text-center py-12">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-[var(--text-soft)] mb-4">
            Create your first project to get started
          </p>
          <button
            onClick={() => setShowNewModal(true)}
            className="pill-btn primary"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="surface hover:border-[var(--accent)] transition-colors group"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className={`badge ${getStatusBadge(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <span className="text-xs text-[var(--text-soft)]">
                  {project.quote_no}
                </span>
              </div>

              <h3 className="font-semibold text-lg mb-1 group-hover:text-[var(--accent)] transition-colors">
                {project.site_name}
              </h3>
              
              {project.customer_name && (
                <p className="text-sm text-[var(--text-soft)] mb-3">
                  {project.customer_name}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border-soft)]">
                <div>
                  <div className="text-xs text-[var(--text-soft)]">Total</div>
                  <div className="font-semibold text-[var(--success)]">
                    {formatCurrency(project.total_amount || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text-soft)]">Sqft</div>
                  <div className="font-semibold">
                    {(project.total_sqft || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[var(--border-soft)] flex justify-between items-center">
                <span className="text-xs text-[var(--text-soft)]">
                  {formatDate(project.created_at)}
                </span>
                <span className="text-xs px-2 py-1 rounded bg-[var(--bg-card)] text-[var(--text-soft)]">
                  {project.brand}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {showNewModal && (
        <NewProjectModal
          onClose={() => setShowNewModal(false)}
          onCreated={() => {
            setShowNewModal(false)
            fetchProjects()
          }}
        />
      )}
    </div>
  )
}

// New Project Modal Component
function NewProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const [formData, setFormData] = useState({
    site_name: '',
    customer_name: '',
    phone: '',
    address: '',
    brand: 'FENSTAS',
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get user's tenant
      const { data: { user } } = await supabase.auth.getUser()
      const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user?.id)
        .single()

      if (!userData?.tenant_id) {
        throw new Error('No tenant found')
      }

      // Generate quote number
      const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', userData.tenant_id)

      const quoteNo = `Q-${String((count || 0) + 1).padStart(3, '0')}`

      // Create project
      const { error } = await supabase.from('projects').insert({
        tenant_id: userData.tenant_id,
        quote_no: quoteNo,
        site_name: formData.site_name,
        customer_name: formData.customer_name || null,
        phone: formData.phone || null,
        address: formData.address || null,
        brand: formData.brand,
        created_by: user?.id,
      })

      if (error) throw error

      toast.success('Project created!')
      onCreated()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="surface relative w-full max-w-lg">
        <h2 className="text-xl font-bold mb-6">New Project</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-soft)] mb-2">
              Site Name *
            </label>
            <input
              type="text"
              value={formData.site_name}
              onChange={(e) =>
                setFormData({ ...formData, site_name: e.target.value })
              }
              className="input-field w-full"
              placeholder="e.g., Kumar Residence"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--text-soft)] mb-2">
              Customer Name
            </label>
            <input
              type="text"
              value={formData.customer_name}
              onChange={(e) =>
                setFormData({ ...formData, customer_name: e.target.value })
              }
              className="input-field w-full"
              placeholder="e.g., Mr. Ramesh Kumar"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--text-soft)] mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="input-field w-full"
                placeholder="9876543210"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-soft)] mb-2">
                Brand
              </label>
              <select
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                className="select-field w-full"
              >
                <option value="FENSTAS">FENSTAS</option>
                <option value="ENCRAFT">ENCRAFT</option>
                <option value="KOMMERLING">KOMMERLING</option>
                <option value="REHAU">REHAU</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-[var(--text-soft)] mb-2">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="input-field w-full"
              rows={3}
              placeholder="Full site address"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="pill-btn flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="pill-btn primary flex-1 flex justify-center items-center gap-2"
            >
              {loading ? <span className="spinner" /> : null}
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}