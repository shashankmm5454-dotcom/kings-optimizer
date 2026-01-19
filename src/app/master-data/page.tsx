'use client'

import { useState, useEffect } from 'react'

// ==========================================
// MASTER DATA MANAGEMENT PAGE
// Manage Profiles, Glass, Hardware, Window Types
// ==========================================

// Types (inline for now, will move to types/index.ts)
interface UPVCProfile {
  id: string
  code: string
  name: string
  family: string
  brand: string
  stockLength: number
  weightPerMeter: number
  ratePerMeter: number
  ratePerPiece: number
  pricingMode: 'METER' | 'PIECE'
  deductions: { frame: number; sash: number; beading: number }
  color: string
  isActive: boolean
}

interface GlassOption {
  id: string
  name: string
  displayName: string
  type: string
  variants: { id: string; thickness: string; ratePerSqft: number; ratePerSqm: number; weightPerSqm: number; isDefault: boolean }[]
  stockSizes: { id: string; width: number; height: number; ratePerSheet: number; label: string }[]
  color: string
  opacity: number
  isActive: boolean
}

interface HardwareItem {
  id: string
  name: string
  code: string
  category: string
  description: string
  unit: string
  rate: number
  variants: { id: string; name: string; rate: number; isDefault: boolean }[]
  calculationRule: { type: string; formula: string; multiplier: number; applicableTypes: string[] }
  isActive: boolean
}

interface WindowType {
  id: string
  code: string
  name: string
  category: string
  description: string
  svg: string
  panelCount: number
  hasMesh: boolean
  isSystem: boolean
  isActive: boolean
}

