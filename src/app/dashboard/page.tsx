'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// ==========================================
// KINGS OPTIMIZER HUB - COMPLETE DASHBOARD
// With Sprint 1 + Sprint 2 Navigation
// ==========================================

// Types
interface Window {
  id: number
  flat: string
  sl: number
  type: string
  width: number
  height: number
  sw: number
  sh: number
  mw: number
  mh: number
  qty: number
  sqft: number
  rate: number
  amount: number
  drawing?: string
}

interface EngineStatus {
  status: 'idle' | 'running' | 'done' | 'error'
  lastRun: string
  cost: number
  waste?: number
  stock?: string
}

interface SavedQuote {
  id: string
  quoteNo: string
  siteName: string
  clientName: string
  amount: number
  sqft: number
  savedAt: string
  status: 'DRAFT' | 'QUOTED' | 'CONFIRMED' | 'PRODUCTION' | 'COMPLETED'
  folderId?: string
}

// Navigation Items with Sprint 1 & 2
interface NavItem {
  key: string
  icon: string
  label: string
  tag: string
  href?: string
  children?: NavItem[]
}

const navItems: NavItem[] = [
  { key: 'dashboard', icon: '📊', label: 'Dashboard', tag: 'KPI' },
  { key: 'production', icon: '🏭', label: 'Production Plan', tag: 'EXCEL' },
  { key: 'optimizer', icon: '⚙️', label: 'Optimizer', tag: 'LIVE' },
  { key: 'quotation', icon: '📝', label: 'Quotation', tag: 'NEW' },
  { key: 'saved', icon: '💾', label: 'Saved Quotes', tag: 'LIB' },
  { 
    key: 'master-data', 
    icon: '📁', 
    label: 'Master Data', 
    tag: 'S1+S2',
    children: [
      { key: 'profiles', icon: '📐', label: 'UPVC Profiles', tag: 'S1', href: '/master-data/profiles' },
      { key: 'glass', icon: '💎', label: 'Glass Options', tag: 'S1', href: '/master-data/glass' },
      { key: 'hardware', icon: '🔩', label: 'Hardware Items', tag: 'S1', href: '/master-data/hardware' },
      { key: 'window-types', icon: '🪟', label: 'Window Types', tag: 'S2', href: '/master-data/window-types' },
    ]
  },
  { key: 'billing', icon: '🧾', label: 'Final Billing', tag: 'ERP' },
  { key: 'user', icon: '👤', label: 'User Details', tag: 'PRO' },
  { key: 'settings', icon: '⚙️', label: 'Settings', tag: 'CFG' },
]

