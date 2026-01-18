'use client'

import { useState } from 'react'

export default function DashboardPage() {
  const [running, setRunning] = useState(false)
  const [engineStatus, setEngineStatus] = useState({
    upvc: 'idle',
    glass: 'idle', 
    steel: 'idle',
    hardware: 'idle'
  })
  const [steelMode, setSteelMode] = useState('full')
  const [showWindowModal, setShowWindowModal] = useState(false)
  
  // Demo data
  const [windows, setWindows] = useState([
    { id: 1, flat: 'F1', sl: 1, type: '2T', width: 1200, height: 1500, qty: 2, sqft: 38.75 },
    { id: 2, flat: 'F1', sl: 2, type: '2+1', width: 1500, height: 1200, qty: 1, sqft: 19.38 },
    { id: 3, flat: 'F2', sl: 1, type: 'FIX', width: 900, height: 600, qty: 3, sqft: 17.44 },
    { id: 4, flat: 'F2', sl: 2, type: 'CO', width: 600, height: 1200, qty: 2, sqft: 15.50 },
  ])

  const totalSqft = windows.reduce((sum, w) => sum + w.sqft, 0)
  const totalAmount = Math.round(totalSqft * 850 * 1.2)
  const perSqft = Math.round(totalAmount / totalSqft)

  const runAllEngines = async () => {
    setRunning(true)
    
    // Simulate running each engine
    const engines = ['upvc', 'glass', 'steel', 'hardware'] as const
    
    for (const engine of engines) {
      setEngineStatus(prev => ({ ...prev, [engine]: 'running' }))
      await new Promise(r => setTimeout(r, 800))
      setEngineStatus(prev => ({ ...prev, [engine]: 'done' }))
    }
    
    setRunning(false)
  }

  const addWindow = () => {
    const newId = Math.max(...windows.map(w => w.id)) + 1
    const newSl = windows.length + 1
    setWindows([...windows, {
      id: newId,
      flat: 'F1',
      sl: newSl,
      type: '2T',
      width: 1200,
      height: 1200,
      qty: 1,
      sqft: 15.5
    }])
  }

  const deleteWindow = (id: number) => {
    setWindows(windows.filter(w => w.id !== id))
  }

  const getStatusColor = (status: string) => {
    if (status === 'done') return 'bg-emerald-500'
    if (status === 'running') return 'bg-amber-500 animate-pulse'
    return 'bg-slate-600'
  }

  const getStatusBadge = (status: string) => {
    if (status === 'done') return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: '✓ Done' }
    if (status === 'running') return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Running...' }
    return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30', label: 'Ready' }
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ===== HEADER ===== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-500 flex items-center justify-center text-2xl font-black text-amber-900 shadow-lg shadow-amber-500/30">
              K
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Kings Optimizer Hub</h1>
              <p className="text-slate-400 text-sm">v2.0 — Web Edition • Demo Mode</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Steel Mode Selector */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-xs text-slate-400">Steel:</span>
              <select 
                value={steelMode}
                onChange={(e) => setSteelMode(e.target.value)}
                className="bg-transparent text-white text-sm outline-none cursor-pointer"
              >
                <option value="full">Full Height</option>
                <option value="partial">200mm Frame</option>
                <option value="mesh">Frame + Mesh</option>
              </select>
            </div>

            {/* Run All Button */}
            <button
              onClick={runAllEngines}
              disabled={running}
              className="px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3 shadow-xl shadow-purple-500/30 transition-all hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              {running ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Running...
                </>
              ) : (
                <>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
                  </span>
                  Run All Engines
                </>
              )}
            </button>
          </div>
        </div>

        {/* ===== STATUS LINE ===== */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-400">Site: <span className="text-white font-medium">Kumar Residence</span></span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Quote: <span className="text-purple-400 font-medium">Q-001</span></span>
          <span className="text-slate-600">•</span>
          <button 
            onClick={() => setShowWindowModal(true)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-purple-300 hover:border-purple-400/50 transition-all"
          >
            📋 Manage Windows ({windows.length})
          </button>
        </div>

        {/* ===== SUMMARY CARDS ===== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 backdrop-blur">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Total Sqft</p>
            <p className="text-3xl font-bold text-white">{totalSqft.toFixed(2)}</p>
            <p className="text-slate-500 text-sm mt-1">{windows.length} windows</p>
          </div>
          
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 backdrop-blur">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Per Sqft</p>
            <p className="text-3xl font-bold text-white">₹{perSqft.toLocaleString('en-IN')}</p>
            <p className="text-slate-500 text-sm mt-1">with 20% profit</p>
          </div>
          
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 backdrop-blur">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Total Amount</p>
            <p className="text-3xl font-bold text-emerald-400">₹{totalAmount.toLocaleString('en-IN')}</p>
            <p className="text-slate-500 text-sm mt-1">before GST</p>
          </div>
          
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 backdrop-blur">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Brand</p>
            <p className="text-3xl font-bold text-white">FENSTAS</p>
            <p className="text-slate-500 text-sm mt-1">5mm clear glass</p>
          </div>
        </div>

        {/* ===== EXPORT BUTTONS ===== */}
        <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Export Documents</h3>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 transition-all">
                📄 Quotation PDF
              </button>
              <button className="px-4 py-2 rounded-full text-sm font-medium bg-slate-700/80 text-white border border-slate-600 hover:bg-slate-600 transition-all">
                 icing️ Production List
              </button>
              <button className="px-4 py-2 rounded-full text-sm font-medium bg-slate-700/80 text-white border border-slate-600 hover:bg-slate-600 transition-all">
                📦 Packing List
              </button>
              <button className="px-4 py-2 rounded-full text-sm font-medium bg-slate-700/80 text-white border border-slate-600 hover:bg-slate-600 transition-all">
                ⚙️ Site Details
              </button>
            </div>
          </div>
          
          {/* Engine Progress */}
          <div className="mt-4 flex flex-wrap gap-2">
            {(['upvc', 'glass', 'steel', 'hardware'] as const).map((engine) => {
              const badge = getStatusBadge(engineStatus[engine])
              return (
                <div key={engine} className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 ${badge.bg} ${badge.text} border ${badge.border}`}>
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(engineStatus[engine])}`}></span>
                  {engine.toUpperCase()}: {badge.label}
                </div>
              )
            })}
          </div>
        </div>

        {/* ===== ENGINE RESULTS ===== */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'UPVC Profiles', icon: '🪟', status: engineStatus.upvc, stock: '24 pcs', waste: '4.2%', cost: '₹45,230' },
            { name: 'Glass Cutting', icon: '🔲', status: engineStatus.glass, stock: '8 sheets', waste: '12.5%', cost: '₹18,450' },
            { name: 'Steel Reinf.', icon: '🔩', status: engineStatus.steel, stock: '156 m', waste: '3.1%', cost: '₹8,920' },
            { name: 'Hardware', icon: '🔧', status: engineStatus.hardware, stock: '48 items', waste: '-', cost: '₹12,650' },
          ].map((engine, i) => {
            const badge = getStatusBadge(engine.status)
            return (
              <div key={i} className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 backdrop-blur hover:border-slate-600/50 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{engine.icon}</span>
                    <h4 className="font-semibold text-white">{engine.name}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text} border ${badge.border}`}>
                    {badge.label}
                  </span>
                </div>
                
                {engine.status === 'done' ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Stock Used</span>
                      <span className="text-white font-mono">{engine.stock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Waste</span>
                      <span className="text-white font-mono">{engine.waste}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-700/50">
                      <span className="text-slate-400">Cost</span>
                      <span className="text-emerald-400 font-semibold">{engine.cost}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">Click "Run All Engines" to optimize</p>
                )}
              </div>
            )
          })}
        </div>

        {/* ===== WINDOW LIST ===== */}
        <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Window List</h3>
            <button 
              onClick={addWindow}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-700 text-white border border-slate-600 hover:bg-slate-600 transition-all flex items-center gap-2"
            >
              <span>+</span> Add Window
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-3 text-slate-400 font-medium text-xs uppercase tracking-wider">SL</th>
                  <th className="text-left py-3 px-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Flat</th>
                  <th className="text-left py-3 px-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Width</th>
                  <th className="text-left py-3 px-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Height</th>
                  <th className="text-left py-3 px-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Qty</th>
                  <th className="text-left py-3 px-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Sqft</th>
                  <th className="text-left py-3 px-3 text-slate-400 font-medium text-xs uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {windows.map((w, i) => (
                  <tr key={w.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                    <td className="py-3 px-3 text-white">{w.sl}</td>
                    <td className="py-3 px-3 text-white">{w.flat}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-medium">
                        {w.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-white font-mono">{w.width}</td>
                    <td className="py-3 px-3 text-white font-mono">{w.height}</td>
                    <td className="py-3 px-3 text-white">{w.qty}</td>
                    <td className="py-3 px-3 text-emerald-400 font-mono">{w.sqft.toFixed(2)}</td>
                    <td className="py-3 px-3">
                      <button 
                        onClick={() => deleteWindow(w.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="text-center py-4 text-slate-500 text-sm">
          Kings Optimizer Hub v2.0 • Built with Next.js + Tailwind • 
          <span className="text-emerald-400"> Running on Vercel</span>
        </div>
      </div>
    </div>
  )
}