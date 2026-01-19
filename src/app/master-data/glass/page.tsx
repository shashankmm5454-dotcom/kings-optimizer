'use client'

import { useState, useEffect } from 'react'

// ===============================================
// GLASS OPTIONS MASTER DATA PAGE
// Sprint 1 - Glass Library Management
// ===============================================

interface GlassVariant {
  thickness: string
  ratePerSqft: number
  ratePerSqm: number
  weight: number
}

interface GlassOption {
  id: string
  name: string
  type: 'FLOAT' | 'TOUGHENED' | 'LAMINATED' | 'DGU' | 'FROSTED' | 'REFLECTIVE'
  variants: GlassVariant[]
  stockSizes: { width: number; height: number; ratePerSheet: number }[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'kings-optimizer-glass'

const defaultGlass: GlassOption[] = [
  { id: '1', name: 'Clear Float', type: 'FLOAT', variants: [
    { thickness: '4mm', ratePerSqft: 18, ratePerSqm: 194, weight: 10 },
    { thickness: '5mm', ratePerSqft: 22, ratePerSqm: 237, weight: 12.5 },
    { thickness: '6mm', ratePerSqft: 28, ratePerSqm: 301, weight: 15 },
  ], stockSizes: [{ width: 2440, height: 1830, ratePerSheet: 2800 }], isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Tinted Blue', type: 'FLOAT', variants: [
    { thickness: '5mm', ratePerSqft: 32, ratePerSqm: 344, weight: 12.5 },
    { thickness: '6mm', ratePerSqft: 38, ratePerSqm: 409, weight: 15 },
  ], stockSizes: [{ width: 2440, height: 1830, ratePerSheet: 3800 }], isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', name: 'Toughened Clear', type: 'TOUGHENED', variants: [
    { thickness: '5mm', ratePerSqft: 55, ratePerSqm: 592, weight: 12.5 },
    { thickness: '6mm', ratePerSqft: 65, ratePerSqm: 699, weight: 15 },
    { thickness: '8mm', ratePerSqft: 85, ratePerSqm: 915, weight: 20 },
    { thickness: '10mm', ratePerSqft: 105, ratePerSqm: 1130, weight: 25 },
    { thickness: '12mm', ratePerSqft: 125, ratePerSqm: 1345, weight: 30 },
  ], stockSizes: [], isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', name: 'DGU Clear', type: 'DGU', variants: [
    { thickness: '5+5mm', ratePerSqft: 120, ratePerSqm: 1292, weight: 25 },
    { thickness: '5+6mm', ratePerSqft: 135, ratePerSqm: 1453, weight: 27.5 },
    { thickness: '6+6mm', ratePerSqft: 150, ratePerSqm: 1615, weight: 30 },
  ], stockSizes: [], isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '5', name: 'Frosted', type: 'FROSTED', variants: [
    { thickness: '5mm', ratePerSqft: 45, ratePerSqm: 484, weight: 12.5 },
    { thickness: '6mm', ratePerSqft: 55, ratePerSqm: 592, weight: 15 },
  ], stockSizes: [], isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '6', name: 'Laminated', type: 'LAMINATED', variants: [
    { thickness: '5+5mm', ratePerSqft: 95, ratePerSqm: 1022, weight: 25 },
    { thickness: '6+6mm', ratePerSqft: 115, ratePerSqm: 1238, weight: 30 },
  ], stockSizes: [], isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

export default function GlassPage() {
  const [glassOptions, setGlassOptions] = useState<GlassOption[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingGlass, setEditingGlass] = useState<GlassOption | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setGlassOptions(JSON.parse(saved))
    } else {
      setGlassOptions(defaultGlass)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultGlass))
    }
    setLoading(false)
  }, [])

  const saveGlassOptions = (options: GlassOption[]) => {
    setGlassOptions(options)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(options))
  }

  const addGlass = (glass: Omit<GlassOption, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGlass: GlassOption = {
      ...glass,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveGlassOptions([...glassOptions, newGlass])
    setShowAddModal(false)
  }

  const updateGlass = (id: string, updates: Partial<GlassOption>) => {
    saveGlassOptions(glassOptions.map(g => g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g))
    setEditingGlass(null)
  }

  const deleteGlass = (id: string) => {
    if (confirm('Delete this glass option?')) {
      saveGlassOptions(glassOptions.filter(g => g.id !== id))
    }
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(glassOptions, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'glass-options.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredGlass = glassOptions.filter(g => {
    if (filterType !== 'ALL' && g.type !== filterType) return false
    if (searchQuery && !g.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const types: GlassOption['type'][] = ['FLOAT', 'TOUGHENED', 'LAMINATED', 'DGU', 'FROSTED', 'REFLECTIVE']
  const formatCurrency = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">💎 Glass Options</h1>
          <p className="text-slate-400 text-sm">Manage glass types & rates • {glassOptions.length} options</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-500">
            + Add Glass
          </button>
          <button onClick={exportData} className="px-4 py-2 rounded-xl bg-slate-700 text-white hover:bg-slate-600">📤 Export</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 w-64"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
        >
          <option value="ALL">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {types.map(type => (
          <div key={type} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
            <div className="text-xl font-bold text-white">{glassOptions.filter(g => g.type === type).length}</div>
            <div className="text-xs text-slate-500">{type}</div>
          </div>
        ))}
      </div>

      {/* Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGlass.map(glass => (
          <div key={glass.id} className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-white font-bold text-lg">{glass.name}</div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  glass.type === 'FLOAT' ? 'bg-blue-500/20 text-blue-400' :
                  glass.type === 'TOUGHENED' ? 'bg-emerald-500/20 text-emerald-400' :
                  glass.type === 'DGU' ? 'bg-purple-500/20 text-purple-400' :
                  glass.type === 'LAMINATED' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {glass.type}
                </span>
              </div>
              <span className={`w-3 h-3 rounded-full ${glass.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </div>

            {/* Variants Table */}
            <div className="rounded-xl bg-slate-900/50 overflow-hidden mb-4">
              <table className="w-full text-xs">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="text-left py-2 px-3 text-slate-400">Thickness</th>
                    <th className="text-right py-2 px-3 text-slate-400">₹/sqft</th>
                    <th className="text-right py-2 px-3 text-slate-400">₹/sqm</th>
                    <th className="text-right py-2 px-3 text-slate-400">kg/m²</th>
                  </tr>
                </thead>
                <tbody>
                  {glass.variants.map((v, i) => (
                    <tr key={i} className="border-t border-slate-700/30">
                      <td className="py-2 px-3 text-cyan-400 font-mono">{v.thickness}</td>
                      <td className="py-2 px-3 text-right text-emerald-400 font-mono">{v.ratePerSqft}</td>
                      <td className="py-2 px-3 text-right text-white font-mono">{v.ratePerSqm}</td>
                      <td className="py-2 px-3 text-right text-slate-400 font-mono">{v.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setEditingGlass(glass)} className="flex-1 px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs hover:bg-slate-600">Edit</button>
              <button onClick={() => deleteGlass(glass.id)} className="px-3 py-1.5 rounded-lg bg-slate-700 text-red-400 text-xs hover:bg-red-500/20">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingGlass) && (
        <GlassModal
          glass={editingGlass}
          onSave={(g) => editingGlass ? updateGlass(editingGlass.id, g) : addGlass(g as any)}
          onClose={() => { setShowAddModal(false); setEditingGlass(null) }}
          types={types}
        />
      )}
    </div>
  )
}

function GlassModal({ glass, onSave, onClose, types }: { 
  glass: GlassOption | null
  onSave: (g: Partial<GlassOption>) => void
  onClose: () => void
  types: string[]
}) {
  const [form, setForm] = useState({
    name: glass?.name || '',
    type: glass?.type || 'FLOAT',
    variants: glass?.variants || [{ thickness: '5mm', ratePerSqft: 22, ratePerSqm: 237, weight: 12.5 }],
    stockSizes: glass?.stockSizes || [],
    isActive: glass?.isActive ?? true,
  })

  const addVariant = () => {
    setForm({ ...form, variants: [...form.variants, { thickness: '', ratePerSqft: 0, ratePerSqm: 0, weight: 0 }] })
  }

  const updateVariant = (index: number, updates: Partial<GlassVariant>) => {
    const newVariants = [...form.variants]
    newVariants[index] = { ...newVariants[index], ...updates }
    setForm({ ...form, variants: newVariants })
  }

  const removeVariant = (index: number) => {
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== index) })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-4">{glass ? 'Edit Glass' : 'Add New Glass'}</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                placeholder="Clear Float"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-500">Variants</label>
              <button type="button" onClick={addVariant} className="text-xs text-purple-400 hover:text-purple-300">+ Add</button>
            </div>
            <div className="space-y-2">
              {form.variants.map((v, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    value={v.thickness}
                    onChange={(e) => updateVariant(i, { thickness: e.target.value })}
                    placeholder="5mm"
                    className="w-20 px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm"
                  />
                  <input
                    type="number"
                    value={v.ratePerSqft}
                    onChange={(e) => updateVariant(i, { ratePerSqft: Number(e.target.value) })}
                    placeholder="₹/sqft"
                    className="w-20 px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm"
                  />
                  <input
                    type="number"
                    value={v.ratePerSqm}
                    onChange={(e) => updateVariant(i, { ratePerSqm: Number(e.target.value) })}
                    placeholder="₹/sqm"
                    className="w-20 px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm"
                  />
                  <input
                    type="number"
                    value={v.weight}
                    onChange={(e) => updateVariant(i, { weight: Number(e.target.value) })}
                    placeholder="kg/m²"
                    className="w-16 px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm"
                  />
                  <button onClick={() => removeVariant(i)} className="text-red-400 hover:text-red-300">✕</button>
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-slate-300">Active</span>
          </label>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-xl bg-slate-700 text-white">Cancel</button>
            <button onClick={() => onSave(form)} className="flex-1 px-4 py-2 rounded-xl bg-purple-600 text-white">{glass ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
