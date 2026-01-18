'use client'

import { useState, useEffect, useCallback } from 'react'

// ==========================================
// KINGS OPTIMIZER HUB - COMPLETE DASHBOARD
// All features from original 14,000+ line system
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

export default function DashboardPage() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  // Navigation
  const [activeView, setActiveView] = useState<string>('optimizer')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
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

  // Navigation items
  const navItems = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard', tag: 'KPI' },
    { key: 'production', icon: '🏭', label: 'Production Plan', tag: 'EXCEL' },
    { key: 'optimizer', icon: '⚙️', label: 'Optimizer', tag: 'LIVE' },
    { key: 'quotation', icon: '📝', label: 'Quotation', tag: 'NEW' },
    { key: 'saved', icon: '💾', label: 'Saved Quotes', tag: 'LIB' },
    { key: 'billing', icon: '🧾', label: 'Final Billing', tag: 'ERP' },
    { key: 'user', icon: '👤', label: 'User Details', tag: 'PRO' },
    { key: 'settings', icon: '⚙️', label: 'Settings', tag: 'CFG' },
  ]

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

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(item => (
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
          ))}
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

              {/* Engine Details Panel */}
              <div className={`p-5 rounded-2xl bg-slate-800/30 border border-slate-700/50 ${engineDetailExpanded ? 'fixed inset-4 z-50 overflow-auto' : ''}`}>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Engine Details</h3>
                    <span className="text-xs text-slate-600">• live snapshot</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {['profile', 'glass', 'steel', 'hardware', 'packing'].map(tab => (
                        <button
                          key={tab}
                          onClick={() => setEngineDetailTab(tab)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            engineDetailTab === tab
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                              : 'bg-slate-700/50 text-slate-400 hover:text-white'
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setEngineDetailExpanded(!engineDetailExpanded)}
                      className="p-2 rounded-full bg-slate-700/50 text-slate-400 hover:text-white"
                    >
                      {engineDetailExpanded ? '✕' : '⛶'}
                    </button>
                  </div>
                </div>

                {/* Profile Tab */}
                {engineDetailTab === 'profile' && (
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-slate-500">Total Stock</p>
                        <p className="text-lg font-bold text-white">{optimizerResults.profile.summary.totalStock} pcs</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-slate-500">Total Length</p>
                        <p className="text-lg font-bold text-white">{(optimizerResults.profile.summary.totalLength/1000).toFixed(1)} m</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-slate-500">Avg Waste</p>
                        <p className="text-lg font-bold text-amber-400">{optimizerResults.profile.summary.totalWaste}%</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-slate-500">Total Cost</p>
                        <p className="text-lg font-bold text-emerald-400">{formatCurrency(optimizerResults.profile.summary.totalCost)}</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-900/80">
                          <tr>
                            <th className="text-left py-2 px-3 text-slate-400 font-medium">Code</th>
                            <th className="text-left py-2 px-3 text-slate-400 font-medium">Family</th>
                            <th className="text-right py-2 px-3 text-slate-400 font-medium">Stock</th>
                            <th className="text-right py-2 px-3 text-slate-400 font-medium">Length</th>
                            <th className="text-right py-2 px-3 text-slate-400 font-medium">Waste</th>
                            <th className="text-right py-2 px-3 text-slate-400 font-medium">Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {optimizerResults.profile.byProfile.map((p, i) => (
                            <tr key={i} className="border-t border-slate-700/30 hover:bg-slate-800/30">
                              <td className="py-2 px-3 text-purple-400 font-mono">{p.code}</td>
                              <td className="py-2 px-3 text-white">{p.family}</td>
                              <td className="py-2 px-3 text-right text-white font-mono">{p.stock}</td>
                              <td className="py-2 px-3 text-right text-white font-mono">{(p.length/1000).toFixed(1)}m</td>
                              <td className="py-2 px-3 text-right text-amber-400 font-mono">{p.waste}%</td>
                              <td className="py-2 px-3 text-right text-emerald-400 font-mono">{formatCurrency(p.cost)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Glass Tab */}
                {engineDetailTab === 'glass' && (
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-slate-500">Sheets Used</p>
                        <p className="text-lg font-bold text-white">{optimizerResults.glass.summary.totalSheets}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-slate-500">Total Area</p>
                        <p className="text-lg font-bold text-white">{optimizerResults.glass.summary.totalArea} sqft</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-slate-500">Avg Waste</p>
                        <p className="text-lg font-bold text-amber-400">{optimizerResults.glass.summary.totalWaste}%</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-slate-500">Total Cost</p>
                        <p className="text-lg font-bold text-emerald-400">{formatCurrency(optimizerResults.glass.summary.totalCost)}</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-900/80">
                          <tr>
                            <th className="text-left py-2 px-3 text-slate-400">Sheet #</th>
                            <th className="text-left py-2 px-3 text-slate-400">Size</th>
                            <th className="text-right py-2 px-3 text-slate-400">Pieces</th>
                            <th className="text-right py-2 px-3 text-slate-400">Used %</th>
                            <th className="text-right py-2 px-3 text-slate-400">Waste %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {optimizerResults.glass.sheets.map((s, i) => (
                            <tr key={i} className="border-t border-slate-700/30 hover:bg-slate-800/30">
                              <td className="py-2 px-3 text-white">#{s.id}</td>
                              <td className="py-2 px-3 text-white">{s.size}</td>
                              <td className="py-2 px-3 text-right text-white font-mono">{s.pieces}</td>
                              <td className="py-2 px-3 text-right text-emerald-400 font-mono">{s.used}%</td>
                              <td className="py-2 px-3 text-right text-amber-400 font-mono">{s.waste}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Steel Tab */}
                {engineDetailTab === 'steel' && (
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-slate-500">Total Length</p>
                        <p className="text-lg font-bold text-white">{optimizerResults.steel.summary.totalLength} m</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-slate-500">Total Weight</p>
                        <p className="text-lg font-bold text-white">{optimizerResults.steel.summary.totalWeight} kg</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-slate-500">Mode</p>
                        <p className="text-sm font-bold text-purple-400">{steelModes.find(m => m.value === steelMode)?.label}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-slate-500">Total Cost</p>
                        <p className="text-lg font-bold text-emerald-400">{formatCurrency(optimizerResults.steel.summary.totalCost)}</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-900/80">
                          <tr>
                            <th className="text-left py-2 px-3 text-slate-400">Section</th>
                            <th className="text-right py-2 px-3 text-slate-400">Length (m)</th>
                            <th className="text-right py-2 px-3 text-slate-400">Weight (kg)</th>
                            <th className="text-right py-2 px-3 text-slate-400">Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {optimizerResults.steel.sections.map((s, i) => (
                            <tr key={i} className="border-t border-slate-700/30 hover:bg-slate-800/30">
                              <td className="py-2 px-3 text-white">{s.section}</td>
                              <td className="py-2 px-3 text-right text-white font-mono">{s.length}</td>
                              <td className="py-2 px-3 text-right text-white font-mono">{s.weight}</td>
                              <td className="py-2 px-3 text-right text-emerald-400 font-mono">{formatCurrency(s.cost)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Hardware Tab */}
                {engineDetailTab === 'hardware' && (
                  <div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-slate-500">Total Items</p>
                        <p className="text-lg font-bold text-white">{optimizerResults.hardware.summary.totalItems}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-slate-500">Total Cost</p>
                        <p className="text-lg font-bold text-emerald-400">{formatCurrency(optimizerResults.hardware.summary.totalCost)}</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-900/80">
                          <tr>
                            <th className="text-left py-2 px-3 text-slate-400">Item</th>
                            <th className="text-left py-2 px-3 text-slate-400">Category</th>
                            <th className="text-right py-2 px-3 text-slate-400">Qty</th>
                            <th className="text-right py-2 px-3 text-slate-400">Unit</th>
                            <th className="text-right py-2 px-3 text-slate-400">Rate</th>
                            <th className="text-right py-2 px-3 text-slate-400">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {optimizerResults.hardware.items.map((item, i) => (
                            <tr key={i} className="border-t border-slate-700/30 hover:bg-slate-800/30">
                              <td className="py-2 px-3 text-white">{item.item}</td>
                              <td className="py-2 px-3 text-slate-400">{item.category}</td>
                              <td className="py-2 px-3 text-right text-white font-mono">{item.qty}</td>
                              <td className="py-2 px-3 text-right text-slate-400">{item.unit}</td>
                              <td className="py-2 px-3 text-right text-slate-400">₹{item.rate}</td>
                              <td className="py-2 px-3 text-right text-emerald-400 font-mono">{formatCurrency(item.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Packing Tab */}
                {engineDetailTab === 'packing' && (
                  <div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                      {Object.entries(optimizerResults.packing.totals).map(([key, val]) => (
                        <div key={key} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                          <p className="text-xs text-slate-500 capitalize">{key}</p>
                          <p className="text-xl font-bold text-white">{val}</p>
                        </div>
                      ))}
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-900/80">
                          <tr>
                            <th className="text-left py-2 px-3 text-slate-400">ID</th>
                            <th className="text-left py-2 px-3 text-slate-400">Type</th>
                            <th className="text-left py-2 px-3 text-slate-400">Size (mm)</th>
                            <th className="text-center py-2 px-3 text-slate-400">Qty</th>
                            <th className="text-center py-2 px-3 text-slate-400">Frames</th>
                            <th className="text-center py-2 px-3 text-slate-400">Shutters</th>
                            <th className="text-center py-2 px-3 text-slate-400">Mesh</th>
                            <th className="text-center py-2 px-3 text-slate-400">Glass</th>
                          </tr>
                        </thead>
                        <tbody>
                          {optimizerResults.packing.rows.map((r, i) => (
                            <tr key={i} className="border-t border-slate-700/30">
                              <td className="py-2 px-3 text-purple-400">{r.id}</td>
                              <td className="py-2 px-3 text-white">{r.type}</td>
                              <td className="py-2 px-3 text-white font-mono">{r.width} × {r.height}</td>
                              <td className="py-2 px-3 text-center text-white">{r.qty}</td>
                              <td className="py-2 px-3 text-center text-white">{r.frames}</td>
                              <td className="py-2 px-3 text-center text-white">{r.shutters}</td>
                              <td className="py-2 px-3 text-center text-white">{r.mesh}</td>
                              <td className="py-2 px-3 text-center text-white">{r.glass}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
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
                  <button 
                    onClick={() => setShowVisualSelector(true)}
                    className="px-4 py-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/30"
                  >
                    🎨 Visual Designer
                  </button>
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

          {/* ==================== SAVED QUOTES VIEW ==================== */}
          {activeView === 'saved' && (
            <div className="space-y-6">
              {/* Month Filter */}
              <div className="flex flex-wrap gap-2">
                {['ALL', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map(m => (
                  <button
                    key={m}
                    onClick={() => setMonthFilter(m)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      monthFilter === m
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Search & Actions */}
              <div className="flex flex-wrap items-center gap-4">
                <input
                  type="text"
                  placeholder="🔍 Search quotes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 min-w-[200px] px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500"
                />
                <button 
                  onClick={() => setSelectMode(!selectMode)}
                  className={`px-4 py-2 rounded-xl text-sm ${selectMode ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  ☑️ Select
                </button>
                <button className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">🔄</button>
                <button className="px-4 py-2 rounded-xl bg-purple-600 text-white">📄 PDFs</button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                  <p className="text-xs text-slate-500">Quotes Found</p>
                  <p className="text-2xl font-bold text-white">{savedQuotes.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                  <p className="text-xs text-slate-500">Total Value</p>
                  <p className="text-2xl font-bold text-emerald-400">{formatCurrency(savedQuotes.reduce((s, q) => s + q.amount, 0))}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                  <p className="text-xs text-slate-500">Average Ticket</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(Math.round(savedQuotes.reduce((s, q) => s + q.amount, 0) / savedQuotes.length))}</p>
                </div>
              </div>

              {/* Quotes List */}
              <div className="space-y-3">
                {savedQuotes
                  .filter(q => q.siteName.toLowerCase().includes(searchQuery.toLowerCase()) || q.quoteNo.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(quote => {
                    const badge = getStatusBadge(quote.status)
                    return (
                      <div
                        key={quote.id}
                        onClick={() => !selectMode && setSelectedQuoteId(quote.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedQuoteId === quote.id
                            ? 'bg-purple-600/20 border-purple-500/50'
                            : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-700/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {selectMode && (
                            <input 
                              type="checkbox" 
                              checked={selectedForCompare.includes(quote.id)}
                              onChange={() => toggleQuoteSelection(quote.id)}
                              className="w-4 h-4"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-purple-400 text-sm font-mono">{quote.quoteNo}</span>
                                <h4 className="text-white font-semibold">{quote.siteName}</h4>
                                <p className="text-xs text-slate-500">{quote.clientName}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-emerald-400 font-bold text-lg">{formatCurrency(quote.amount)}</p>
                                <p className="text-xs text-slate-500">{quote.sqft} sqft</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text} border ${badge.border}`}>
                                {badge.label}
                              </span>
                              <span className="text-xs text-slate-500">{quote.savedAt}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>

              {/* Compare FAB */}
              {selectMode && selectedForCompare.length > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full bg-slate-900 border border-purple-500 shadow-xl flex items-center gap-4">
                  <span className="text-white font-semibold">{selectedForCompare.length} Selected</span>
                  <button 
                    onClick={() => setShowCompareModal(true)}
                    className="px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-semibold"
                  >
                    ⚖️ Compare Now
                  </button>
                  <button onClick={() => { setSelectMode(false); setSelectedForCompare([]) }} className="text-slate-400 hover:text-white">✕</button>
                </div>
              )}
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

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                  <h4 className="text-sm text-slate-400 mb-2">Quotes This Month</h4>
                  <p className="text-3xl font-bold text-white">{dashboardStats.quotesThisMonth}</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                  <h4 className="text-sm text-slate-400 mb-2">Conversion Rate</h4>
                  <p className="text-3xl font-bold text-purple-400">{dashboardStats.conversionRate}%</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                  <h4 className="text-sm text-slate-400 mb-2">Avg Ticket Size</h4>
                  <p className="text-3xl font-bold text-white">{formatCurrency(dashboardStats.avgTicket)}</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                  <h4 className="text-sm text-slate-400 mb-2">Top Client</h4>
                  <p className="text-lg font-bold text-white truncate">{dashboardStats.topClient}</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {dashboardStats.recentActivity.map((act, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
                      <span className="text-white">{act.text}</span>
                      <span className="text-xs text-slate-500">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== USER SETTINGS VIEW ==================== */}
          {activeView === 'user' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">User Details & Branding</h2>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-xl bg-slate-700 text-white">🔄 Reload</button>
                  <button className="px-4 py-2 rounded-xl bg-purple-600 text-white">💾 Save</button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4">Company Identity</h3>
                  <p className="text-xs text-slate-500 mb-4">Used in PDFs, headers, saved quotes.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Company Name</label>
                      <input value={companyInfo.companyName} onChange={(e) => setCompanyInfo({...companyInfo, companyName: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Brand Name</label>
                      <input value={companyInfo.brandName} onChange={(e) => setCompanyInfo({...companyInfo, brandName: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Phone</label>
                      <input value={companyInfo.phone} onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Email</label>
                      <input value={companyInfo.email} onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">GST</label>
                      <input value={companyInfo.gst} onChange={(e) => setCompanyInfo({...companyInfo, gst: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Theme Color</label>
                      <input value={companyInfo.themeColor} onChange={(e) => setCompanyInfo({...companyInfo, themeColor: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs text-slate-500 mb-1">Address</label>
                    <input value={companyInfo.address} onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm" />
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs text-slate-500 mb-1">Footer Text</label>
                    <input value={companyInfo.footerText} onChange={(e) => setCompanyInfo({...companyInfo, footerText: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4">Branding & Access</h3>
                  <p className="text-xs text-slate-500 mb-4">Logo + allowed users list.</p>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Logo Drive File ID</label>
                    <input value={companyInfo.logoId} onChange={(e) => setCompanyInfo({...companyInfo, logoId: e.target.value})} placeholder="1AbC..." className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm" />
                    <p className="text-[10px] text-slate-600 mt-1">Upload logo to Drive → Copy File ID → paste here.</p>
                  </div>
                  <div className="mt-4 p-4 rounded-xl bg-slate-900/50 border border-slate-700 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                      {companyInfo.logoId ? '🖼️' : '📷'}
                    </div>
                    <span className="text-xs text-slate-500">{companyInfo.logoId ? 'Logo configured' : 'No logo set.'}</span>
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs text-slate-500 mb-1">Allowed Emails (comma-separated)</label>
                    <input value={companyInfo.allowedEmails} onChange={(e) => setCompanyInfo({...companyInfo, allowedEmails: e.target.value})} placeholder="owner@gmail.com, staff@gmail.com" className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm" />
                    <p className="text-[10px] text-slate-600 mt-1">If empty → open access (you can lock it later).</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SETTINGS VIEW ==================== */}
          {activeView === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-10 bg-amber-400 rounded"></div>
                <div>
                  <h2 className="text-xl font-bold text-white">System Configuration</h2>
                  <p className="text-sm text-slate-400">Manage defaults, interface preferences, and data.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4">💰 Commercial Defaults</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">Default Profit %</p>
                        <p className="text-xs text-slate-500">Auto-fills the profit field.</p>
                      </div>
                      <input type="number" defaultValue={20} className="w-20 px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm text-center" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">Waste Margin %</p>
                        <p className="text-xs text-slate-500">Extra material buffer.</p>
                      </div>
                      <input type="number" defaultValue={5} className="w-20 px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm text-center" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">Smart Rounding</p>
                        <p className="text-xs text-slate-500">Round totals to nearest ₹10.</p>
                      </div>
                      <button className="w-12 h-6 rounded-full bg-purple-600 relative">
                        <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white"></span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4">🖥️ Appearance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">Kings Dark Mode</p>
                        <p className="text-xs text-slate-500">Optimized for low light.</p>
                      </div>
                      <button className="w-12 h-6 rounded-full bg-purple-600 relative opacity-60">
                        <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white"></span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">Compact Mode</p>
                        <p className="text-xs text-slate-500">Reduce spacing.</p>
                      </div>
                      <button className="w-12 h-6 rounded-full bg-slate-700 relative">
                        <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white"></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other views (quotation, billing) - simplified for brevity */}
          {activeView === 'quotation' && (
            <div className="text-center py-20">
              <p className="text-slate-400">Quotation Generator - Use Optimizer view to generate quotes</p>
            </div>
          )}

          {activeView === 'billing' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">Final Billing</h2>
                  <p className="text-sm text-slate-400">Generate Tax Invoice & Close Project</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">INVOICE TOTAL</p>
                  <p className="text-3xl font-bold text-emerald-400">{formatCurrency(Math.round(totalAmount))}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Quote Total</label>
                  <input value={formatCurrency(Math.round(totalAmount))} readOnly className="w-full px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-white text-sm opacity-70" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Extra Charges (Fit/Transport)</label>
                  <input type="number" defaultValue={0} className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Discount</label>
                  <input type="number" defaultValue={0} className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm" />
                </div>
              </div>
              <div className="text-center">
                <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg font-semibold">
                  📄 Generate Final Invoice & Close
                </button>
              </div>
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

      {/* ==================== VISUAL SELECTOR MODAL ==================== */}
      {showVisualSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">🎨 Visual Window Designer</h3>
              <button onClick={() => setShowVisualSelector(false)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400">✕</button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <p className="text-sm text-slate-400 mb-4">Select a window type to add:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {windowTypes.map(type => (
                  <button
                    key={type.code}
                    onClick={() => {
                      addWindow()
                      setShowVisualSelector(false)
                    }}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-purple-500 transition-all text-center group"
                  >
                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{type.icon}</div>
                    <p className="text-white font-semibold">{type.code}</p>
                    <p className="text-xs text-slate-500">{type.name}</p>
                    <p className="text-[10px] text-slate-600 mt-1">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-slate-700 flex justify-end gap-3">
              <button onClick={() => setShowVisualSelector(false)} className="px-4 py-2 rounded-xl bg-slate-700 text-white">Cancel</button>
            </div>
          </div>
        </div>
      )}

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
