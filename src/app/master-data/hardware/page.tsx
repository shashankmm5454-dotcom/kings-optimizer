'use client'

import { useState, useEffect } from 'react'

// ===============================================
// HARDWARE ITEMS MASTER DATA PAGE
// Sprint 1 - Hardware Inventory Management
// ===============================================

interface HardwareItem {
  id: string
  name: string
  category: 'ROLLER' | 'LOCK' | 'HANDLE' | 'HINGE' | 'INTERLOCK' | 'GASKET' | 'PILE' | 'SCREW' | 'ANCHOR' | 'OTHER'
  unit: 'PCS' | 'MTR' | 'KG' | 'SET' | 'PAIR'
  rate: number
  calculationRule: {
    type: 'PER_WINDOW' | 'PER_SASH' | 'PER_METER' | 'PER_SQFT' | 'FIXED' | 'FORMULA'
    formula?: string
    applicableTo?: string[]
  }
  variants?: { name: string; rate: number }[]
  brand?: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'kings-optimizer-hardware'

const defaultHardware: HardwareItem[] = [
  { id: '1', name: 'Roller 22mm', category: 'ROLLER', unit: 'PCS', rate: 85, calculationRule: { type: 'PER_SASH', formula: 'SASH_COUNT * 4' }, brand: 'EBCO', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Multi-Point Lock', category: 'LOCK', unit: 'SET', rate: 450, calculationRule: { type: 'PER_SASH' }, brand: 'ROTO', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', name: 'Handle Standard', category: 'HANDLE', unit: 'PCS', rate: 180, calculationRule: { type: 'PER_SASH' }, brand: 'HOPPE', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', name: 'Friction Stay 12"', category: 'HINGE', unit: 'PAIR', rate: 280, calculationRule: { type: 'PER_SASH', applicableTo: ['CO', 'CF'] }, brand: 'ASSA', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '5', name: 'Interlock Profile', category: 'INTERLOCK', unit: 'MTR', rate: 120, calculationRule: { type: 'PER_METER', formula: 'H * SASH_COUNT' }, brand: 'FENSTAS', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '6', name: 'EPDM Gasket', category: 'GASKET', unit: 'MTR', rate: 35, calculationRule: { type: 'PER_METER', formula: '4 * (W + H)' }, brand: 'FENSTAS', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '7', name: 'Woollen Pile 5mm', category: 'PILE', unit: 'MTR', rate: 25, calculationRule: { type: 'PER_METER', formula: '2 * SASH_COUNT * (SW + SH)' }, brand: 'GENERIC', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '8', name: 'Anchor Clip', category: 'ANCHOR', unit: 'PCS', rate: 8, calculationRule: { type: 'FORMULA', formula: 'Math.ceil((W + H) / 300) * 2' }, brand: 'GENERIC', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '9', name: 'Frame Screw 25mm', category: 'SCREW', unit: 'PCS', rate: 2, calculationRule: { type: 'FORMULA', formula: 'Math.ceil((W + H) / 150) * 4' }, brand: 'GENERIC', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '10', name: 'Casement Hinge', category: 'HINGE', unit: 'SET', rate: 350, calculationRule: { type: 'PER_SASH', applicableTo: ['CO', 'CF', 'FDCO'] }, brand: 'ROTO', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

export default function HardwarePage() {
  const [hardware, setHardware] = useState<HardwareItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('ALL')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<HardwareItem | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setHardware(JSON.parse(saved))
    } else {
      setHardware(defaultHardware)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultHardware))
    }
    setLoading(false)
  }, [])

  const saveHardware = (items: HardwareItem[]) => {
    setHardware(items)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }

  const addItem = (item: Omit<HardwareItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: HardwareItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveHardware([...hardware, newItem])
    setShowAddModal(false)
  }

  const updateItem = (id: string, updates: Partial<HardwareItem>) => {
    saveHardware(hardware.map(h => h.id === id ? { ...h, ...updates, updatedAt: new Date().toISOString() } : h))
    setEditingItem(null)
  }

  const deleteItem = (id: string) => {
    if (confirm('Delete this item?')) {
      saveHardware(hardware.filter(h => h.id !== id))
    }
  }

  const duplicateItem = (item: HardwareItem) => {
    const newItem: HardwareItem = {
      ...item,
      id: Date.now().toString(),
      name: `${item.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveHardware([...hardware, newItem])
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(hardware, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hardware.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredHardware = hardware.filter(h => {
    if (filterCategory !== 'ALL' && h.category !== filterCategory) return false
    if (searchQuery && !h.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const categories: HardwareItem['category'][] = ['ROLLER', 'LOCK', 'HANDLE', 'HINGE', 'INTERLOCK', 'GASKET', 'PILE', 'SCREW', 'ANCHOR', 'OTHER']
  const units: HardwareItem['unit'][] = ['PCS', 'MTR', 'KG', 'SET', 'PAIR']
  const ruleTypes = ['PER_WINDOW', 'PER_SASH', 'PER_METER', 'PER_SQFT', 'FIXED', 'FORMULA']
  const formatCurrency = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })

  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, string> = {
      ROLLER: '🔄', LOCK: '🔐', HANDLE: '🚪', HINGE: '🔗', INTERLOCK: '🔒',
      GASKET: '⭕', PILE: '〰️', SCREW: '🔩', ANCHOR: '⚓', OTHER: '📦'
    }
    return icons[cat] || '📦'
  }

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">🔩 Hardware Items</h1>
          <p className="text-slate-400 text-sm">Manage hardware inventory • {hardware.length} items</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-500">
            + Add Item
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
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
        >
          <option value="ALL">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{getCategoryIcon(c)} {c}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat === filterCategory ? 'ALL' : cat)}
            className={`p-3 rounded-xl border text-center transition-all ${
              filterCategory === cat
                ? 'bg-purple-600/30 border-purple-500'
                : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
            }`}
          >
            <div className="text-xl mb-1">{getCategoryIcon(cat)}</div>
            <div className="text-lg font-bold text-white">{hardware.filter(h => h.category === cat).length}</div>
            <div className="text-[10px] text-slate-500">{cat}</div>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Item</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Category</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Unit</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Rate</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Calculation Rule</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Brand</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Status</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHardware.map(item => (
                <tr key={item.id} className="border-t border-slate-700/30 hover:bg-slate-800/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(item.category)}</span>
                      <span className="text-white font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-400">{item.unit}</td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-mono">{formatCurrency(item.rate)}</td>
                  <td className="py-3 px-4">
                    <div className="text-xs">
                      <span className="text-purple-400">{item.calculationRule.type}</span>
                      {item.calculationRule.formula && (
                        <span className="text-slate-500 ml-2 font-mono">{item.calculationRule.formula}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{item.brand || '-'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`w-2 h-2 rounded-full inline-block ${item.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setEditingItem(item)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white">✏️</button>
                      <button onClick={() => duplicateItem(item)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white">📋</button>
                      <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingItem) && (
        <HardwareModal
          item={editingItem}
          onSave={(item) => editingItem ? updateItem(editingItem.id, item) : addItem(item as any)}
          onClose={() => { setShowAddModal(false); setEditingItem(null) }}
          categories={categories}
          units={units}
          ruleTypes={ruleTypes}
        />
      )}
    </div>
  )
}

