'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  Play,
  FileDown,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  ChevronDown,
  Settings,
  FileText,
  Layers,
  Cpu,
  Package,
} from 'lucide-react'
import type { Project, Window, OptimizerResult } from '@/lib/types'
import { runUPVCOptimizer } from '@/lib/optimizers/upvc'
import { runGlassOptimizer } from '@/lib/optimizers/glass'
import { runSteelOptimizer } from '@/lib/optimizers/steel'
import { runHardwareOptimizer } from '@/lib/optimizers/hardware'
import { generateQuotationPDF } from '@/lib/export/quotation-pdf'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const supabase = createClient()

  const [project, setProject] = useState<Project | null>(null)
  const [windows, setWindows] = useState<Window[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState(false)
  const [activeTab, setActiveTab] = useState<'windows' | 'optimizer' | 'export'>('windows')
  
  // Optimizer results
  const [upvcResult, setUpvcResult] = useState<OptimizerResult | null>(null)
  const [glassResult, setGlassResult] = useState<OptimizerResult | null>(null)
  const [steelResult, setSteelResult] = useState<OptimizerResult | null>(null)
  const [hardwareResult, setHardwareResult] = useState<any>(null)

  // Optimizer status
  const [engineStatus, setEngineStatus] = useState({
    upvc: 'idle',
    glass: 'idle',
    steel: 'idle',
    hardware: 'idle',
  })

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    setLoading(true)
    
    // Fetch project
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError) {
      toast.error('Project not found')
      router.push('/projects')
      return
    }

    setProject(projectData)

    // Fetch windows
    const { data: windowsData } = await supabase
      .from('windows')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })

    setWindows(windowsData || [])
    setLoading(false)
  }

  // ==========================================
  // WINDOW MANAGEMENT
  // ==========================================

  const addWindow = () => {
    const newWindow: Partial<Window> = {
      id: `temp-${Date.now()}`,
      project_id: projectId,
      flat_no: '',
      sl_no: windows.length + 1,
      opening_type: '2T',
      width: 1200,
      height: 1200,
      qty: 1,
      sqft: 0,
    }
    setWindows([...windows, newWindow as Window])
  }

  const updateWindow = (index: number, field: keyof Window, value: any) => {
    const updated = [...windows]
    updated[index] = { ...updated[index], [field]: value }
    
    // Auto-calculate sqft
    if (field === 'width' || field === 'height' || field === 'qty') {
      const w = field === 'width' ? value : updated[index].width
      const h = field === 'height' ? value : updated[index].height
      const q = field === 'qty' ? value : updated[index].qty
      updated[index].sqft = Math.round((w * h * q) / 92903.04 * 100) / 100
    }
    
    setWindows(updated)
  }

  const deleteWindow = (index: number) => {
    const updated = windows.filter((_, i) => i !== index)
    // Re-number
    updated.forEach((w, i) => {
      w.sl_no = i + 1
    })
    setWindows(updated)
  }

  const saveWindows = async () => {
    setSaving(true)
    try {
      // Delete existing windows
      await supabase
        .from('windows')
        .delete()
        .eq('project_id', projectId)

      // Insert new windows (filter out temp IDs)
      const windowsToInsert = windows.map((w, i) => ({
        project_id: projectId,
        flat_no: w.flat_no,
        sl_no: i + 1,
        opening_type: w.opening_type,
        width: w.width,
        height: w.height,
        sw: w.sw,
        sh: w.sh,
        mw: w.mw,
        mh: w.mh,
        qty: w.qty || 1,
        glass_type: w.glass_type,
        mesh_type: w.mesh_type,
        remarks: w.remarks,
        sort_order: i,
      }))

      const { error } = await supabase
        .from('windows')
        .insert(windowsToInsert)

      if (error) throw error

      // Update project totals
      const totalSqft = windows.reduce((sum, w) => sum + (w.sqft || 0), 0)
      await supabase
        .from('projects')
        .update({ total_sqft: totalSqft, updated_at: new Date().toISOString() })
        .eq('id', projectId)

      toast.success('Windows saved!')
      fetchProject()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  // ==========================================
  // RUN ALL OPTIMIZERS
  // ==========================================

  const runAllEngines = async () => {
    if (windows.length === 0) {
      toast.error('Add windows first')
      return
    }

    setRunning(true)
    const startTime = Date.now()

    try {
      // Run engines in parallel
      setEngineStatus({ upvc: 'running', glass: 'running', steel: 'running', hardware: 'running' })

      const [upvc, glass, steel, hardware] = await Promise.all([
        runUPVCOptimizer(windows, project!),
        runGlassOptimizer(windows, project!),
        runSteelOptimizer(windows, project!),
        runHardwareOptimizer(windows, project!),
      ])

      setUpvcResult(upvc)
      setGlassResult(glass)
      setSteelResult(steel)
      setHardwareResult(hardware)

      setEngineStatus({ upvc: 'done', glass: 'done', steel: 'done', hardware: 'done' })

      // Calculate total
      const totalCost =
        (upvc?.summary?.total_cost || 0) +
        (glass?.summary?.total_cost || 0) +
        (steel?.summary?.total_cost || 0) +
        (hardware?.total_cost || 0)

      const perSqft = project!.total_sqft > 0 
        ? totalCost / project!.total_sqft 
        : 0

      // Apply profit
      const profitMultiplier = 1 + (project!.profit_pct / 100)
      const finalAmount = totalCost * profitMultiplier

      // Update project
      await supabase
        .from('projects')
        .update({
          total_amount: Math.round(finalAmount),
          per_sqft: Math.round(perSqft * profitMultiplier),
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
      toast.success(`All engines completed in ${elapsed}s`)
      
      fetchProject()
    } catch (error: any) {
      toast.error(error.message || 'Optimizer failed')
      setEngineStatus({ upvc: 'error', glass: 'error', steel: 'error', hardware: 'error' })
    } finally {
      setRunning(false)
    }
  }

  // ==========================================
  // EXPORT PDF
  // ==========================================

  const exportQuotation = async () => {
    if (!project || windows.length === 0) {
      toast.error('No data to export')
      return
    }

    toast.loading('Generating PDF...')
    
    try {
      const pdf = await generateQuotationPDF(project, windows)
      
      // Download
      const fileName = `${project.site_name}_${project.quote_no}_Quotation.pdf`
      pdf.save(fileName)
      
      toast.dismiss()
      toast.success('PDF downloaded!')
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'PDF generation failed')
    }
  }

  // ==========================================
  // RENDER
  // ==========================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="spinner" />
      </div>
    )
  }

  if (!project) return null

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-[var(--accent)]">{project.quote_no}</span>
            <span className={`badge badge-${project.status === 'DRAFT' ? 'info' : 'success'}`}>
              {project.status}
            </span>
          </div>
          <h1 className="text-2xl font-bold">{project.site_name}</h1>
          {project.customer_name && (
            <p className="text-[var(--text-soft)] mt-1">{project.customer_name}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={runAllEngines} disabled={running} className="run-all-btn">
            {running ? (
              <>
                <span className="spinner" />
                Running...
              </>
            ) : (
              <>
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                  <span className="pulse-dot" />
                </div>
                Run All Engines
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="summary-card">
          <div className="summary-label">Total Sqft</div>
          <div className="summary-value">{(project.total_sqft || 0).toFixed(2)}</div>
          <div className="summary-sub">{windows.length} windows</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Per Sqft</div>
          <div className="summary-value">{formatCurrency(project.per_sqft || 0)}</div>
          <div className="summary-sub">with {project.profit_pct}% profit</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Amount</div>
          <div className="summary-value text-[var(--success)]">
            {formatCurrency(project.total_amount || 0)}
          </div>
          <div className="summary-sub">before GST</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Brand</div>
          <div className="summary-value">{project.brand}</div>
          <div className="summary-sub">{project.glass_option} glass</div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="surface">
        <div className="flex flex-wrap gap-3">
          <button onClick={exportQuotation} className="pill-btn primary">
            <FileText size={14} className="mr-2" />
            Export Quotation
          </button>
          <button className="pill-btn">
            <Layers size={14} className="mr-2" />
            Production List
          </button>
          <button className="pill-btn">
            <Package size={14} className="mr-2" />
            Packing List
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="surface">
        <div className="flex gap-2 mb-4 border-b border-[var(--border-soft)] pb-4">
          {['windows', 'optimizer', 'export'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pill-btn ${activeTab === tab ? 'primary' : ''}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Windows Tab */}
        {activeTab === 'windows' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Window List</h3>
              <div className="flex gap-2">
                <button onClick={addWindow} className="pill-btn">
                  <Plus size={14} className="mr-1" /> Add Window
                </button>
                <button onClick={saveWindows} disabled={saving} className="pill-btn primary">
                  {saving ? <span className="spinner" /> : <Save size={14} className="mr-1" />}
                  Save
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SL</th>
                    <th>Flat</th>
                    <th>Type</th>
                    <th>Width</th>
                    <th>Height</th>
                    <th>Qty</th>
                    <th>Sqft</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {windows.map((w, i) => (
                    <tr key={w.id || i}>
                      <td>{w.sl_no}</td>
                      <td>
                        <input
                          type="text"
                          value={w.flat_no || ''}
                          onChange={(e) => updateWindow(i, 'flat_no', e.target.value)}
                          className="input-field w-20 text-sm"
                          placeholder="F1"
                        />
                      </td>
                      <td>
                        <select
                          value={w.opening_type}
                          onChange={(e) => updateWindow(i, 'opening_type', e.target.value)}
                          className="select-field text-sm"
                        >
                          <option value="2T">2T Sliding</option>
                          <option value="2+1">2+1 Mesh</option>
                          <option value="3T">3T Sliding</option>
                          <option value="FIX">Fixed</option>
                          <option value="CO">Casement</option>
                          <option value="VRH">Ventilator RH</option>
                          <option value="VLH">Ventilator LH</option>
                          <option value="FD2P">Door 2P</option>
                          <option value="FD3P">Door 3P</option>
                          <option value="FD4P">Door 4P</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={w.width}
                          onChange={(e) => updateWindow(i, 'width', Number(e.target.value))}
                          className="input-field w-20 text-sm"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={w.height}
                          onChange={(e) => updateWindow(i, 'height', Number(e.target.value))}
                          className="input-field w-20 text-sm"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={w.qty}
                          onChange={(e) => updateWindow(i, 'qty', Number(e.target.value))}
                          className="input-field w-16 text-sm"
                          min="1"
                        />
                      </td>
                      <td className="font-mono">{(w.sqft || 0).toFixed(2)}</td>
                      <td>
                        <button
                          onClick={() => deleteWindow(i)}
                          className="p-2 rounded hover:bg-[var(--danger)]/20 text-[var(--danger)]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {windows.length === 0 && (
              <div className="text-center py-8 text-[var(--text-soft)]">
                No windows added yet. Click "Add Window" to start.
              </div>
            )}
          </div>
        )}

        {/* Optimizer Tab */}
        {activeTab === 'optimizer' && (
          <div className="space-y-4">
            <h3 className="font-semibold">Optimizer Results</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* UPVC Result */}
              <div className="card">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">UPVC Profiles</h4>
                  <span className={`badge badge-${engineStatus.upvc === 'done' ? 'success' : 'info'}`}>
                    {engineStatus.upvc}
                  </span>
                </div>
                {upvcResult ? (
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-soft)]">Total Stock</span>
                      <span className="font-mono">{upvcResult.summary.total_stock} pcs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-soft)]">Total Waste</span>
                      <span className="font-mono">{upvcResult.summary.total_waste_pct.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-soft)]">Cost</span>
                      <span className="font-mono text-[var(--success)]">
                        {formatCurrency(upvcResult.summary.total_cost)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-soft)]">Run engines to see results</p>
                )}
              </div>

              {/* Glass Result */}
              <div className="card">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Glass</h4>
                  <span className={`badge badge-${engineStatus.glass === 'done' ? 'success' : 'info'}`}>
                    {engineStatus.glass}
                  </span>
                </div>
                {glassResult ? (
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-soft)]">Sheets Used</span>
                      <span className="font-mono">{glassResult.summary.total_stock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-soft)]">Cost</span>
                      <span className="font-mono text-[var(--success)]">
                        {formatCurrency(glassResult.summary.total_cost)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-soft)]">Run engines to see results</p>
                )}
              </div>

              {/* Steel Result */}
              <div className="card">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Steel</h4>
                  <span className={`badge badge-${engineStatus.steel === 'done' ? 'success' : 'info'}`}>
                    {engineStatus.steel}
                  </span>
                </div>
                {steelResult ? (
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-soft)]">Total Length</span>
                      <span className="font-mono">{(steelResult.summary.total_pieces / 1000).toFixed(2)} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-soft)]">Cost</span>
                      <span className="font-mono text-[var(--success)]">
                        {formatCurrency(steelResult.summary.total_cost)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-soft)]">Run engines to see results</p>
                )}
              </div>

              {/* Hardware Result */}
              <div className="card">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Hardware</h4>
                  <span className={`badge badge-${engineStatus.hardware === 'done' ? 'success' : 'info'}`}>
                    {engineStatus.hardware}
                  </span>
                </div>
                {hardwareResult ? (
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-soft)]">Items</span>
                      <span className="font-mono">{hardwareResult.items?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-soft)]">Cost</span>
                      <span className="font-mono text-[var(--success)]">
                        {formatCurrency(hardwareResult.total_cost || 0)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-soft)]">Run engines to see results</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}