export default function MasterDataPage() {
  // Active tab
  const [activeTab, setActiveTab] = useState<'profiles' | 'glass' | 'hardware' | 'windowTypes'>('profiles')
  
  // ==================== PROFILES STATE ====================
  const [profiles, setProfiles] = useState<UPVCProfile[]>([
    { id: '1', code: 'FR-60', name: 'Frame 60mm', family: 'FRAME', brand: 'FENSTAS', stockLength: 6500, weightPerMeter: 1.2, ratePerMeter: 185, ratePerPiece: 1200, pricingMode: 'METER', deductions: { frame: 0, sash: 40, beading: 10 }, color: 'White', isActive: true },
    { id: '2', code: 'SH-60', name: 'Sash 60mm', family: 'SASH', brand: 'FENSTAS', stockLength: 6500, weightPerMeter: 0.9, ratePerMeter: 165, ratePerPiece: 1070, pricingMode: 'METER', deductions: { frame: 40, sash: 0, beading: 10 }, color: 'White', isActive: true },
    { id: '3', code: 'IL-60', name: 'Interlock 60mm', family: 'INTERLOCK', brand: 'FENSTAS', stockLength: 6500, weightPerMeter: 0.5, ratePerMeter: 95, ratePerPiece: 620, pricingMode: 'METER', deductions: { frame: 0, sash: 0, beading: 0 }, color: 'White', isActive: true },
    { id: '4', code: 'BD-19', name: 'Beading 19mm', family: 'BEADING', brand: 'FENSTAS', stockLength: 6500, weightPerMeter: 0.3, ratePerMeter: 45, ratePerPiece: 290, pricingMode: 'METER', deductions: { frame: 0, sash: 0, beading: 0 }, color: 'White', isActive: true },
    { id: '5', code: 'ML-60', name: 'Mullion 60mm', family: 'MULLION', brand: 'FENSTAS', stockLength: 6500, weightPerMeter: 1.0, ratePerMeter: 175, ratePerPiece: 1140, pricingMode: 'METER', deductions: { frame: 0, sash: 0, beading: 0 }, color: 'White', isActive: true },
  ])
  const [profileFilter, setProfileFilter] = useState({ family: '', brand: '', search: '' })
  const [editingProfile, setEditingProfile] = useState<UPVCProfile | null>(null)
  const [showProfileForm, setShowProfileForm] = useState(false)

  // ==================== GLASS STATE ====================
  const [glassOptions, setGlassOptions] = useState<GlassOption[]>([
    { 
      id: '1', name: 'CLEAR', displayName: 'Clear Float Glass', type: 'FLOAT', 
      variants: [
        { id: 'v1', thickness: '4mm', ratePerSqft: 35, ratePerSqm: 375, weightPerSqm: 10, isDefault: false },
        { id: 'v2', thickness: '5mm', ratePerSqft: 42, ratePerSqm: 450, weightPerSqm: 12.5, isDefault: true },
        { id: 'v3', thickness: '6mm', ratePerSqft: 52, ratePerSqm: 560, weightPerSqm: 15, isDefault: false },
      ],
      stockSizes: [
        { id: 's1', width: 2440, height: 1830, ratePerSheet: 2800, label: '8x6 ft' },
        { id: 's2', width: 3050, height: 2140, ratePerSheet: 4200, label: '10x7 ft' },
      ],
      color: '#e8f4fc', opacity: 0.15, isActive: true 
    },
    { 
      id: '2', name: 'TINTED', displayName: 'Tinted Glass (Green/Blue)', type: 'TINTED', 
      variants: [
        { id: 'v1', thickness: '5mm', ratePerSqft: 55, ratePerSqm: 590, weightPerSqm: 12.5, isDefault: true },
        { id: 'v2', thickness: '6mm', ratePerSqft: 65, ratePerSqm: 700, weightPerSqm: 15, isDefault: false },
      ],
      stockSizes: [
        { id: 's1', width: 2440, height: 1830, ratePerSheet: 3500, label: '8x6 ft' },
      ],
      color: '#b8d4e3', opacity: 0.3, isActive: true 
    },
    { 
      id: '3', name: 'FROSTED', displayName: 'Frosted/Acid Etched', type: 'FROSTED', 
      variants: [
        { id: 'v1', thickness: '5mm', ratePerSqft: 85, ratePerSqm: 915, weightPerSqm: 12.5, isDefault: true },
      ],
      stockSizes: [],
      color: '#f0f0f0', opacity: 0.8, isActive: true 
    },
    { 
      id: '4', name: 'TOUGHENED', displayName: 'Toughened Safety Glass', type: 'TOUGHENED', 
      variants: [
        { id: 'v1', thickness: '5mm', ratePerSqft: 95, ratePerSqm: 1020, weightPerSqm: 12.5, isDefault: false },
        { id: 'v2', thickness: '6mm', ratePerSqft: 110, ratePerSqm: 1180, weightPerSqm: 15, isDefault: true },
        { id: 'v3', thickness: '8mm', ratePerSqft: 145, ratePerSqm: 1560, weightPerSqm: 20, isDefault: false },
        { id: 'v4', thickness: '10mm', ratePerSqft: 185, ratePerSqm: 1990, weightPerSqm: 25, isDefault: false },
        { id: 'v5', thickness: '12mm', ratePerSqft: 220, ratePerSqm: 2370, weightPerSqm: 30, isDefault: false },
      ],
      stockSizes: [],
      color: '#d0e8f0', opacity: 0.1, isActive: true 
    },
    { 
      id: '5', name: 'DGU', displayName: 'Double Glazed Unit', type: 'DGU', 
      variants: [
        { id: 'v1', thickness: '5+12+5', ratePerSqft: 250, ratePerSqm: 2690, weightPerSqm: 25, isDefault: true },
        { id: 'v2', thickness: '6+12+6', ratePerSqft: 290, ratePerSqm: 3120, weightPerSqm: 30, isDefault: false },
      ],
      stockSizes: [],
      color: '#c8e0f0', opacity: 0.2, isActive: true 
    },
  ])
  const [editingGlass, setEditingGlass] = useState<GlassOption | null>(null)
  const [showGlassForm, setShowGlassForm] = useState(false)

  // ==================== HARDWARE STATE ====================
  const [hardwareItems, setHardwareItems] = useState<HardwareItem[]>([
    { id: '1', name: 'Roller 22mm (Sliding)', code: 'ROL-22', category: 'ROLLER', description: 'Standard sliding window roller', unit: 'PCS', rate: 85, variants: [{ id: 'v1', name: '22mm', rate: 85, isDefault: true }, { id: 'v2', name: '28mm', rate: 95, isDefault: false }], calculationRule: { type: 'PER_SASH', formula: 'SASH_COUNT * 2', multiplier: 2, applicableTypes: ['2T', '3T', '4T', 'FD2P', 'FD3P', 'FD4P'] }, isActive: true },
    { id: '2', name: 'Multi-Point Lock', code: 'LCK-MP', category: 'LOCK', description: 'Multi-point locking system', unit: 'PCS', rate: 450, variants: [], calculationRule: { type: 'PER_WINDOW', formula: '1', multiplier: 1, applicableTypes: ['CO', 'FDCO'] }, isActive: true },
    { id: '3', name: 'Sliding Lock', code: 'LCK-SL', category: 'LOCK', description: 'Standard sliding window lock', unit: 'PCS', rate: 180, variants: [], calculationRule: { type: 'PER_WINDOW', formula: '1', multiplier: 1, applicableTypes: ['2T', '3T', '4T'] }, isActive: true },
    { id: '4', name: 'Handle (Standard)', code: 'HDL-ST', category: 'HANDLE', description: 'Standard window handle', unit: 'PCS', rate: 180, variants: [{ id: 'v1', name: 'White', rate: 180, isDefault: true }, { id: 'v2', name: 'Black', rate: 190, isDefault: false }, { id: 'v3', name: 'Gold', rate: 250, isDefault: false }], calculationRule: { type: 'PER_SASH', formula: 'SASH_COUNT', multiplier: 1, applicableTypes: [] }, isActive: true },
    { id: '5', name: 'Interlock (3 Track)', code: 'INT-3T', category: 'INTERLOCK', description: '3-track interlock profile', unit: 'MTR', rate: 120, variants: [], calculationRule: { type: 'PER_METER_SASH', formula: 'SH / 1000 * SASH_COUNT', multiplier: 1, applicableTypes: ['2T', '3T', '4T'] }, isActive: true },
    { id: '6', name: 'Woollen Pile', code: 'PIL-WL', category: 'PILE', description: 'Weather sealing pile', unit: 'MTR', rate: 25, variants: [{ id: 'v1', name: '5mm', rate: 25, isDefault: true }, { id: 'v2', name: '7mm', rate: 32, isDefault: false }], calculationRule: { type: 'PER_METER_FRAME', formula: '2 * (W + H) / 1000', multiplier: 1, applicableTypes: [] }, isActive: true },
    { id: '7', name: 'EPDM Gasket', code: 'GSK-EP', category: 'GASKET', description: 'EPDM rubber gasket', unit: 'MTR', rate: 35, variants: [], calculationRule: { type: 'FORMULA', formula: 'GLASS_COUNT * 2 * (SW + SH) / 1000', multiplier: 1, applicableTypes: [] }, isActive: true },
    { id: '8', name: 'Friction Stay Hinge', code: 'HNG-FS', category: 'HINGE', description: 'Friction stay for casement', unit: 'PAIR', rate: 350, variants: [{ id: 'v1', name: '12 inch', rate: 350, isDefault: true }, { id: 'v2', name: '16 inch', rate: 420, isDefault: false }, { id: 'v3', name: '22 inch', rate: 520, isDefault: false }], calculationRule: { type: 'PER_SASH', formula: 'SASH_COUNT', multiplier: 1, applicableTypes: ['CO', 'VRH', 'VLH', 'VTH'] }, isActive: true },
    { id: '9', name: 'Screws (Self Tapping)', code: 'SCR-ST', category: 'SCREW', description: 'Self-tapping screws for UPVC', unit: 'BOX', rate: 180, variants: [{ id: 'v1', name: '1" Box (100)', rate: 180, isDefault: true }], calculationRule: { type: 'PER_SQFT', formula: 'SQFT * 0.1', multiplier: 0.1, applicableTypes: [] }, isActive: true },
    { id: '10', name: 'Corner Cleats', code: 'CRN-CL', category: 'CORNER', description: 'UPVC corner reinforcement', unit: 'PCS', rate: 45, variants: [], calculationRule: { type: 'FORMULA', formula: '(PANEL_COUNT + 1) * 4', multiplier: 1, applicableTypes: [] }, isActive: true },
  ])
  const [hardwareFilter, setHardwareFilter] = useState({ category: '', search: '' })
  const [editingHardware, setEditingHardware] = useState<HardwareItem | null>(null)
  const [showHardwareForm, setShowHardwareForm] = useState(false)

  // ==================== WINDOW TYPES STATE ====================
  const [windowTypes, setWindowTypes] = useState<WindowType[]>([
    { id: '1', code: '2T', name: '2 Track Sliding', category: 'SLIDING', description: 'Standard 2-panel sliding window', svg: '', panelCount: 2, hasMesh: false, isSystem: true, isActive: true },
    { id: '2', code: '2+1', name: '2+1 with Mesh', category: 'SLIDING', description: '2 glass panels + 1 mesh panel', svg: '', panelCount: 3, hasMesh: true, isSystem: true, isActive: true },
    { id: '3', code: '3T', name: '3 Track Sliding', category: 'SLIDING', description: '3-panel sliding window', svg: '', panelCount: 3, hasMesh: false, isSystem: true, isActive: true },
    { id: '4', code: '4T', name: '4 Track Sliding', category: 'SLIDING', description: '4-panel sliding window', svg: '', panelCount: 4, hasMesh: false, isSystem: true, isActive: true },
    { id: '5', code: 'FIX', name: 'Fixed Panel', category: 'FIXED', description: 'Non-opening fixed glass panel', svg: '', panelCount: 1, hasMesh: false, isSystem: true, isActive: true },
    { id: '6', code: 'CO', name: 'Casement Open', category: 'CASEMENT', description: 'Side-hung opening casement', svg: '', panelCount: 1, hasMesh: false, isSystem: true, isActive: true },
    { id: '7', code: 'CF', name: 'Casement Fixed', category: 'CASEMENT', description: 'Casement style fixed panel', svg: '', panelCount: 1, hasMesh: false, isSystem: true, isActive: true },
    { id: '8', code: 'VRH', name: 'Vent Right Hung', category: 'VENTILATOR', description: 'Top ventilator right hinged', svg: '', panelCount: 1, hasMesh: false, isSystem: true, isActive: true },
    { id: '9', code: 'VLH', name: 'Vent Left Hung', category: 'VENTILATOR', description: 'Top ventilator left hinged', svg: '', panelCount: 1, hasMesh: false, isSystem: true, isActive: true },
    { id: '10', code: 'FD2P', name: 'Sliding Door 2P', category: 'DOOR', description: '2-panel sliding door', svg: '', panelCount: 2, hasMesh: false, isSystem: true, isActive: true },
    { id: '11', code: 'FD3P', name: 'Sliding Door 3P', category: 'DOOR', description: '3-panel sliding door', svg: '', panelCount: 3, hasMesh: false, isSystem: true, isActive: true },
    { id: '12', code: 'FD4P', name: 'Sliding Door 4P', category: 'DOOR', description: '4-panel sliding door', svg: '', panelCount: 4, hasMesh: false, isSystem: true, isActive: true },
    { id: '13', code: 'FDCO', name: 'Casement Door', category: 'DOOR', description: 'Hinged casement door', svg: '', panelCount: 1, hasMesh: false, isSystem: true, isActive: true },
  ])
  const [editingWindowType, setEditingWindowType] = useState<WindowType | null>(null)
  const [showWindowTypeForm, setShowWindowTypeForm] = useState(false)

  // ==================== COMMON ====================
  const [importMode, setImportMode] = useState(false)
  const [exportData, setExportData] = useState('')

  // Helper functions
  const generateId = () => Math.random().toString(36).substr(2, 9)
  const formatCurrency = (n: number) => '₹' + n.toLocaleString('en-IN')

  // Profile families
  const profileFamilies = ['FRAME', 'SASH', 'MULLION', 'TRANSOM', 'BEADING', 'INTERLOCK', 'ADDON', 'MESH_FRAME', 'SHUTTER']
  const brands = [...new Set(profiles.map(p => p.brand))]
  
  // Hardware categories
  const hardwareCategories = ['ROLLER', 'LOCK', 'HANDLE', 'HINGE', 'INTERLOCK', 'GASKET', 'PILE', 'SCREW', 'ANCHOR', 'CORNER', 'DRAINAGE', 'REINFORCEMENT', 'OTHER']
  const hardwareUnits = ['PCS', 'MTR', 'KG', 'SET', 'PAIR', 'BOX']
  const calculationRuleTypes = ['PER_WINDOW', 'PER_SASH', 'PER_PANEL', 'PER_METER_FRAME', 'PER_METER_SASH', 'PER_SQFT', 'FIXED', 'FORMULA']

  // Glass types
  const glassTypes = ['FLOAT', 'TOUGHENED', 'LAMINATED', 'DGU', 'FROSTED', 'REFLECTIVE', 'TINTED']

  // Window categories
  const windowCategories = ['SLIDING', 'CASEMENT', 'FIXED', 'VENTILATOR', 'DOOR', 'COMBINATION', 'CUSTOM']

  // ==================== PROFILE HANDLERS ====================
  const handleSaveProfile = (profile: UPVCProfile) => {
    if (profile.id) {
      setProfiles(profiles.map(p => p.id === profile.id ? profile : p))
    } else {
      setProfiles([...profiles, { ...profile, id: generateId() }])
    }
    setShowProfileForm(false)
    setEditingProfile(null)
  }

  const handleDeleteProfile = (id: string) => {
    if (confirm('Delete this profile? This action cannot be undone.')) {
      setProfiles(profiles.filter(p => p.id !== id))
    }
  }

  const filteredProfiles = profiles.filter(p => {
    if (profileFilter.family && p.family !== profileFilter.family) return false
    if (profileFilter.brand && p.brand !== profileFilter.brand) return false
    if (profileFilter.search && !p.name.toLowerCase().includes(profileFilter.search.toLowerCase()) && !p.code.toLowerCase().includes(profileFilter.search.toLowerCase())) return false
    return true
  })

  // ==================== GLASS HANDLERS ====================
  const handleSaveGlass = (glass: GlassOption) => {
    if (glass.id) {
      setGlassOptions(glassOptions.map(g => g.id === glass.id ? glass : g))
    } else {
      setGlassOptions([...glassOptions, { ...glass, id: generateId() }])
    }
    setShowGlassForm(false)
    setEditingGlass(null)
  }

  const handleDeleteGlass = (id: string) => {
    if (confirm('Delete this glass option? This action cannot be undone.')) {
      setGlassOptions(glassOptions.filter(g => g.id !== id))
    }
  }

  // ==================== HARDWARE HANDLERS ====================
  const handleSaveHardware = (item: HardwareItem) => {
    if (item.id) {
      setHardwareItems(hardwareItems.map(h => h.id === item.id ? item : h))
    } else {
      setHardwareItems([...hardwareItems, { ...item, id: generateId() }])
    }
    setShowHardwareForm(false)
    setEditingHardware(null)
  }

  const handleDeleteHardware = (id: string) => {
    if (confirm('Delete this hardware item? This action cannot be undone.')) {
      setHardwareItems(hardwareItems.filter(h => h.id !== id))
    }
  }

  const filteredHardware = hardwareItems.filter(h => {
    if (hardwareFilter.category && h.category !== hardwareFilter.category) return false
    if (hardwareFilter.search && !h.name.toLowerCase().includes(hardwareFilter.search.toLowerCase()) && !h.code.toLowerCase().includes(hardwareFilter.search.toLowerCase())) return false
    return true
  })

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📦 Master Data Management</h1>
          <p className="text-slate-400">Manage your UPVC profiles, glass options, hardware items, and window type definitions</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'profiles', label: '📐 UPVC Profiles', count: profiles.length },
            { key: 'glass', label: '💎 Glass Options', count: glassOptions.length },
            { key: 'hardware', label: '🔩 Hardware', count: hardwareItems.length },
            { key: 'windowTypes', label: '🪟 Window Types', count: windowTypes.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/50'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-white/20' : 'bg-slate-700'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ==================== PROFILES TAB ==================== */}
        {activeTab === 'profiles' && (
          <div className="space-y-6">
            {/* Filters & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="🔍 Search profiles..."
                  value={profileFilter.search}
                  onChange={(e) => setProfileFilter({...profileFilter, search: e.target.value})}
                  className="px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 w-48"
                />
                <select
                  value={profileFilter.family}
                  onChange={(e) => setProfileFilter({...profileFilter, family: e.target.value})}
                  className="px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white"
                >
                  <option value="">All Families</option>
                  {profileFamilies.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <select
                  value={profileFilter.brand}
                  onChange={(e) => setProfileFilter({...profileFilter, brand: e.target.value})}
                  className="px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white"
                >
                  <option value="">All Brands</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl bg-slate-700 text-white hover:bg-slate-600">
                  📥 Import CSV
                </button>
                <button className="px-4 py-2 rounded-xl bg-slate-700 text-white hover:bg-slate-600">
                  📤 Export
                </button>
                <button 
                  onClick={() => { setEditingProfile(null); setShowProfileForm(true) }}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 font-medium"
                >
                  + Add Profile
                </button>
              </div>
            </div>

            {/* Profiles Table */}
            <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900/80">
                    <tr>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Code</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Family</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Brand</th>
                      <th className="text-right py-3 px-4 text-slate-400 font-medium">Stock (mm)</th>
                      <th className="text-right py-3 px-4 text-slate-400 font-medium">₹/Meter</th>
                      <th className="text-right py-3 px-4 text-slate-400 font-medium">₹/Piece</th>
                      <th className="text-center py-3 px-4 text-slate-400 font-medium">Status</th>
                      <th className="text-center py-3 px-4 text-slate-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfiles.map(profile => (
                      <tr key={profile.id} className="border-t border-slate-700/30 hover:bg-slate-800/30">
                        <td className="py-3 px-4 text-purple-400 font-mono font-semibold">{profile.code}</td>
                        <td className="py-3 px-4 text-white">{profile.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                            {profile.family}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{profile.brand}</td>
                        <td className="py-3 px-4 text-right text-white font-mono">{profile.stockLength}</td>
                        <td className="py-3 px-4 text-right text-emerald-400 font-mono">{formatCurrency(profile.ratePerMeter)}</td>
                        <td className="py-3 px-4 text-right text-slate-400 font-mono">{formatCurrency(profile.ratePerPiece)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${profile.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                            {profile.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-1">
                            <button 
                              onClick={() => { setEditingProfile(profile); setShowProfileForm(true) }}
                              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDeleteProfile(profile.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== GLASS TAB ==================== */}
        {activeTab === 'glass' && (
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-slate-400">Manage glass types with multiple thickness variants and stock sizes</p>
              <button 
                onClick={() => { setEditingGlass(null); setShowGlassForm(true) }}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 font-medium"
              >
                + Add Glass Type
              </button>
            </div>

            {/* Glass Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {glassOptions.map(glass => (
                <div key={glass.id} className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{glass.name}</h3>
                      <p className="text-sm text-slate-400">{glass.displayName}</p>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => { setEditingGlass(glass); setShowGlassForm(true) }}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteGlass(glass.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400">{glass.type}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${glass.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                      {glass.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Variants */}
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 uppercase mb-2">Thickness & Rates</p>
                    <div className="space-y-1">
                      {glass.variants.map(v => (
                        <div key={v.id} className="flex justify-between text-sm">
                          <span className="text-white font-mono">{v.thickness}</span>
                          <span className="text-emerald-400">{formatCurrency(v.ratePerSqft)}/sqft</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stock Sizes */}
                  {glass.stockSizes.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-2">Stock Sizes</p>
                      <div className="flex flex-wrap gap-1">
                        {glass.stockSizes.map(s => (
                          <span key={s.id} className="px-2 py-1 rounded bg-slate-700/50 text-xs text-slate-300">
                            {s.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== HARDWARE TAB ==================== */}
        {activeTab === 'hardware' && (
          <div className="space-y-6">
            {/* Filters & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="🔍 Search hardware..."
                  value={hardwareFilter.search}
                  onChange={(e) => setHardwareFilter({...hardwareFilter, search: e.target.value})}
                  className="px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 w-48"
                />
                <select
                  value={hardwareFilter.category}
                  onChange={(e) => setHardwareFilter({...hardwareFilter, category: e.target.value})}
                  className="px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white"
                >
                  <option value="">All Categories</option>
                  {hardwareCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button 
                onClick={() => { setEditingHardware(null); setShowHardwareForm(true) }}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 font-medium"
              >
                + Add Hardware
              </button>
            </div>

            {/* Hardware Table */}
            <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900/80">
                    <tr>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Code</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Category</th>
                      <th className="text-center py-3 px-4 text-slate-400 font-medium">Unit</th>
                      <th className="text-right py-3 px-4 text-slate-400 font-medium">Rate</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Calculation Rule</th>
                      <th className="text-center py-3 px-4 text-slate-400 font-medium">Variants</th>
                      <th className="text-center py-3 px-4 text-slate-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHardware.map(item => (
                      <tr key={item.id} className="border-t border-slate-700/30 hover:bg-slate-800/30">
                        <td className="py-3 px-4 text-purple-400 font-mono font-semibold">{item.code}</td>
                        <td className="py-3 px-4">
                          <div className="text-white">{item.name}</div>
                          <div className="text-xs text-slate-500">{item.description}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-300">{item.unit}</td>
                        <td className="py-3 px-4 text-right text-emerald-400 font-mono">{formatCurrency(item.rate)}</td>
                        <td className="py-3 px-4">
                          <div className="text-xs">
                            <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">{item.calculationRule.type}</span>
                            {item.calculationRule.formula && (
                              <code className="ml-2 text-cyan-400">{item.calculationRule.formula}</code>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400">{item.variants.length || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-1">
                            <button 
                              onClick={() => { setEditingHardware(item); setShowHardwareForm(true) }}
                              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDeleteHardware(item.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== WINDOW TYPES TAB ==================== */}
        {activeTab === 'windowTypes' && (
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-slate-400">Define window types with drawings and material calculation formulas</p>
              <button 
                onClick={() => { setEditingWindowType(null); setShowWindowTypeForm(true) }}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 font-medium"
              >
                + Create Window Type
              </button>
            </div>

            {/* Window Type Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {windowTypes.map(wt => (
                <div key={wt.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30 transition-all">
                  {/* Preview SVG */}
                  <div className="h-32 rounded-lg bg-slate-900/50 border border-slate-700/30 flex items-center justify-center mb-3 overflow-hidden">
                    {/* Simple window preview based on type */}
                    <svg viewBox="0 0 100 80" className="w-full h-full p-4">
                      <rect x="5" y="5" width="90" height="70" fill="none" stroke="#6b5bff" strokeWidth="3" rx="2"/>
                      {wt.panelCount >= 2 && <line x1="50" y1="5" x2="50" y2="75" stroke="#6b5bff" strokeWidth="2"/>}
                      {wt.panelCount >= 3 && <line x1="33" y1="5" x2="33" y2="75" stroke="#6b5bff" strokeWidth="1.5"/>}
                      {wt.panelCount >= 4 && <line x1="67" y1="5" x2="67" y2="75" stroke="#6b5bff" strokeWidth="1.5"/>}
                      {wt.hasMesh && <rect x="70" y="10" width="20" height="60" fill="none" stroke="#3be482" strokeWidth="1" strokeDasharray="3,2"/>}
                      {wt.category === 'CASEMENT' && (
                        <>
                          <line x1="50" y1="40" x2="90" y2="40" stroke="#3ec8ff" strokeWidth="1.5"/>
                          <polygon points="85,35 90,40 85,45" fill="#3ec8ff"/>
                        </>
                      )}
                      {wt.category === 'SLIDING' && (
                        <>
                          <line x1="25" y1="40" x2="45" y2="40" stroke="#3ec8ff" strokeWidth="1.5"/>
                          <polygon points="40,35 45,40 40,45" fill="#3ec8ff"/>
                        </>
                      )}
                    </svg>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold text-purple-400">{wt.code}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${wt.isSystem ? 'bg-slate-600 text-slate-300' : 'bg-purple-500/20 text-purple-400'}`}>
                      {wt.isSystem ? 'SYSTEM' : 'CUSTOM'}
                    </span>
                  </div>
                  
                  <h4 className="text-white font-medium mb-1">{wt.name}</h4>
                  <p className="text-xs text-slate-500 mb-3">{wt.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <span className="px-2 py-0.5 rounded bg-slate-700 text-xs text-slate-300">{wt.category}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-700 text-xs text-slate-300">{wt.panelCount}P</span>
                      {wt.hasMesh && <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-xs text-emerald-400">+Mesh</span>}
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => { setEditingWindowType(wt); setShowWindowTypeForm(true) }}
                        className="p-1 rounded hover:bg-slate-700 text-slate-400"
                      >
                        ✏️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== PROFILE FORM MODAL ==================== */}
        {showProfileForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">
                {editingProfile ? 'Edit Profile' : 'Add New Profile'}
              </h3>
              
              <ProfileForm 
                profile={editingProfile}
                families={profileFamilies}
                brands={brands}
                onSave={handleSaveProfile}
                onCancel={() => { setShowProfileForm(false); setEditingProfile(null) }}
              />
            </div>
          </div>
        )}

        {/* ==================== GLASS FORM MODAL ==================== */}
        {showGlassForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">
                {editingGlass ? 'Edit Glass Option' : 'Add New Glass Option'}
              </h3>
              
              <GlassForm 
                glass={editingGlass}
                types={glassTypes}
                onSave={handleSaveGlass}
                onCancel={() => { setShowGlassForm(false); setEditingGlass(null) }}
              />
            </div>
          </div>
        )}

        {/* ==================== HARDWARE FORM MODAL ==================== */}
        {showHardwareForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">
                {editingHardware ? 'Edit Hardware Item' : 'Add New Hardware Item'}
              </h3>
              
              <HardwareForm 
                item={editingHardware}
                categories={hardwareCategories}
                units={hardwareUnits}
                ruleTypes={calculationRuleTypes}
                windowTypes={windowTypes.map(w => w.code)}
                onSave={handleSaveHardware}
                onCancel={() => { setShowHardwareForm(false); setEditingHardware(null) }}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ==========================================
// PROFILE FORM COMPONENT
// ==========================================

function ProfileForm({ profile, families, brands, onSave, onCancel }: {
  profile: UPVCProfile | null
  families: string[]
  brands: string[]
  onSave: (p: UPVCProfile) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Partial<UPVCProfile>>(profile || {
    code: '',
    name: '',
    family: 'FRAME',
    brand: brands[0] || 'FENSTAS',
    stockLength: 6500,
    weightPerMeter: 1.0,
    ratePerMeter: 0,
    ratePerPiece: 0,
    pricingMode: 'METER',
    deductions: { frame: 0, sash: 0, beading: 0 },
    color: 'White',
    isActive: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form as UPVCProfile)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Profile Code *</label>
          <input
            required
            value={form.code || ''}
            onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})}
            placeholder="e.g., FR-60"
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Profile Name *</label>
          <input
            required
            value={form.name || ''}
            onChange={(e) => setForm({...form, name: e.target.value})}
            placeholder="e.g., Frame 60mm"
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Family *</label>
          <select
            required
            value={form.family || ''}
            onChange={(e) => setForm({...form, family: e.target.value})}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
          >
            {families.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Brand *</label>
          <input
            required
            value={form.brand || ''}
            onChange={(e) => setForm({...form, brand: e.target.value})}
            placeholder="e.g., FENSTAS"
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
            list="brand-options"
          />
          <datalist id="brand-options">
            {brands.map(b => <option key={b} value={b}/>)}
          </datalist>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Stock Length (mm) *</label>
          <input
            type="number"
            required
            value={form.stockLength || ''}
            onChange={(e) => setForm({...form, stockLength: Number(e.target.value)})}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Weight per Meter (kg)</label>
          <input
            type="number"
            step="0.01"
            value={form.weightPerMeter || ''}
            onChange={(e) => setForm({...form, weightPerMeter: Number(e.target.value)})}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
          />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <h4 className="text-sm font-medium text-white mb-3">Pricing</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Rate per Meter (₹) *</label>
            <input
              type="number"
              required
              value={form.ratePerMeter || ''}
              onChange={(e) => setForm({...form, ratePerMeter: Number(e.target.value)})}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Rate per Piece (₹)</label>
            <input
              type="number"
              value={form.ratePerPiece || ''}
              onChange={(e) => setForm({...form, ratePerPiece: Number(e.target.value)})}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Pricing Mode</label>
            <select
              value={form.pricingMode || 'METER'}
              onChange={(e) => setForm({...form, pricingMode: e.target.value as any})}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
            >
              <option value="METER">Per Meter</option>
              <option value="PIECE">Per Piece</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <h4 className="text-sm font-medium text-white mb-3">Deductions (mm)</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">From Frame</label>
            <input
              type="number"
              value={form.deductions?.frame || 0}
              onChange={(e) => setForm({...form, deductions: {...form.deductions!, frame: Number(e.target.value)}})}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">From Sash</label>
            <input
              type="number"
              value={form.deductions?.sash || 0}
              onChange={(e) => setForm({...form, deductions: {...form.deductions!, sash: Number(e.target.value)}})}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">For Beading</label>
            <input
              type="number"
              value={form.deductions?.beading || 0}
              onChange={(e) => setForm({...form, deductions: {...form.deductions!, beading: Number(e.target.value)}})}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive ?? true}
            onChange={(e) => setForm({...form, isActive: e.target.checked})}
            className="w-4 h-4"
          />
          <span className="text-sm text-white">Active</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-700">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 rounded-xl bg-slate-700 text-white hover:bg-slate-600">
          Cancel
        </button>
        <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 font-medium">
          {profile ? 'Save Changes' : 'Add Profile'}
        </button>
      </div>
    </form>
  )
}

// ==========================================
// GLASS FORM COMPONENT
// ==========================================

function GlassForm({ glass, types, onSave, onCancel }: {
  glass: GlassOption | null
  types: string[]
  onSave: (g: GlassOption) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Partial<GlassOption>>(glass || {
    name: '',
    displayName: '',
    type: 'FLOAT',
    variants: [{ id: '1', thickness: '5mm', ratePerSqft: 0, ratePerSqm: 0, weightPerSqm: 12.5, isDefault: true }],
    stockSizes: [],
    color: '#e8f4fc',
    opacity: 0.15,
    isActive: true,
  })

  const addVariant = () => {
    setForm({
      ...form,
      variants: [...(form.variants || []), { 
        id: Math.random().toString(36).substr(2, 9), 
        thickness: '', 
        ratePerSqft: 0, 
        ratePerSqm: 0, 
        weightPerSqm: 12.5, 
        isDefault: false 
      }]
    })
  }

  const updateVariant = (index: number, field: string, value: any) => {
    const variants = [...(form.variants || [])]
    variants[index] = { ...variants[index], [field]: value }
    setForm({ ...form, variants })
  }

  const removeVariant = (index: number) => {
    setForm({ ...form, variants: form.variants?.filter((_, i) => i !== index) })
  }

  const addStockSize = () => {
    setForm({
      ...form,
      stockSizes: [...(form.stockSizes || []), { 
        id: Math.random().toString(36).substr(2, 9), 
        width: 2440, 
        height: 1830, 
        ratePerSheet: 0, 
        label: '8x6 ft' 
      }]
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form as GlassOption)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Name (Code) *</label>
          <input
            required
            value={form.name || ''}
            onChange={(e) => setForm({...form, name: e.target.value.toUpperCase()})}
            placeholder="e.g., CLEAR"
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Display Name *</label>
          <input
            required
            value={form.displayName || ''}
            onChange={(e) => setForm({...form, displayName: e.target.value})}
            placeholder="e.g., Clear Float Glass"
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">Glass Type *</label>
        <select
          required
          value={form.type || ''}
          onChange={(e) => setForm({...form, type: e.target.value})}
          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
        >
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Variants */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-white">Thickness Variants</h4>
          <button type="button" onClick={addVariant} className="text-xs text-purple-400 hover:text-purple-300">
            + Add Variant
          </button>
        </div>
        <div className="space-y-3">
          {form.variants?.map((v, i) => (
            <div key={v.id} className="grid grid-cols-5 gap-2 items-center">
              <input
                placeholder="Thickness"
                value={v.thickness}
                onChange={(e) => updateVariant(i, 'thickness', e.target.value)}
                className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm"
              />
              <input
                type="number"
                placeholder="₹/sqft"
                value={v.ratePerSqft || ''}
                onChange={(e) => updateVariant(i, 'ratePerSqft', Number(e.target.value))}
                className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm"
              />
              <input
                type="number"
                placeholder="₹/sqm"
                value={v.ratePerSqm || ''}
                onChange={(e) => updateVariant(i, 'ratePerSqm', Number(e.target.value))}
                className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm"
              />
              <input
                type="number"
                placeholder="kg/sqm"
                value={v.weightPerSqm || ''}
                onChange={(e) => updateVariant(i, 'weightPerSqm', Number(e.target.value))}
                className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm"
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={v.isDefault}
                    onChange={(e) => updateVariant(i, 'isDefault', e.target.checked)}
                  />
                  Default
                </label>
                <button type="button" onClick={() => removeVariant(i)} className="text-red-400 hover:text-red-300">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive ?? true}
            onChange={(e) => setForm({...form, isActive: e.target.checked})}
            className="w-4 h-4"
          />
          <span className="text-sm text-white">Active</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-700">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 rounded-xl bg-slate-700 text-white hover:bg-slate-600">
          Cancel
        </button>
        <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 font-medium">
          {glass ? 'Save Changes' : 'Add Glass'}
        </button>
      </div>
    </form>
  )
}

// ==========================================
// HARDWARE FORM COMPONENT
// ==========================================

function HardwareForm({ item, categories, units, ruleTypes, windowTypes, onSave, onCancel }: {
  item: HardwareItem | null
  categories: string[]
  units: string[]
  ruleTypes: string[]
  windowTypes: string[]
  onSave: (h: HardwareItem) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Partial<HardwareItem>>(item || {
    name: '',
    code: '',
    category: 'OTHER',
    description: '',
    unit: 'PCS',
    rate: 0,
    variants: [],
    calculationRule: { type: 'PER_WINDOW', formula: '1', multiplier: 1, applicableTypes: [] },
    isActive: true,
  })

  const addVariant = () => {
    setForm({
      ...form,
      variants: [...(form.variants || []), { 
        id: Math.random().toString(36).substr(2, 9), 
        name: '', 
        rate: form.rate || 0, 
        isDefault: false 
      }]
    })
  }

  const updateVariant = (index: number, field: string, value: any) => {
    const variants = [...(form.variants || [])]
    variants[index] = { ...variants[index], [field]: value }
    setForm({ ...form, variants })
  }

  const removeVariant = (index: number) => {
    setForm({ ...form, variants: form.variants?.filter((_, i) => i !== index) })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form as HardwareItem)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Item Code *</label>
          <input
            required
            value={form.code || ''}
            onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})}
            placeholder="e.g., ROL-22"
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Item Name *</label>
          <input
            required
            value={form.name || ''}
            onChange={(e) => setForm({...form, name: e.target.value})}
            placeholder="e.g., Roller 22mm"
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">Description</label>
        <input
          value={form.description || ''}
          onChange={(e) => setForm({...form, description: e.target.value})}
          placeholder="Brief description"
          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Category *</label>
          <select
            required
            value={form.category || ''}
            onChange={(e) => setForm({...form, category: e.target.value})}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Unit *</label>
          <select
            required
            value={form.unit || ''}
            onChange={(e) => setForm({...form, unit: e.target.value})}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
          >
            {units.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Base Rate (₹) *</label>
          <input
            type="number"
            required
            value={form.rate || ''}
            onChange={(e) => setForm({...form, rate: Number(e.target.value)})}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
          />
        </div>
      </div>

      {/* Calculation Rule */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <h4 className="text-sm font-medium text-white mb-3">Calculation Rule</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Rule Type</label>
            <select
              value={form.calculationRule?.type || 'PER_WINDOW'}
              onChange={(e) => setForm({...form, calculationRule: {...form.calculationRule!, type: e.target.value}})}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
            >
              {ruleTypes.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Multiplier</label>
            <input
              type="number"
              step="0.1"
              value={form.calculationRule?.multiplier || 1}
              onChange={(e) => setForm({...form, calculationRule: {...form.calculationRule!, multiplier: Number(e.target.value)}})}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
            />
          </div>
        </div>
        {form.calculationRule?.type === 'FORMULA' && (
          <div className="mt-3">
            <label className="block text-xs text-slate-400 mb-1">Custom Formula</label>
            <input
              value={form.calculationRule?.formula || ''}
              onChange={(e) => setForm({...form, calculationRule: {...form.calculationRule!, formula: e.target.value}})}
              placeholder="e.g., SASH_COUNT * 2 or W * H / 100000"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm"
            />
            <p className="text-[10px] text-slate-500 mt-1">Variables: W, H, SW, SH, MW, MH, QTY, SQFT, PANEL_COUNT, SASH_COUNT, GLASS_COUNT</p>
          </div>
        )}
      </div>

      {/* Variants */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-white">Size/Type Variants (Optional)</h4>
          <button type="button" onClick={addVariant} className="text-xs text-purple-400 hover:text-purple-300">
            + Add Variant
          </button>
        </div>
        {form.variants && form.variants.length > 0 ? (
          <div className="space-y-2">
            {form.variants.map((v, i) => (
              <div key={v.id} className="grid grid-cols-4 gap-2 items-center">
                <input
                  placeholder="Name (e.g., 22mm)"
                  value={v.name}
                  onChange={(e) => updateVariant(i, 'name', e.target.value)}
                  className="col-span-2 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm"
                />
                <input
                  type="number"
                  placeholder="Rate"
                  value={v.rate || ''}
                  onChange={(e) => updateVariant(i, 'rate', Number(e.target.value))}
                  className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm"
                />
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-xs text-slate-400">
                    <input
                      type="checkbox"
                      checked={v.isDefault}
                      onChange={(e) => updateVariant(i, 'isDefault', e.target.checked)}
                    />
                    Default
                  </label>
                  <button type="button" onClick={() => removeVariant(i)} className="text-red-400">✕</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">No variants defined. Add variants if this item comes in different sizes/types.</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive ?? true}
            onChange={(e) => setForm({...form, isActive: e.target.checked})}
            className="w-4 h-4"
          />
          <span className="text-sm text-white">Active</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-700">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 rounded-xl bg-slate-700 text-white hover:bg-slate-600">
          Cancel
        </button>
        <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 font-medium">
          {item ? 'Save Changes' : 'Add Hardware'}
        </button>
      </div>
    </form>
  )
}