function HardwareModal({ item, onSave, onClose, categories, units, ruleTypes }: {
  item: HardwareItem | null
  onSave: (item: Partial<HardwareItem>) => void
  onClose: () => void
  categories: string[]
  units: string[]
  ruleTypes: string[]
}) {
  const [form, setForm] = useState({
    name: item?.name || '',
    category: item?.category || 'OTHER',
    unit: item?.unit || 'PCS',
    rate: item?.rate || 0,
    calculationRule: item?.calculationRule || { type: 'PER_SASH' as any },
    brand: item?.brand || '',
    description: item?.description || '',
    isActive: item?.isActive ?? true,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-4">{item ? 'Edit Item' : 'Add New Item'}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              placeholder="Roller 22mm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Unit *</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Rate (₹)</label>
              <input
                type="number"
                value={form.rate}
                onChange={(e) => setForm({ ...form, rate: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Brand</label>
              <input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                placeholder="EBCO"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Calculation Rule</label>
            <select
              value={form.calculationRule.type}
              onChange={(e) => setForm({ ...form, calculationRule: { ...form.calculationRule, type: e.target.value as any } })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
            >
              {ruleTypes.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {form.calculationRule.type === 'FORMULA' && (
            <div>
              <label className="block text-xs text-slate-500 mb-1">Formula</label>
              <input
                value={form.calculationRule.formula || ''}
                onChange={(e) => setForm({ ...form, calculationRule: { ...form.calculationRule, formula: e.target.value } })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm"
                placeholder="SASH_COUNT * 4"
              />
              <p className="text-[10px] text-slate-600 mt-1">Variables: W, H, SW, SH, SASH_COUNT, PANEL_COUNT</p>
            </div>
          )}

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
            <button onClick={() => onSave(form)} className="flex-1 px-4 py-2 rounded-xl bg-purple-600 text-white">{item ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