export default function DashboardPage() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  // Navigation
  const [activeView, setActiveView] = useState<string>('optimizer')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['master-data'])
  
  // Pipeline status
  const [pipelineStage, setPipelineStage] = useState<'DRAFT' | 'PRODUCTION' | 'INSTALL' | 'CLOSED'>('DRAFT')
  
  // Engine states
  const [running, setRunning] = useState(false)
  const [runProgress, setRunProgress] = useState(0)
  const [currentJob, setCurrentJob] = useState('')
  const [engineStatus, setEngineStatus] = useState<Record<string, EngineStatus>>({
    profile: { status: 'idle', lastRun: '', cost: 0, waste: 0, stock: '0 pcs' },
    glass: { status: 'idle', lastRun: '', cost: 0, waste: 0, stock: '0 sheets' },
    steel: { status: 'idle', lastRun: '', cost: 0, waste: 0, stock: '0 m' },
    hardware: { status: 'idle', lastRun: '', cost: 0, stock: '0 items' },
  })

  // Engine details tab
  const [engineDetailTab, setEngineDetailTab] = useState<string>('profile')
  const [engineDetailExpanded, setEngineDetailExpanded] = useState(false)

  // Controls
  const [steelMode, setSteelMode] = useState('cut200PlusMesh')
  const [controls, setControls] = useState({
    brand: 'FENSTAS',
    profitPct: 20,
    glass: 'CLEAR',
    thickness: '5mm',
    mesh: 'ALU NORMAL',
    wastePct: 5,
    discountPct: 0,
    discountFlat: 0,
    gstPct: 18,
    extraCharges: 0,
  })

  // Site/Project info
  const [siteInfo, setSiteInfo] = useState({
    siteName: 'Kumar Residence',
    quoteNo: 'Q-2024-001',
    phone: '9876543210',
    date: new Date().toISOString().split('T')[0],
    address: 'Bangalore, Karnataka',
    gpsLink: '',
  })

  // Company info (User settings)
  const [companyInfo, setCompanyInfo] = useState({
    companyName: 'Kings Windows & Doors',
    brandName: 'Kings Optimizer',
    phone: '+91 9876543210',
    email: 'sales@kingswindows.com',
    gst: '29AAAAA0000A1Z5',
    address: 'Industrial Area, Bangalore',
    logoId: '',
    footerText: 'Thank you for your business!',
    themeColor: '#6f5bff',
    allowedEmails: '',
  })

  // Windows data
  const [windows, setWindows] = useState<Window[]>([
    { id: 1, flat: 'F1', sl: 1, type: '2T', width: 1200, height: 1500, sw: 560, sh: 1400, mw: 0, mh: 0, qty: 2, sqft: 38.75, rate: 850, amount: 32937 },
    { id: 2, flat: 'F1', sl: 2, type: '2+1', width: 1500, height: 1200, sw: 700, sh: 1100, mw: 700, mh: 1100, qty: 1, sqft: 19.38, rate: 920, amount: 17829 },
    { id: 3, flat: 'F2', sl: 1, type: 'FIX', width: 900, height: 600, sw: 0, sh: 0, mw: 0, mh: 0, qty: 3, sqft: 17.44, rate: 680, amount: 11859 },
    { id: 4, flat: 'F2', sl: 2, type: 'CO', width: 600, height: 1200, sw: 520, sh: 1100, mw: 0, mh: 0, qty: 2, sqft: 15.50, rate: 890, amount: 13795 },
    { id: 5, flat: 'F3', sl: 1, type: 'FD2P', width: 1800, height: 2100, sw: 850, sh: 2000, mw: 0, mh: 0, qty: 1, sqft: 40.69, rate: 1100, amount: 44759 },
  ])

  // Saved quotes
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([
    { id: '1', quoteNo: 'Q-2024-001', siteName: 'Kumar Residence', clientName: 'Mr. Kumar', amount: 208675, sqft: 245.5, savedAt: '2026-01-15', status: 'QUOTED' },
    { id: '2', quoteNo: 'Q-2024-002', siteName: 'Sharma Villa', clientName: 'Mr. Sharma', amount: 156230, sqft: 189.2, savedAt: '2026-01-14', status: 'CONFIRMED' },
    { id: '3', quoteNo: 'Q-2024-003', siteName: 'Patel Apartments', clientName: 'Mr. Patel', amount: 425890, sqft: 512.0, savedAt: '2026-01-12', status: 'PRODUCTION' },
    { id: '4', quoteNo: 'Q-2024-004', siteName: 'Reddy Heights', clientName: 'Mr. Reddy', amount: 312450, sqft: 378.5, savedAt: '2026-01-10', status: 'COMPLETED' },
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null)
  const [monthFilter, setMonthFilter] = useState<string>('ALL')
  const [selectMode, setSelectMode] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([])

  // Optimizer results (mock data)
  const [optimizerResults, setOptimizerResults] = useState({
    profile: {
      summary: { totalStock: 24, totalWaste: 4.2, totalCost: 45230, totalLength: 156800 },
      byProfile: [
        { code: 'FR-01', family: 'FRAME', stock: 8, length: 48200, waste: 3.8, cost: 15600 },
        { code: 'SH-01', family: 'SASH', stock: 6, length: 35400, waste: 4.5, cost: 12400 },
        { code: 'IL-01', family: 'INTERLOCK', stock: 4, length: 22800, waste: 5.2, cost: 8200 },
        { code: 'BD-01', family: 'BEADING', stock: 6, length: 42600, waste: 3.1, cost: 9030 },
      ],
      cuttingPatterns: [
        { profile: 'FR-01', stockLength: 6500, cuts: [1500, 1500, 1200, 1200, 850], waste: 250 },
        { profile: 'SH-01', stockLength: 6500, cuts: [1400, 1400, 1100, 1100, 1100], waste: 400 },
      ]
    },
    glass: {
      summary: { totalSheets: 8, totalWaste: 12.5, totalCost: 18450, totalArea: 42.5 },
      sheets: [
        { id: 1, size: '8x6 ft', pieces: 4, used: 85.2, waste: 14.8 },
        { id: 2, size: '8x6 ft', pieces: 3, used: 78.6, waste: 21.4 },
        { id: 3, size: '10x7 ft', pieces: 5, used: 91.3, waste: 8.7 },
      ]
    },
    steel: {
      summary: { totalLength: 156, totalWeight: 78.5, totalCost: 8920, mode: steelMode },
      sections: [
        { section: 'FRAME', length: 86.4, weight: 43.2, cost: 4920 },
        { section: 'SASH', length: 69.6, weight: 35.3, cost: 4000 },
      ]
    },
    hardware: {
      summary: { totalItems: 48, totalCost: 12650 },
      items: [
        { item: 'ROLLER (22mm)', category: 'Movement', qty: 24, unit: 'PCS', rate: 85, amount: 2040 },
        { item: 'LOCK (MultiPoint)', category: 'Hardware', qty: 5, unit: 'PCS', rate: 450, amount: 2250 },
        { item: 'HANDLE (Standard)', category: 'Hardware', qty: 10, unit: 'PCS', rate: 180, amount: 1800 },
        { item: 'INTERLOCK (3T)', category: 'Hardware', qty: 32, unit: 'MTR', rate: 120, amount: 3840 },
        { item: 'WOOLLEN PILE', category: 'Sealing', qty: 85, unit: 'MTR', rate: 25, amount: 2125 },
        { item: 'EPDM GASKET', category: 'Sealing', qty: 17, unit: 'MTR', rate: 35, amount: 595 },
      ]
    },
    packing: {
      totals: { windows: 4, doors: 1, frames: 5, shutters: 8, meshPanels: 1, glassPanels: 9 },
      rows: [] as any[]
    }
  })

  // Labor times
  const [laborTimes, setLaborTimes] = useState({
    production: { hours: 18.5, team: 2, perWindow: 3.7 },
    installation: { hours: 14.2, days: 1.8, team: 2, perWindow: 2.8 },
  })

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    revenue: 892450,
    pipeline: 1245000,
    receivable: 156230,
    quotesThisMonth: 12,
    conversionRate: 68,
    avgTicket: 74370,
    topClient: 'Patel Apartments',
    recentActivity: [
      { type: 'quote', text: 'Quote Q-005 created', time: '2 hours ago' },
      { type: 'confirm', text: 'Sharma Villa confirmed', time: '5 hours ago' },
      { type: 'complete', text: 'Reddy Heights completed', time: '1 day ago' },
    ]
  })

  // Modals
  const [showSiteModal, setShowSiteModal] = useState(false)
  const [showWindowModal, setShowWindowModal] = useState(false)
  const [showVisualSelector, setShowVisualSelector] = useState(false)
  const [showUserSettings, setShowUserSettings] = useState(false)
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [showQuotePreview, setShowQuotePreview] = useState(false)

  // Activity Log
  const [activityLog, setActivityLog] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] System initialized`,
    `[${new Date().toLocaleTimeString()}] Loaded ${windows.length} windows`,
  ])

  // ==========================================
  // CALCULATIONS
  // ==========================================
  
  const totalSqft = windows.reduce((sum, w) => sum + (w.sqft * w.qty), 0)
  const baseCost = windows.reduce((sum, w) => sum + w.amount, 0)
  const profitAmount = baseCost * (controls.profitPct / 100)
  const subtotal = baseCost + profitAmount
  const discountAmount = subtotal * (controls.discountPct / 100) + controls.discountFlat
  const afterDiscount = subtotal - discountAmount
  const gstAmount = afterDiscount * (controls.gstPct / 100)
  const totalAmount = afterDiscount + gstAmount + controls.extraCharges
  const perSqft = totalSqft > 0 ? Math.round(totalAmount / totalSqft) : 0
  const totalWindows = windows.reduce((sum, w) => sum + w.qty, 0)

  // ==========================================
  // FUNCTIONS
  // ==========================================

  const formatCurrency = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
  
  const appendLog = (msg: string) => {
    const time = new Date().toLocaleTimeString()
    setActivityLog(prev => [`[${time}] ${msg}`, ...prev.slice(0, 49)])
  }

  const toggleMenu = (key: string) => {
    setExpandedMenus(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  // Run all engines
  const runAllEngines = async () => {
    setRunning(true)
    setRunProgress(0)
    appendLog('Starting full optimization run...')
    
    const engines = [
      { key: 'profile', name: 'UPVC Profiles', cost: 45230, waste: 4.2, stock: '24 pcs' },
      { key: 'glass', name: 'Glass Cutting', cost: 18450, waste: 12.5, stock: '8 sheets' },
      { key: 'steel', name: 'Steel Reinforcement', cost: 8920, waste: 3.1, stock: '156 m' },
      { key: 'hardware', name: 'Hardware', cost: 12650, waste: 0, stock: '48 items' },
    ]

    for (let i = 0; i < engines.length; i++) {
      const engine = engines[i]
      setCurrentJob(engine.name)
      appendLog(`Running ${engine.name}...`)
      
      setEngineStatus(prev => ({
        ...prev,
        [engine.key]: { ...prev[engine.key], status: 'running' }
      }))
      
      await new Promise(r => setTimeout(r, 800 + Math.random() * 400))
      
      setEngineStatus(prev => ({
        ...prev,
        [engine.key]: { 
          status: 'done', 
          lastRun: new Date().toLocaleTimeString(),
          cost: engine.cost,
          waste: engine.waste,
          stock: engine.stock,
        }
      }))
      
      setRunProgress(((i + 1) / engines.length) * 100)
      appendLog(`${engine.name} completed ✓`)
    }

    // Update packing list
    setOptimizerResults(prev => ({
      ...prev,
      packing: {
        ...prev.packing,
        rows: windows.map(w => ({
          id: `${w.flat}-${w.sl}`,
          type: w.type,
          width: w.width,
          height: w.height,
          qty: w.qty,
          frames: 1,
          shutters: w.type.includes('FD') ? 2 : (w.type === 'FIX' ? 0 : 2),
          mesh: w.type.includes('+1') || w.mw > 0 ? 1 : 0,
          glass: w.type.includes('FD') ? 2 : (w.type === 'FIX' ? 1 : 2),
        }))
      }
    }))

    setCurrentJob('')
    setRunning(false)
    appendLog('All engines completed successfully! ✅')
  }

  // Run single engine
  const runSingleEngine = async (engineKey: string) => {
    setRunning(true)
    setCurrentJob(engineKey)
    appendLog(`Running ${engineKey} optimizer...`)
    
    setEngineStatus(prev => ({
      ...prev,
      [engineKey]: { ...prev[engineKey], status: 'running' }
    }))
    
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 500))
    
    const results: Record<string, any> = {
      profile: { cost: 45230, waste: 4.2, stock: '24 pcs' },
      glass: { cost: 18450, waste: 12.5, stock: '8 sheets' },
      steel: { cost: 8920, waste: 3.1, stock: '156 m' },
      hardware: { cost: 12650, waste: 0, stock: '48 items' },
    }
    
    setEngineStatus(prev => ({
      ...prev,
      [engineKey]: { 
        status: 'done', 
        lastRun: new Date().toLocaleTimeString(),
        ...results[engineKey]
      }
    }))
    
    setCurrentJob('')
    setRunning(false)
    appendLog(`${engineKey} completed ✓`)
  }

  // Window management
  const addWindow = () => {
    const newId = Math.max(...windows.map(w => w.id), 0) + 1
    const newSl = windows.length + 1
    const newWindow: Window = {
      id: newId,
      flat: 'F1',
      sl: newSl,
      type: '2T',
      width: 1200,
      height: 1200,
      sw: 560,
      sh: 1100,
      mw: 0,
      mh: 0,
      qty: 1,
      sqft: 15.5,
      rate: 850,
      amount: 13175,
    }
    setWindows([...windows, newWindow])
    appendLog(`Added window #${newSl}`)
  }

  const updateWindow = (id: number, field: string, value: any) => {
    setWindows(windows.map(w => {
      if (w.id !== id) return w
      const updated = { ...w, [field]: value }
      // Recalculate sqft and amount
      updated.sqft = Math.round((updated.width * updated.height * updated.qty) / 92903.04 * 100) / 100
      updated.amount = Math.round(updated.sqft * updated.rate)
      return updated
    }))
  }

  const deleteWindow = (id: number) => {
    setWindows(windows.filter(w => w.id !== id))
    appendLog(`Deleted window`)
  }

  const clearAllWindows = () => {
    if (confirm('Clear all windows? This cannot be undone.')) {
      setWindows([])
      appendLog('Cleared all windows')
    }
  }

  // Quote comparison
  const toggleQuoteSelection = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter(x => x !== id))
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare([...selectedForCompare, id])
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string, text: string, border: string, label: string }> = {
      idle: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30', label: 'Ready' },
      running: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Running...' },
      done: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: '✓ Done' },
      error: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Error' },
      DRAFT: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30', label: 'Draft' },
      QUOTED: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Quoted' },
      CONFIRMED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Confirmed' },
      PRODUCTION: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30', label: 'Production' },
      COMPLETED: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Completed' },
    }
    return map[status] || map.idle
  }

  // Window types for visual selector
  const windowTypes = [
    { code: '2T', name: '2 Track Sliding', desc: 'Standard sliding window', icon: '🪟' },
    { code: '2+1', name: '2+1 with Mesh', desc: '2 glass + 1 mesh track', icon: '🪟' },
    { code: '3T', name: '3 Track Sliding', desc: '3 panel sliding', icon: '🪟' },
    { code: '4T', name: '4 Track Sliding', desc: '4 panel sliding', icon: '🪟' },
    { code: 'FIX', name: 'Fixed Panel', desc: 'Non-opening fixed glass', icon: '⬜' },
    { code: 'CO', name: 'Casement Open', desc: 'Side-hung opening', icon: '🚪' },
    { code: 'CF', name: 'Casement Fixed', desc: 'Casement style fixed', icon: '⬜' },
    { code: 'VRH', name: 'Vent Right Hung', desc: 'Top vent right hinged', icon: '🔲' },
    { code: 'VLH', name: 'Vent Left Hung', desc: 'Top vent left hinged', icon: '🔲' },
    { code: 'VTH', name: 'Vent Top Hung', desc: 'Top hung ventilator', icon: '🔲' },
    { code: 'FD2P', name: 'Sliding Door 2P', desc: '2 panel sliding door', icon: '🚪' },
    { code: 'FD3P', name: 'Sliding Door 3P', desc: '3 panel sliding door', icon: '🚪' },
    { code: 'FD4P', name: 'Sliding Door 4P', desc: '4 panel sliding door', icon: '🚪' },
    { code: 'FDCO', name: 'Casement Door', desc: 'Hinged door', icon: '🚪' },
  ]

  const steelModes = [
    { value: 'full', label: '1) Full Steel', desc: 'All frame + sash' },
    { value: 'onlyHeight', label: '2) Height Only', desc: 'W + SH + MH' },
    { value: 'frameMesh', label: '3) Frame + Mesh', desc: 'Frame perimeter + mesh' },
    { value: 'cut200Frame', label: '4) 200mm Frame', desc: '200mm frame only' },
    { value: 'cut200PlusMesh', label: '5) 200mm + Mesh', desc: '200mm frame + mesh' },
  ]

  const glassOptions = ['CLEAR', 'PINNED', 'KASUMBI', 'BLUE', 'BLACK', 'GOLD', 'FROSTED', 'KATRACHI', 'TOUGHENED', 'DGU', 'TINTED']
  const thicknessOptions = ['4mm', '5mm', '6mm', '8mm', '10mm', '12mm']
  const meshOptions = ['ALU NORMAL', 'ALU GOOD', 'SS 304', 'SS 316', 'FIBER', 'NONE']
  const brandOptions = ['FENSTAS', 'ENCRAFT', 'KOMMERLING', 'REHAU', 'LINGEL', 'VEKA']

  // ==========================================
  // RENDER NAVIGATION ITEM
  // ==========================================
  const renderNavItem = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedMenus.includes(item.key)
    const isActive = activeView === item.key || item.children?.some(c => activeView === c.key)

    if (hasChildren) {
      return (
        <div key={item.key}>
          <button
            onClick={() => toggleMenu(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
              isActive
                ? 'bg-purple-600/20 text-white border border-purple-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <span>{item.icon}</span>
            {!sidebarCollapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded bg-gradient-to-r from-purple-500/30 to-cyan-500/30 text-purple-300`}>
                  {item.tag}
                </span>
                <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
              </>
            )}
          </button>
          
          {!sidebarCollapsed && isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l border-slate-700/50 pl-3">
              {item.children!.map(child => (
                child.href ? (
                  <Link
                    key={child.key}
                    href={child.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      activeView === child.key
                        ? 'bg-purple-600/20 text-white'
                        : 'text-slate-500 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <span className="text-xs">{child.icon}</span>
                    <span className="flex-1">{child.label}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded ${
                      child.tag === 'S1' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
                    }`}>{child.tag}</span>
                  </Link>
                ) : (
                  <button
                    key={child.key}
                    onClick={() => setActiveView(child.key)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      activeView === child.key
                        ? 'bg-purple-600/20 text-white'
                        : 'text-slate-500 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <span className="text-xs">{child.icon}</span>
                    <span className="flex-1 text-left">{child.label}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded ${
                      child.tag === 'S1' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
                    }`}>{child.tag}</span>
                  </button>
                )
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <button
        key={item.key}
        onClick={() => setActiveView(item.key)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
          activeView === item.key
            ? 'bg-purple-600/20 text-white border border-purple-500/30'
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
        }`}
      >
        <span>{item.icon}</span>
        {!sidebarCollapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded ${
              activeView === item.key ? 'bg-purple-500/30 text-purple-300' : 'bg-slate-700 text-slate-500'
            }`}>{item.tag}</span>
          </>
        )}
      </button>
    )
  }

  // ==========================================
  // RENDER
  // ==========================================
  
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      
      {/* ==================== SIDEBAR ==================== */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-950/80 border-r border-slate-800 flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-500 flex items-center justify-center text-lg font-black text-amber-900 shadow-lg flex-shrink-0">
              K
            </div>
            {!sidebarCollapsed && (
              <div>
                <div className="text-sm font-semibold text-white">uPVC WINDOW</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Optimizer Hub</div>
              </div>
            )}
          </div>
        </div>

        {/* Sprint Indicator */}
        {!sidebarCollapsed && (
          <div className="px-4 py-2 border-b border-slate-800/50">
            <div className="flex gap-2">
              <span className="text-[9px] px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Sprint 1 ✓
              </span>
              <span className="text-[9px] px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Sprint 2 ✓
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map(item => renderNavItem(item))}
        </nav>

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-slate-800 text-xs space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>Site</span>
              <span className="text-white font-medium truncate max-w-[120px]">{siteInfo.siteName}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Quote</span>
              <span className="text-purple-400 font-mono">{siteInfo.quoteNo}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Status</span>
              <span className="text-emerald-400">● Connected</span>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-3 border-t border-slate-800 text-slate-500 hover:text-white text-center"
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </aside>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="flex-1 overflow-y-auto">
        
        {/* Pipeline Ribbon */}
        <div className="bg-slate-900/80 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(['DRAFT', 'PRODUCTION', 'INSTALL', 'CLOSED'] as const).map((stage, i) => (
              <div key={stage} className="flex items-center">
                {i > 0 && <span className="text-slate-700 mx-2">›</span>}
                <button
                  onClick={() => setPipelineStage(stage)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    pipelineStage === stage
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {i + 1}. {stage}
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Mode: {pipelineStage === 'DRAFT' ? 'Editing' : 'View Only'}</span>
            {pipelineStage === 'DRAFT' && (
              <button 
                onClick={() => setPipelineStage('PRODUCTION')}
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
              >
                🚀 Start Production
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          
          {/* ==================== OPTIMIZER VIEW ==================== */}
          {activeView === 'optimizer' && (
            <div className="space-y-6">
              
              {/* Top Row - Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-3">
                  {/* Run All Button */}
                  <button
                    onClick={runAllEngines}
                    disabled={running}
                    className="px-5 py-2.5 rounded-2xl font-semibold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:opacity-90 disabled:opacity-60 flex items-center gap-3 shadow-xl shadow-purple-500/25"
                  >
                    {running ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {currentJob || 'Running...'}
                      </>
                    ) : (
                      <>
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
                        </span>
                        Run All Optimizers
                      </>
                    )}
                  </button>

                  <button 
                    onClick={() => setShowQuotePreview(true)}
                    className="px-4 py-2.5 rounded-2xl font-medium text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-90"
                  >
                    Generate Quote PDF
                  </button>

                  <Link 
                    href="/master-data/window-types"
                    className="px-4 py-2.5 rounded-xl text-sm font-medium bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/30 flex items-center gap-2"
                  >
                    🪟 Window Types
                  </Link>

                  <button className="px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-800 text-amber-400 border border-amber-500/30 hover:bg-slate-700">
                    ♻️ Save Offcuts
                  </button>
                </div>

                {/* Steel Mode */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-xs text-slate-400">Steel Mode</span>
                  <select 
                    value={steelMode}
                    onChange={(e) => setSteelMode(e.target.value)}
                    className="bg-transparent text-white text-sm outline-none cursor-pointer"
                  >
                    {steelModes.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Amount (₹)</p>
                  <p className="text-2xl font-bold text-emerald-400">{formatCurrency(Math.round(totalAmount))}</p>
                  <p className="text-slate-500 text-xs mt-1">incl. {controls.gstPct}% GST</p>
                </div>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Per Sqft Rate (₹)</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(perSqft)}</p>
                  <p className="text-slate-500 text-xs mt-1">with {controls.profitPct}% profit</p>
                </div>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Sqft</p>
                  <p className="text-2xl font-bold text-white">{totalSqft.toFixed(2)}</p>
                  <p className="text-slate-500 text-xs mt-1">{totalWindows} units</p>
                </div>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Time Estimate</p>
                  <p className="text-2xl font-bold text-white">{laborTimes.production.hours}h</p>
                  <p className="text-slate-500 text-xs mt-1">Install: {laborTimes.installation.days} days</p>
                </div>
              </div>

              {/* Costing Controls */}
              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Costing Studio Controls</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">◻️ Profile Brand</label>
                    <select
                      value={controls.brand}
                      onChange={(e) => setControls({...controls, brand: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm"
                    >
                      {brandOptions.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">💰 Profit %</label>
                    <input
                      type="number"
                      value={controls.profitPct}
                      onChange={(e) => setControls({...controls, profitPct: Number(e.target.value)})}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">🔍 Glass Option</label>
                    <select
                      value={controls.glass}
                      onChange={(e) => setControls({...controls, glass: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm"
                    >
                      {glassOptions.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">🧊 Thickness</label>
                    <select
                      value={controls.thickness}
                      onChange={(e) => setControls({...controls, thickness: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm"
                    >
                      {thicknessOptions.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">🕸️ Mesh Type</label>
                    <select
                      value={controls.mesh}
                      onChange={(e) => setControls({...controls, mesh: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm"
                    >
                      {meshOptions.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Engine Cards Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { key: 'profile', name: '📐 Profile', results: optimizerResults.profile.summary },
                  { key: 'glass', name: '💎 Glass', results: optimizerResults.glass.summary },
                  { key: 'steel', name: '🛡️ Steel', results: optimizerResults.steel.summary },
                  { key: 'hardware', name: '🔩 Hardware', results: optimizerResults.hardware.summary },
                ].map(engine => {
                  const status = engineStatus[engine.key]
                  const badge = getStatusBadge(status.status)
                  return (
                    <div key={engine.key} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-white">{engine.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.bg} ${badge.text} border ${badge.border}`}>
                          {badge.label}
                        </span>
                      </div>
                      
                      {status.status === 'done' ? (
                        <div className="space-y-1 text-xs mb-3">
                          <div className="flex justify-between text-slate-400">
                            <span>Stock</span>
                            <span className="text-white font-mono">{status.stock}</span>
                          </div>
                          {status.waste !== undefined && status.waste > 0 && (
                            <div className="flex justify-between text-slate-400">
                              <span>Waste</span>
                              <span className="text-white font-mono">{status.waste}%</span>
                            </div>
                          )}
                          <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-700/50">
                            <span>Cost</span>
                            <span className="text-emerald-400 font-semibold">{formatCurrency(status.cost)}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 mb-3">Click Run to optimize</p>
                      )}

                      <div className="flex gap-2">
                        <button 
                          onClick={() => runSingleEngine(engine.key)}
                          disabled={running}
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600/80 text-white hover:bg-purple-600 disabled:opacity-50"
                        >
                          ▶ Run
                        </button>
                        <button 
                          onClick={() => setEngineDetailTab(engine.key)}
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700 text-white hover:bg-slate-600"
                        >
                          ↗ Open
                        </button>
                        <button className="px-2 py-1.5 rounded-lg text-xs bg-slate-700 text-slate-400 hover:text-white">
                          📄
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Quick Links - Sprint Pages */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border border-purple-500/20">
                <h3 className="text-sm font-semibold text-white mb-4">🚀 Quick Access - Sprint Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Link href="/master-data/profiles" className="p-3 rounded-xl bg-slate-800/50 border border-emerald-500/30 hover:bg-slate-700/50 transition-all">
                    <div className="text-emerald-400 text-xs font-semibold mb-1">Sprint 1</div>
                    <div className="text-white font-medium">📐 Profiles</div>
                    <div className="text-slate-500 text-xs">UPVC Profile Library</div>
                  </Link>
                  <Link href="/master-data/glass" className="p-3 rounded-xl bg-slate-800/50 border border-emerald-500/30 hover:bg-slate-700/50 transition-all">
                    <div className="text-emerald-400 text-xs font-semibold mb-1">Sprint 1</div>
                    <div className="text-white font-medium">💎 Glass</div>
                    <div className="text-slate-500 text-xs">Glass Options & Rates</div>
                  </Link>
                  <Link href="/master-data/hardware" className="p-3 rounded-xl bg-slate-800/50 border border-emerald-500/30 hover:bg-slate-700/50 transition-all">
                    <div className="text-emerald-400 text-xs font-semibold mb-1">Sprint 1</div>
                    <div className="text-white font-medium">🔩 Hardware</div>
                    <div className="text-slate-500 text-xs">Hardware Inventory</div>
                  </Link>
                  <Link href="/master-data/window-types" className="p-3 rounded-xl bg-slate-800/50 border border-cyan-500/30 hover:bg-slate-700/50 transition-all">
                    <div className="text-cyan-400 text-xs font-semibold mb-1">Sprint 2</div>
                    <div className="text-white font-medium">🪟 Window Types</div>
                    <div className="text-slate-500 text-xs">Visual Designer</div>
                  </Link>
                </div>
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between text-xs text-slate-500 px-2">
                <span>Status: {running ? `Running ${currentJob}...` : 'Idle'}</span>
                <span>Current: {currentJob || 'None'}</span>
                {running && (
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500" style={{width: `${runProgress}%`}} />
                    </div>
                    <span>{Math.round(runProgress)}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== PRODUCTION VIEW ==================== */}
          {activeView === 'production' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Enter Window Sizes</h2>
                  <p className="text-sm text-slate-400">Rapid Entry: Flat • SL • Type • W • H</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={addWindow} className="px-4 py-2 rounded-xl bg-slate-700 text-white hover:bg-slate-600">
                    ＋ Row
                  </button>
                  <Link 
                    href="/master-data/window-types"
                    className="px-4 py-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/30"
                  >
                    🎨 Visual Designer
                  </Link>
                  <button onClick={clearAllWindows} className="px-4 py-2 rounded-xl bg-slate-700 text-red-400 border border-red-500/30 hover:bg-red-500/10">
                    🗑️ Clear
                  </button>
                </div>
              </div>

              {/* Project Metadata */}
              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">📝 Project Meta-Data</h3>
                  <button 
                    onClick={() => setShowSiteModal(true)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    🔄 Edit Details
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Site Name</label>
                    <input value={siteInfo.siteName} onChange={(e) => setSiteInfo({...siteInfo, siteName: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Quote No</label>
                    <input value={siteInfo.quoteNo} onChange={(e) => setSiteInfo({...siteInfo, quoteNo: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Phone</label>
                    <input value={siteInfo.phone} onChange={(e) => setSiteInfo({...siteInfo, phone: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Date</label>
                    <input type="date" value={siteInfo.date} onChange={(e) => setSiteInfo({...siteInfo, date: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm" />
                  </div>
                </div>
              </div>

              {/* Window Grid (Excel-like) */}
              <div className="p-5 rounded-2xl bg-slate-800/30 border border-slate-700/50 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-900/50">
                      <th className="py-2 px-2 text-left text-slate-400 text-xs">SL</th>
                      <th className="py-2 px-2 text-left text-slate-400 text-xs">Flat</th>
                      <th className="py-2 px-2 text-left text-slate-400 text-xs">Type</th>
                      <th className="py-2 px-2 text-left text-slate-400 text-xs">W</th>
                      <th className="py-2 px-2 text-left text-slate-400 text-xs">H</th>
                      <th className="py-2 px-2 text-left text-slate-400 text-xs">SW</th>
                      <th className="py-2 px-2 text-left text-slate-400 text-xs">SH</th>
                      <th className="py-2 px-2 text-left text-slate-400 text-xs">MW</th>
                      <th className="py-2 px-2 text-left text-slate-400 text-xs">MH</th>
                      <th className="py-2 px-2 text-left text-slate-400 text-xs">Qty</th>
                      <th className="py-2 px-2 text-left text-slate-400 text-xs">Sqft</th>
                      <th className="py-2 px-2 text-left text-slate-400 text-xs">Rate</th>
                      <th className="py-2 px-2 text-left text-slate-400 text-xs">Amount</th>
                      <th className="py-2 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {windows.map((w) => (
                      <tr key={w.id} className="border-t border-slate-700/30 hover:bg-slate-800/30">
                        <td className="py-1 px-2 text-cyan-400 font-mono">{w.sl}</td>
                        <td className="py-1 px-2"><input value={w.flat} onChange={(e) => updateWindow(w.id, 'flat', e.target.value)} className="w-12 px-1 py-1 rounded bg-transparent border border-slate-700/50 text-white text-sm focus:border-purple-500 outline-none" /></td>
                        <td className="py-1 px-2">
                          <select value={w.type} onChange={(e) => updateWindow(w.id, 'type', e.target.value)} className="px-1 py-1 rounded bg-slate-900 border border-slate-700/50 text-white text-sm focus:border-purple-500 outline-none">
                            {windowTypes.map(t => <option key={t.code} value={t.code}>{t.code}</option>)}
                          </select>
                        </td>
                        <td className="py-1 px-2"><input type="number" value={w.width} onChange={(e) => updateWindow(w.id, 'width', Number(e.target.value))} className="w-14 px-1 py-1 rounded bg-transparent border border-slate-700/50 text-purple-300 text-sm font-mono focus:border-purple-500 outline-none" /></td>
                        <td className="py-1 px-2"><input type="number" value={w.height} onChange={(e) => updateWindow(w.id, 'height', Number(e.target.value))} className="w-14 px-1 py-1 rounded bg-transparent border border-slate-700/50 text-purple-300 text-sm font-mono focus:border-purple-500 outline-none" /></td>
                        <td className="py-1 px-2"><input type="number" value={w.sw} onChange={(e) => updateWindow(w.id, 'sw', Number(e.target.value))} className="w-12 px-1 py-1 rounded bg-transparent border border-slate-700/50 text-white text-sm font-mono focus:border-purple-500 outline-none" /></td>
                        <td className="py-1 px-2"><input type="number" value={w.sh} onChange={(e) => updateWindow(w.id, 'sh', Number(e.target.value))} className="w-12 px-1 py-1 rounded bg-transparent border border-slate-700/50 text-white text-sm font-mono focus:border-purple-500 outline-none" /></td>
                        <td className="py-1 px-2"><input type="number" value={w.mw} onChange={(e) => updateWindow(w.id, 'mw', Number(e.target.value))} className="w-12 px-1 py-1 rounded bg-transparent border border-slate-700/50 text-white text-sm font-mono focus:border-purple-500 outline-none" /></td>
                        <td className="py-1 px-2"><input type="number" value={w.mh} onChange={(e) => updateWindow(w.id, 'mh', Number(e.target.value))} className="w-12 px-1 py-1 rounded bg-transparent border border-slate-700/50 text-white text-sm font-mono focus:border-purple-500 outline-none" /></td>
                        <td className="py-1 px-2"><input type="number" value={w.qty} onChange={(e) => updateWindow(w.id, 'qty', Number(e.target.value))} className="w-10 px-1 py-1 rounded bg-transparent border border-slate-700/50 text-white text-sm focus:border-purple-500 outline-none" min="1" /></td>
                        <td className="py-1 px-2 text-cyan-400 font-mono">{w.sqft.toFixed(2)}</td>
                        <td className="py-1 px-2"><input type="number" value={w.rate} onChange={(e) => updateWindow(w.id, 'rate', Number(e.target.value))} className="w-14 px-1 py-1 rounded bg-transparent border border-slate-700/50 text-white text-sm font-mono focus:border-purple-500 outline-none" /></td>
                        <td className="py-1 px-2 text-emerald-400 font-mono">{formatCurrency(w.amount)}</td>
                        <td className="py-1 px-2">
                          <button onClick={() => deleteWindow(w.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-600 bg-slate-900/50">
                      <td colSpan={10} className="py-2 px-2 text-right text-slate-400 font-medium">TOTAL:</td>
                      <td className="py-2 px-2 text-cyan-400 font-bold">{totalSqft.toFixed(2)}</td>
                      <td className="py-2 px-2"></td>
                      <td className="py-2 px-2 text-emerald-400 font-bold">{formatCurrency(baseCost)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ==================== DASHBOARD VIEW ==================== */}
          {activeView === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'} 👋</h2>
                  <p className="text-sm text-slate-400">Here's your business snapshot</p>
                </div>
                <div className="flex gap-2">
                  {['7D', '30D', 'MTD', 'QTD', 'YTD', 'ALL'].map(range => (
                    <button key={range} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-400 hover:text-white">
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                  <p className="text-emerald-400 text-xs uppercase tracking-wider mb-2">💰 Revenue (This Month)</p>
                  <p className="text-4xl font-bold text-emerald-400">{formatCurrency(dashboardStats.revenue)}</p>
                  <p className="text-xs text-slate-500 mt-2">↑ 12% vs last month</p>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                  <p className="text-blue-400 text-xs uppercase tracking-wider mb-2">📊 Pipeline</p>
                  <p className="text-4xl font-bold text-blue-400">{formatCurrency(dashboardStats.pipeline)}</p>
                  <p className="text-xs text-slate-500 mt-2">{savedQuotes.filter(q => q.status === 'QUOTED').length} quotes pending</p>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
                  <p className="text-amber-400 text-xs uppercase tracking-wider mb-2">⏳ Receivable</p>
                  <p className="text-4xl font-bold text-amber-400">{formatCurrency(dashboardStats.receivable)}</p>
                  <p className="text-xs text-slate-500 mt-2">From {savedQuotes.filter(q => q.status === 'COMPLETED').length} completed</p>
                </div>
              </div>

              {/* Sprint Progress */}
              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <h3 className="text-sm font-semibold text-white mb-4">🚀 Development Progress</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-emerald-400 font-semibold">Sprint 1</span>
                      <span className="text-emerald-400 text-sm">✓ Complete</span>
                    </div>
                    <p className="text-slate-400 text-sm">Master Data Management (Profiles, Glass, Hardware)</p>
                    <div className="mt-2 flex gap-2">
                      <Link href="/master-data/profiles" className="text-xs text-emerald-400 hover:underline">Profiles →</Link>
                      <Link href="/master-data/glass" className="text-xs text-emerald-400 hover:underline">Glass →</Link>
                      <Link href="/master-data/hardware" className="text-xs text-emerald-400 hover:underline">Hardware →</Link>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-cyan-400 font-semibold">Sprint 2</span>
                      <span className="text-cyan-400 text-sm">✓ Complete</span>
                    </div>
                    <p className="text-slate-400 text-sm">Window Type Definitions & Visual Creator</p>
                    <div className="mt-2">
                      <Link href="/master-data/window-types" className="text-xs text-cyan-400 hover:underline">Window Types →</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other views remain the same... */}
          {activeView === 'saved' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Saved Quotes</h2>
              <div className="space-y-3">
                {savedQuotes.map(quote => {
                  const badge = getStatusBadge(quote.status)
                  return (
                    <div key={quote.id} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-purple-400 text-sm font-mono">{quote.quoteNo}</span>
                          <h4 className="text-white font-semibold">{quote.siteName}</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-400 font-bold">{formatCurrency(quote.amount)}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${badge.bg} ${badge.text}`}>{badge.label}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeView === 'user' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">User Details & Branding</h2>
              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <p className="text-slate-400">Configure your company details and branding here.</p>
              </div>
            </div>
          )}

          {activeView === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <p className="text-slate-400">System configuration and preferences.</p>
              </div>
            </div>
          )}

          {(activeView === 'quotation' || activeView === 'billing') && (
            <div className="text-center py-20">
              <p className="text-slate-400">Coming in Sprint 3...</p>
            </div>
          )}

        </div>

        {/* Activity Log */}
        <div className="mx-6 mb-6 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Activity Log</span>
            <button onClick={() => setActivityLog([])} className="text-xs text-slate-600 hover:text-white">Clear</button>
          </div>
          <div className="max-h-24 overflow-y-auto text-xs font-mono">
            {activityLog.map((log, i) => (
              <div key={i} className="text-slate-400 truncate">{log}</div>
            ))}
          </div>
        </div>
      </main>

      {/* ==================== SITE DETAILS MODAL ==================== */}
      {showSiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">⚙️ Site Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Site Name</label>
                <input value={siteInfo.siteName} onChange={(e) => setSiteInfo({...siteInfo, siteName: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Quote No</label>
                <input value={siteInfo.quoteNo} onChange={(e) => setSiteInfo({...siteInfo, quoteNo: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Phone</label>
                <input value={siteInfo.phone} onChange={(e) => setSiteInfo({...siteInfo, phone: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Address</label>
                <textarea value={siteInfo.address} onChange={(e) => setSiteInfo({...siteInfo, address: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white" rows={3} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowSiteModal(false)} className="flex-1 px-4 py-2 rounded-xl bg-slate-700 text-white">Cancel</button>
              <button onClick={() => setShowSiteModal(false)} className="flex-1 px-4 py-2 rounded-xl bg-purple-600 text-white">Save</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
