'use client'

import { useState, useEffect } from 'react'

// ===============================================
// UPVC PROFILES MASTER DATA PAGE
// Sprint 1 - Profile Library Management
// ===============================================

interface UPVCProfile {
  id: string
  code: string
  name: string
  family: 'FRAME' | 'SASH' | 'MULLION' | 'TRANSOM' | 'BEADING' | 'INTERLOCK' | 'ADDON'
  brand: string
  stockLength: number
  weight: number
  ratePerMeter: number
  ratePerPiece: number
  pricingMode: 'METER' | 'PIECE'
  deductions: {
    frame: number
    sash: number
  }
  color: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'kings-optimizer-profiles'

// Default profiles
const defaultProfiles: UPVCProfile[] = [
  { id: '1', code: 'FR-60', name: 'Frame 60mm', family: 'FRAME', brand: 'FENSTAS', stockLength: 6500, weight: 0.85, ratePerMeter: 180, ratePerPiece: 1170, pricingMode: 'METER', deductions: { frame: 0, sash: 20 }, color: 'White', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', code: 'SH-60', name: 'Sash 60mm', family: 'SASH', brand: 'FENSTAS', stockLength: 6500, weight: 0.72, ratePerMeter: 165, ratePerPiece: 1072, pricingMode: 'METER', deductions: { frame: 40, sash: 0 }, color: 'White', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', code: 'ML-60', name: 'Mullion 60mm', family: 'MULLION', brand: 'FENSTAS', stockLength: 6500, weight: 0.68, ratePerMeter: 155, ratePerPiece: 1007, pricingMode: 'METER', deductions: { frame: 0, sash: 0 }, color: 'White', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', code: 'IL-60', name: 'Interlock 60mm', family: 'INTERLOCK', brand: 'FENSTAS', stockLength: 6500, weight: 0.45, ratePerMeter: 120, ratePerPiece: 780, pricingMode: 'METER', deductions: { frame: 0, sash: 0 }, color: 'White', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '5', code: 'BD-20', name: 'Beading 20mm', family: 'BEADING', brand: 'FENSTAS', stockLength: 6500, weight: 0.25, ratePerMeter: 45, ratePerPiece: 292, pricingMode: 'METER', deductions: { frame: 0, sash: 0 }, color: 'White', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '6', code: 'TR-60', name: 'Transom 60mm', family: 'TRANSOM', brand: 'FENSTAS', stockLength: 6500, weight: 0.65, ratePerMeter: 150, ratePerPiece: 975, pricingMode: 'METER', deductions: { frame: 0, sash: 0 }, color: 'White', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<UPVCProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterFamily, setFilterFamily] = useState<string>('ALL')
  const [filterBrand, setFilterBrand] = useState<string>('ALL')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProfile, setEditingProfile] = useState<UPVCProfile | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setProfiles(JSON.parse(saved))
    } else {
      setProfiles(defaultProfiles)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfiles))
    }
    setLoading(false)
  }, [])

  // Save to localStorage
  const saveProfiles = (newProfiles: UPVCProfile[]) => {
    setProfiles(newProfiles)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfiles))
  }

  // Add profile
  const addProfile = (profile: Omit<UPVCProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProfile: UPVCProfile = {
      ...profile,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveProfiles([...profiles, newProfile])
    setShowAddModal(false)
  }

  // Update profile
  const updateProfile = (id: string, updates: Partial<UPVCProfile>) => {
    const newProfiles = profiles.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    )
    saveProfiles(newProfiles)
    setEditingProfile(null)
  }

  // Delete profile
  const deleteProfile = (id: string) => {
    if (confirm('Delete this profile?')) {
      saveProfiles(profiles.filter(p => p.id !== id))
    }
  }

  // Duplicate profile
  const duplicateProfile = (profile: UPVCProfile) => {
    const newProfile: UPVCProfile = {
      ...profile,
      id: Date.now().toString(),
      code: `${profile.code}-COPY`,
      name: `${profile.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveProfiles([...profiles, newProfile])
  }

  // Export to JSON
  const exportData = () => {
    const blob = new Blob([JSON.stringify(profiles, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'profiles.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import from JSON
  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string)
        if (Array.isArray(imported)) {
          saveProfiles([...profiles, ...imported.map((p: any) => ({ ...p, id: Date.now().toString() + Math.random() }))])
          alert(`Imported ${imported.length} profiles`)
        }
      } catch (err) {
        alert('Invalid JSON file')
      }
    }
    reader.readAsText(file)
  }

  // Filter profiles
  const filteredProfiles = profiles.filter(p => {
    if (filterFamily !== 'ALL' && p.family !== filterFamily) return false
    if (filterBrand !== 'ALL' && p.brand !== filterBrand) return false
    if (searchQuery && !p.code.toLowerCase().includes(searchQuery.toLowerCase()) && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Get unique brands
  const brands = [...new Set(profiles.map(p => p.brand))]
  const families: UPVCProfile['family'][] = ['FRAME', 'SASH', 'MULLION', 'TRANSOM', 'BEADING', 'INTERLOCK', 'ADDON']

  const formatCurrency = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">📐 UPVC Profiles</h1>
          <p className="text-slate-400 text-sm">Manage your profile library • {profiles.length} profiles</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-500"
          >
            + Add Profile
          </button>
          <button onClick={exportData} className="px-4 py-2 rounded-xl bg-slate-700 text-white hover:bg-slate-600">
            📤 Export
          </button>
          <label className="px-4 py-2 rounded-xl bg-slate-700 text-white hover:bg-slate-600 cursor-pointer">
            📥 Import
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search profiles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 w-64"
        />
        <select
          value={filterFamily}
          onChange={(e) => setFilterFamily(e.target.value)}
          className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
        >
          <option value="ALL">All Families</option>
          {families.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
          className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
        >
          <option value="ALL">All Brands</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <div className="flex-1" />
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-2 rounded-lg ${viewMode === 'table' ? 'bg-purple-600' : 'bg-slate-700'}`}
          >
            ≡
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-600' : 'bg-slate-700'}`}
          >
            ⊞
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {families.map(family => {
          const count = profiles.filter(p => p.family === family).length
          return (
            <div key={family} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
              <div className="text-xl font-bold text-white">{count}</div>
              <div className="text-xs text-slate-500">{family}</div>
            </div>
          )
        })}
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Code</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Family</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Brand</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Stock (mm)</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Weight (kg/m)</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Rate/m</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Rate/pc</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Status</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map(profile => (
                  <tr key={profile.id} className="border-t border-slate-700/30 hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-purple-400 font-mono">{profile.code}</td>
                    <td className="py-3 px-4 text-white">{profile.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        profile.family === 'FRAME' ? 'bg-blue-500/20 text-blue-400' :
                        profile.family === 'SASH' ? 'bg-cyan-500/20 text-cyan-400' :
                        profile.family === 'MULLION' ? 'bg-amber-500/20 text-amber-400' :
                        profile.family === 'INTERLOCK' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {profile.family}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{profile.brand}</td>
                    <td className="py-3 px-4 text-right text-white font-mono">{profile.stockLength}</td>
                    <td className="py-3 px-4 text-right text-white font-mono">{profile.weight}</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-mono">{formatCurrency(profile.ratePerMeter)}</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-mono">{formatCurrency(profile.ratePerPiece)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${profile.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {profile.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setEditingProfile(profile)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white">✏️</button>
                        <button onClick={() => duplicateProfile(profile)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white">📋</button>
                        <button onClick={() => deleteProfile(profile.id)} className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProfiles.map(profile => (
            <div key={profile.id} className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/50 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-purple-400 font-mono font-bold">{profile.code}</div>
                  <div className="text-white font-semibold">{profile.name}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  profile.family === 'FRAME' ? 'bg-blue-500/20 text-blue-400' :
                  profile.family === 'SASH' ? 'bg-cyan-500/20 text-cyan-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {profile.family}
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-400 mb-3">
                <div className="flex justify-between">
                  <span>Brand</span>
                  <span className="text-white">{profile.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stock Length</span>
                  <span className="text-white font-mono">{profile.stockLength} mm</span>
                </div>
                <div className="flex justify-between">
                  <span>Weight</span>
                  <span className="text-white font-mono">{profile.weight} kg/m</span>
                </div>
                <div className="flex justify-between">
                  <span>Rate/Meter</span>
                  <span className="text-emerald-400 font-mono">{formatCurrency(profile.ratePerMeter)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingProfile(profile)} className="flex-1 px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs hover:bg-slate-600">Edit</button>
                <button onClick={() => duplicateProfile(profile)} className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs hover:bg-slate-600">📋</button>
                <button onClick={() => deleteProfile(profile.id)} className="px-3 py-1.5 rounded-lg bg-slate-700 text-red-400 text-xs hover:bg-red-500/20">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingProfile) && (
        <ProfileModal
          profile={editingProfile}
          onSave={(profile) => {
            if (editingProfile) {
              updateProfile(editingProfile.id, profile)
            } else {
              addProfile(profile as any)
            }
          }}
          onClose={() => { setShowAddModal(false); setEditingProfile(null) }}
          families={families}
          brands={brands}
        />
      )}
    </div>
  )
}

// Profile Modal Component
function ProfileModal({ 
  profile, 
  onSave, 
  onClose, 
  families,
  brands 
}: { 
  profile: UPVCProfile | null
  onSave: (profile: Partial<UPVCProfile>) => void
  onClose: () => void
  families: string[]
  brands: string[]
}) {
  const [form, setForm] = useState({
    code: profile?.code || '',
    name: profile?.name || '',
    family: profile?.family || 'FRAME',
    brand: profile?.brand || 'FENSTAS',
    stockLength: profile?.stockLength || 6500,
    weight: profile?.weight || 0.5,
    ratePerMeter: profile?.ratePerMeter || 100,
    ratePerPiece: profile?.ratePerPiece || 650,
    pricingMode: profile?.pricingMode || 'METER',
    deductions: profile?.deductions || { frame: 0, sash: 0 },
    color: profile?.color || 'White',
    isActive: profile?.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-4">
          {profile ? 'Edit Profile' : 'Add New Profile'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Code *</label>
              <input
                value={form.code}
                onChange={(e) => setForm({...form, code: e.target.value})}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                placeholder="FR-60"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                placeholder="Frame 60mm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Family *</label>
              <select
                value={form.family}
                onChange={(e) => setForm({...form, family: e.target.value as any})}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                {families.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Brand</label>
              <input
                value={form.brand}
                onChange={(e) => setForm({...form, brand: e.target.value})}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                placeholder="FENSTAS"
                list="brand-list"
              />
              <datalist id="brand-list">
                {brands.map(b => <option key={b} value={b} />)}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Stock Length (mm)</label>
              <input
                type="number"
                value={form.stockLength}
                onChange={(e) => setForm({...form, stockLength: Number(e.target.value)})}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Weight (kg/m)</label>
              <input
                type="number"
                step="0.01"
                value={form.weight}
                onChange={(e) => setForm({...form, weight: Number(e.target.value)})}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Rate per Meter (₹)</label>
              <input
                type="number"
                value={form.ratePerMeter}
                onChange={(e) => setForm({...form, ratePerMeter: Number(e.target.value)})}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Rate per Piece (₹)</label>
              <input
                type="number"
                value={form.ratePerPiece}
                onChange={(e) => setForm({...form, ratePerPiece: Number(e.target.value)})}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Frame Deduction (mm)</label>
              <input
                type="number"
                value={form.deductions.frame}
                onChange={(e) => setForm({...form, deductions: {...form.deductions, frame: Number(e.target.value)}})}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Sash Deduction (mm)</label>
              <input
                type="number"
                value={form.deductions.sash}
                onChange={(e) => setForm({...form, deductions: {...form.deductions, sash: Number(e.target.value)}})}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Color</label>
              <input
                value={form.color}
                onChange={(e) => setForm({...form, color: e.target.value})}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Pricing Mode</label>
              <select
                value={form.pricingMode}
                onChange={(e) => setForm({...form, pricingMode: e.target.value as any})}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                <option value="METER">Per Meter</option>
                <option value="PIECE">Per Piece</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({...form, isActive: e.target.checked})}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-slate-300">Active</span>
          </label>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-xl bg-slate-700 text-white">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-purple-600 text-white">
              {profile ? 'Update' : 'Add'} Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
