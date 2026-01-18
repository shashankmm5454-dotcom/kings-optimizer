'use client'

import { useState } from 'react'

export default function DashboardPage() {
  const [running, setRunning] = useState(false)

  const runAllEngines = () => {
    setRunning(true)
    setTimeout(() => {
      setRunning(false)
      alert('All engines completed! (Demo)')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-500 flex items-center justify-center text-xl font-bold text-amber-900">
              K
            </div>
            <div>
              <h1 className="text-xl font-bold">Kings Optimizer Hub</h1>
              <p className="text-slate-400 text-sm">v2.0 - Web Edition</p>
            </div>
          </div>
          
          <button
            onClick={runAllEngines}
            disabled={running}
            className="px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-purple-500 disabled:opacity-50 flex items-center gap-3 shadow-lg shadow-purple-500/25"
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
                <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></span>
                Run All Engines
              </>
            )}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Sqft</p>
            <p className="text-2xl font-bold">245.50</p>
            <p className="text-slate-500 text-sm">12 windows</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Per Sqft</p>
            <p className="text-2xl font-bold">₹850</p>
            <p className="text-slate-500 text-sm">with 20% profit</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-emerald-400">₹2,08,675</p>
            <p className="text-slate-500 text-sm">before GST</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Brand</p>
            <p className="text-2xl font-bold">FENSTAS</p>
            <p className="text-slate-500 text-sm">5mm clear glass</p>
          </div>
        </div>

        {/* Engine Status */}
        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 mb-8">
          <h2 className="text-lg font-semibold mb-4">Optimizer Engines</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['UPVC Profiles', 'Glass Cutting', 'Steel Reinf.', 'Hardware'].map((engine, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-900/50 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{engine}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Ready
                  </span>
                </div>
                <p className="text-slate-500 text-xs">Click "Run All" to optimize</p>
              </div>
            ))}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700">
          <h2 className="text-lg font-semibold mb-4">Export Documents</h2>
          <div className="flex flex-wrap gap-3">
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-sm hover:opacity-90">
              📄 Export Quotation
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-slate-700 text-white font-medium text-sm hover:bg-slate-600 border border-slate-600">
               icing️ Production List
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-slate-700 text-white font-medium text-sm hover:bg-slate-600 border border-slate-600">
              📦 Packing List
            </button>
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <p className="text-emerald-400 text-lg font-semibold mb-2">
            🎉 Congratulations! Your app is working!
          </p>
          <p className="text-slate-400">
            This is a demo dashboard. Add Supabase integration to enable full functionality.
          </p>
        </div>
      </div>
    </div>
  )
}