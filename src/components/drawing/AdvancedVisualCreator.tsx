'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// ===============================================
// ADVANCED VISUAL CREATOR - CAD/PHOTOSHOP STYLE
// Drag, Resize, Precise Controls, Custom Shapes
// ===============================================

// Types
interface Point {
  x: number
  y: number
}

interface Panel {
  id: string
  x: number      // mm from left
  y: number      // mm from top
  width: number  // mm
  height: number // mm
  type: 'FIXED' | 'SLIDING' | 'CASEMENT' | 'TILT_TURN' | 'TOP_HUNG' | 'AWNING'
  openDirection?: 'LEFT' | 'RIGHT' | 'INWARD' | 'OUTWARD'
  handleSide?: 'LEFT' | 'RIGHT'
  hasMesh: boolean
  track?: number
  label: string
  zIndex: number
}

interface Mullion {
  id: string
  x: number      // mm from left
  y1: number     // start mm from top
  y2: number     // end mm from top
  thickness: number // mm
}

interface Transom {
  id: string
  y: number      // mm from top
  x1: number     // start mm from left
  x2: number     // end mm from left
  thickness: number // mm
}

interface WindowDesign {
  id: string
  name: string
  code: string
  category: string
  frameWidth: number   // mm
  frameHeight: number  // mm
  frameThickness: number // mm (profile thickness)
  panels: Panel[]
  mullions: Mullion[]
  transoms: Transom[]
  createdAt: string
  updatedAt: string
}

interface DragState {
  isDragging: boolean
  type: 'panel' | 'mullion' | 'transom' | 'resize' | null
  id: string | null
  startPoint: Point
  startElement: any
  resizeHandle?: string
}

interface AdvancedVisualCreatorProps {
  initialDesign?: WindowDesign
  onSave?: (design: WindowDesign) => void
  onExport?: (svg: string) => void
}

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9)

const snapToGrid = (value: number, gridSize: number = 5): number => {
  return Math.round(value / gridSize) * gridSize
}

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

export default function AdvancedVisualCreator({ 
  initialDesign, 
  onSave, 
  onExport 
}: AdvancedVisualCreatorProps) {
  // Canvas refs
  const canvasRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Design state
  const [design, setDesign] = useState<WindowDesign>(initialDesign || {
    id: generateId(),
    name: 'New Window',
    code: '2T',
    category: 'SLIDING',
    frameWidth: 1200,
    frameHeight: 1500,
    frameThickness: 60,
    panels: [
      { id: generateId(), x: 60, y: 60, width: 540, height: 1380, type: 'SLIDING', openDirection: 'RIGHT', handleSide: 'RIGHT', hasMesh: false, track: 1, label: 'L', zIndex: 1 },
      { id: generateId(), x: 600, y: 60, width: 540, height: 1380, type: 'SLIDING', openDirection: 'LEFT', handleSide: 'LEFT', hasMesh: false, track: 2, label: 'R', zIndex: 2 },
    ],
    mullions: [],
    transoms: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  // UI state
  const [zoom, setZoom] = useState(0.4)
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<'panel' | 'mullion' | 'transom' | null>(null)
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    type: null,
    id: null,
    startPoint: { x: 0, y: 0 },
    startElement: null,
  })
  const [showGrid, setShowGrid] = useState(true)
  const [snapEnabled, setSnapEnabled] = useState(true)
  const [gridSize, setGridSize] = useState(10)
  const [tool, setTool] = useState<'select' | 'panel' | 'mullion' | 'transom' | 'pan'>('select')
  const [showDimensions, setShowDimensions] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [showMaterials, setShowMaterials] = useState(false)

  // Panel type being added
  const [newPanelType, setNewPanelType] = useState<Panel['type']>('FIXED')

  // History for undo/redo
  const [history, setHistory] = useState<WindowDesign[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Calculate scale for display
  const scale = zoom

  // Get selected element
  const getSelectedElement = () => {
    if (!selectedId || !selectedType) return null
    if (selectedType === 'panel') return design.panels.find(p => p.id === selectedId)
    if (selectedType === 'mullion') return design.mullions.find(m => m.id === selectedId)
    if (selectedType === 'transom') return design.transoms.find(t => t.id === selectedId)
    return null
  }

  // Convert screen coordinates to design coordinates
  const screenToDesign = useCallback((screenX: number, screenY: number): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (screenX - rect.left - pan.x) / scale
    const y = (screenY - rect.top - pan.y) / scale
    return { x: snapEnabled ? snapToGrid(x, gridSize) : x, y: snapEnabled ? snapToGrid(y, gridSize) : y }
  }, [pan, scale, snapEnabled, gridSize])

  // Save to history
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(design)))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [design, history, historyIndex])

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setDesign(JSON.parse(JSON.stringify(history[historyIndex - 1])))
    }
  }, [history, historyIndex])

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setDesign(JSON.parse(JSON.stringify(history[historyIndex + 1])))
    }
  }, [history, historyIndex])

  // Update design
  const updateDesign = useCallback((updates: Partial<WindowDesign>) => {
    saveToHistory()
    setDesign(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }))
  }, [saveToHistory])

  // Add panel
  const addPanel = useCallback((x: number, y: number) => {
    const ft = design.frameThickness
    const newPanel: Panel = {
      id: generateId(),
      x: clamp(x, ft, design.frameWidth - ft - 200),
      y: clamp(y, ft, design.frameHeight - ft - 200),
      width: 400,
      height: 600,
      type: newPanelType,
      openDirection: newPanelType === 'CASEMENT' ? 'LEFT' : undefined,
      handleSide: newPanelType !== 'FIXED' ? 'RIGHT' : undefined,
      hasMesh: false,
      label: `P${design.panels.length + 1}`,
      zIndex: design.panels.length + 1,
    }
    updateDesign({ panels: [...design.panels, newPanel] })
    setSelectedId(newPanel.id)
    setSelectedType('panel')
    setTool('select')
  }, [design, newPanelType, updateDesign])

  // Add mullion
  const addMullion = useCallback((x: number) => {
    const ft = design.frameThickness
    const newMullion: Mullion = {
      id: generateId(),
      x: clamp(x, ft + 50, design.frameWidth - ft - 50),
      y1: ft,
      y2: design.frameHeight - ft,
      thickness: 60,
    }
    updateDesign({ mullions: [...design.mullions, newMullion] })
    setSelectedId(newMullion.id)
    setSelectedType('mullion')
    setTool('select')
  }, [design, updateDesign])

  // Add transom
  const addTransom = useCallback((y: number) => {
    const ft = design.frameThickness
    const newTransom: Transom = {
      id: generateId(),
      y: clamp(y, ft + 50, design.frameHeight - ft - 50),
      x1: ft,
      x2: design.frameWidth - ft,
      thickness: 60,
    }
    updateDesign({ transoms: [...design.transoms, newTransom] })
    setSelectedId(newTransom.id)
    setSelectedType('transom')
    setTool('select')
  }, [design, updateDesign])

  // Delete selected
  const deleteSelected = useCallback(() => {
    if (!selectedId || !selectedType) return
    saveToHistory()
    if (selectedType === 'panel') {
      setDesign(prev => ({ ...prev, panels: prev.panels.filter(p => p.id !== selectedId) }))
    } else if (selectedType === 'mullion') {
      setDesign(prev => ({ ...prev, mullions: prev.mullions.filter(m => m.id !== selectedId) }))
    } else if (selectedType === 'transom') {
      setDesign(prev => ({ ...prev, transoms: prev.transoms.filter(t => t.id !== selectedId) }))
    }
    setSelectedId(null)
    setSelectedType(null)
  }, [selectedId, selectedType, saveToHistory])

  // Duplicate selected panel
  const duplicateSelected = useCallback(() => {
    if (!selectedId || selectedType !== 'panel') return
    const panel = design.panels.find(p => p.id === selectedId)
    if (!panel) return
    
    const newPanel: Panel = {
      ...panel,
      id: generateId(),
      x: panel.x + 50,
      y: panel.y + 50,
      label: `${panel.label}_copy`,
      zIndex: design.panels.length + 1,
    }
    updateDesign({ panels: [...design.panels, newPanel] })
    setSelectedId(newPanel.id)
  }, [selectedId, selectedType, design.panels, updateDesign])

  // Update panel
  const updatePanel = useCallback((id: string, updates: Partial<Panel>) => {
    setDesign(prev => ({
      ...prev,
      panels: prev.panels.map(p => p.id === id ? { ...p, ...updates } : p),
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  // Update mullion
  const updateMullion = useCallback((id: string, updates: Partial<Mullion>) => {
    setDesign(prev => ({
      ...prev,
      mullions: prev.mullions.map(m => m.id === id ? { ...m, ...updates } : m),
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  // Update transom
  const updateTransom = useCallback((id: string, updates: Partial<Transom>) => {
    setDesign(prev => ({
      ...prev,
      transoms: prev.transoms.map(t => t.id === id ? { ...t, ...updates } : t),
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const point = screenToDesign(e.clientX, e.clientY)
    
    if (tool === 'pan') {
      setDragState({
        isDragging: true,
        type: null,
        id: null,
        startPoint: { x: e.clientX - pan.x, y: e.clientY - pan.y },
        startElement: null,
      })
      return
    }

    if (tool === 'panel') {
      addPanel(point.x, point.y)
      return
    }

    if (tool === 'mullion') {
      addMullion(point.x)
      return
    }

    if (tool === 'transom') {
      addTransom(point.y)
      return
    }
  }, [tool, screenToDesign, pan, addPanel, addMullion, addTransom])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.isDragging) return

    if (tool === 'pan' || dragState.type === null) {
      setPan({
        x: e.clientX - dragState.startPoint.x,
        y: e.clientY - dragState.startPoint.y,
      })
      return
    }

    const point = screenToDesign(e.clientX, e.clientY)
    const ft = design.frameThickness

    if (dragState.type === 'panel' && dragState.id) {
      const panel = dragState.startElement as Panel
      const newX = clamp(
        point.x - (panel.width / 2),
        ft,
        design.frameWidth - ft - panel.width
      )
      const newY = clamp(
        point.y - (panel.height / 2),
        ft,
        design.frameHeight - ft - panel.height
      )
      updatePanel(dragState.id, { 
        x: snapEnabled ? snapToGrid(newX, gridSize) : newX, 
        y: snapEnabled ? snapToGrid(newY, gridSize) : newY 
      })
    }

    if (dragState.type === 'mullion' && dragState.id) {
      const newX = clamp(point.x, ft + 50, design.frameWidth - ft - 50)
      updateMullion(dragState.id, { x: snapEnabled ? snapToGrid(newX, gridSize) : newX })
    }

    if (dragState.type === 'transom' && dragState.id) {
      const newY = clamp(point.y, ft + 50, design.frameHeight - ft - 50)
      updateTransom(dragState.id, { y: snapEnabled ? snapToGrid(newY, gridSize) : newY })
    }

    if (dragState.type === 'resize' && dragState.id && dragState.resizeHandle) {
      const panel = design.panels.find(p => p.id === dragState.id)
      if (!panel) return

      const handle = dragState.resizeHandle
      let newX = panel.x, newY = panel.y, newW = panel.width, newH = panel.height

      if (handle.includes('e')) {
        newW = Math.max(100, point.x - panel.x)
      }
      if (handle.includes('w')) {
        const diff = panel.x - point.x
        newX = point.x
        newW = panel.width + diff
      }
      if (handle.includes('s')) {
        newH = Math.max(100, point.y - panel.y)
      }
      if (handle.includes('n')) {
        const diff = panel.y - point.y
        newY = point.y
        newH = panel.height + diff
      }

      // Clamp to frame
      newX = clamp(newX, ft, design.frameWidth - ft - 100)
      newY = clamp(newY, ft, design.frameHeight - ft - 100)
      newW = Math.min(newW, design.frameWidth - ft - newX)
      newH = Math.min(newH, design.frameHeight - ft - newY)

      if (snapEnabled) {
        newX = snapToGrid(newX, gridSize)
        newY = snapToGrid(newY, gridSize)
        newW = snapToGrid(newW, gridSize)
        newH = snapToGrid(newH, gridSize)
      }

      updatePanel(dragState.id, { x: newX, y: newY, width: newW, height: newH })
    }
  }, [dragState, tool, screenToDesign, design, snapEnabled, gridSize, updatePanel, updateMullion, updateTransom])

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging) {
      saveToHistory()
    }
    setDragState({
      isDragging: false,
      type: null,
      id: null,
      startPoint: { x: 0, y: 0 },
      startElement: null,
    })
  }, [dragState.isDragging, saveToHistory])

  // Start dragging element
  const startDrag = (e: React.MouseEvent, type: 'panel' | 'mullion' | 'transom', id: string, element: any) => {
    e.stopPropagation()
    if (tool !== 'select') return
    
    setSelectedId(id)
    setSelectedType(type)
    setDragState({
      isDragging: true,
      type,
      id,
      startPoint: screenToDesign(e.clientX, e.clientY),
      startElement: { ...element },
    })
  }

  // Start resizing panel
  const startResize = (e: React.MouseEvent, panelId: string, handle: string) => {
    e.stopPropagation()
    const panel = design.panels.find(p => p.id === panelId)
    if (!panel) return

    setSelectedId(panelId)
    setSelectedType('panel')
    setDragState({
      isDragging: true,
      type: 'resize',
      id: panelId,
      startPoint: screenToDesign(e.clientX, e.clientY),
      startElement: { ...panel },
      resizeHandle: handle,
    })
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected()
      }
      if (e.key === 'Escape') {
        setSelectedId(null)
        setSelectedType(null)
        setTool('select')
      }
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        undo()
      }
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault()
        redo()
      }
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault()
        duplicateSelected()
      }
      if (e.key === 'v') setTool('select')
      if (e.key === 'p') setTool('panel')
      if (e.key === 'm') setTool('mullion')
      if (e.key === 't') setTool('transom')
      if (e.key === 'h') setTool('pan')
      if (e.key === 'g') setShowGrid(prev => !prev)
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleteSelected, undo, redo, duplicateSelected])

  // Zoom with mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => clamp(prev * delta, 0.1, 2))
  }, [])

  // Export SVG
  const exportSVG = () => {
    if (!svgRef.current) return
    const svg = svgRef.current.outerHTML
    onExport?.(svg)
    
    // Download
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${design.code}-${design.name}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Calculate materials
  const calculateMaterials = () => {
    const ft = design.frameThickness
    const w = design.frameWidth
    const h = design.frameHeight
    
    // Frame perimeter
    const frameLength = 2 * (w + h) - 8 * ft
    
    // Panels
    const panelData = design.panels.map(p => ({
      label: p.label,
      width: p.width,
      height: p.height,
      area: (p.width * p.height) / 1000000, // sqm
      perimeter: 2 * (p.width + p.height),
      glassWidth: p.width - 50,
      glassHeight: p.height - 50,
      glassArea: ((p.width - 50) * (p.height - 50)) / 1000000,
    }))
    
    // Mullions
    const mullionLength = design.mullions.reduce((sum, m) => sum + (m.y2 - m.y1), 0)
    
    // Transoms
    const transomLength = design.transoms.reduce((sum, t) => sum + (t.x2 - t.x1), 0)
    
    return {
      frame: { length: frameLength, pieces: 4 },
      panels: panelData,
      mullions: { count: design.mullions.length, totalLength: mullionLength },
      transoms: { count: design.transoms.length, totalLength: transomLength },
      totalGlassArea: panelData.reduce((sum, p) => sum + p.glassArea, 0),
    }
  }

  const materials = calculateMaterials()

  // Render
  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      
      {/* Left Toolbar */}
      <div className="w-14 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-4 gap-2">
        {/* Tools */}
        {[
          { key: 'select', icon: '↖', label: 'Select (V)', shortcut: 'V' },
          { key: 'panel', icon: '◻', label: 'Add Panel (P)', shortcut: 'P' },
          { key: 'mullion', icon: '│', label: 'Add Mullion (M)', shortcut: 'M' },
          { key: 'transom', icon: '─', label: 'Add Transom (T)', shortcut: 'T' },
          { key: 'pan', icon: '✋', label: 'Pan (H)', shortcut: 'H' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTool(t.key as any)}
            title={t.label}
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
              tool === t.key
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {t.icon}
          </button>
        ))}

        <div className="h-px w-8 bg-slate-700 my-2" />

        {/* View options */}
        <button
          onClick={() => setShowGrid(prev => !prev)}
          title="Toggle Grid (G)"
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm ${
            showGrid ? 'bg-cyan-600/50 text-cyan-300' : 'bg-slate-800 text-slate-500'
          }`}
        >
          #
        </button>
        <button
          onClick={() => setSnapEnabled(prev => !prev)}
          title="Toggle Snap"
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm ${
            snapEnabled ? 'bg-amber-600/50 text-amber-300' : 'bg-slate-800 text-slate-500'
          }`}
        >
          ⊞
        </button>
        <button
          onClick={() => setShowDimensions(prev => !prev)}
          title="Toggle Dimensions"
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm ${
            showDimensions ? 'bg-emerald-600/50 text-emerald-300' : 'bg-slate-800 text-slate-500'
          }`}
        >
          📏
        </button>

        <div className="flex-1" />

        {/* Zoom */}
        <div className="text-xs text-slate-500 mb-1">{Math.round(zoom * 100)}%</div>
        <button onClick={() => setZoom(prev => Math.min(prev * 1.2, 2))} className="w-8 h-8 rounded bg-slate-800 text-slate-400 hover:text-white">+</button>
        <button onClick={() => setZoom(prev => Math.max(prev * 0.8, 0.1))} className="w-8 h-8 rounded bg-slate-800 text-slate-400 hover:text-white">−</button>
        <button onClick={() => { setZoom(0.4); setPan({ x: 0, y: 0 }) }} className="w-8 h-8 rounded bg-slate-800 text-slate-400 hover:text-white text-xs">Fit</button>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Bar */}
        <div className="h-12 bg-slate-950 border-b border-slate-800 flex items-center px-4 gap-4">
          <div className="flex items-center gap-2">
            <input
              value={design.code}
              onChange={(e) => setDesign(prev => ({ ...prev, code: e.target.value }))}
              className="w-16 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-purple-400 font-mono text-sm"
              placeholder="Code"
            />
            <input
              value={design.name}
              onChange={(e) => setDesign(prev => ({ ...prev, name: e.target.value }))}
              className="w-40 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-sm"
              placeholder="Name"
            />
          </div>

          <div className="h-6 w-px bg-slate-700" />

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Frame:</span>
            <input
              type="number"
              value={design.frameWidth}
              onChange={(e) => updateDesign({ frameWidth: Number(e.target.value) })}
              className="w-16 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white font-mono"
            />
            <span className="text-slate-600">×</span>
            <input
              type="number"
              value={design.frameHeight}
              onChange={(e) => updateDesign({ frameHeight: Number(e.target.value) })}
              className="w-16 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white font-mono"
            />
            <span className="text-slate-500">mm</span>
          </div>

          <div className="h-6 w-px bg-slate-700" />

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Profile:</span>
            <input
              type="number"
              value={design.frameThickness}
              onChange={(e) => updateDesign({ frameThickness: Number(e.target.value) })}
              className="w-14 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white font-mono"
            />
            <span className="text-slate-500">mm</span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button onClick={undo} disabled={historyIndex <= 0} className="px-3 py-1.5 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 text-sm">↶ Undo</button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="px-3 py-1.5 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 text-sm">↷ Redo</button>
            <button onClick={exportSVG} className="px-3 py-1.5 rounded bg-cyan-600 text-white text-sm">📤 Export</button>
            <button onClick={() => onSave?.(design)} className="px-3 py-1.5 rounded bg-purple-600 text-white text-sm">💾 Save</button>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          ref={canvasRef}
          className="flex-1 overflow-hidden cursor-crosshair relative"
          style={{ background: 'repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%) 50% / 20px 20px' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* SVG Canvas */}
          <svg
            ref={svgRef}
            width={design.frameWidth * scale}
            height={design.frameHeight * scale}
            viewBox={`0 0 ${design.frameWidth} ${design.frameHeight}`}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px)`,
              position: 'absolute',
              left: '50%',
              top: '50%',
              marginLeft: -(design.frameWidth * scale) / 2,
              marginTop: -(design.frameHeight * scale) / 2,
            }}
          >
            {/* Grid */}
            {showGrid && (
              <g opacity={0.3}>
                <defs>
                  <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                    <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="#334155" strokeWidth="0.5" />
                  </pattern>
                  <pattern id="gridLarge" width={gridSize * 10} height={gridSize * 10} patternUnits="userSpaceOnUse">
                    <path d={`M ${gridSize * 10} 0 L 0 0 0 ${gridSize * 10}`} fill="none" stroke="#475569" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                <rect width="100%" height="100%" fill="url(#gridLarge)" />
              </g>
            )}

            {/* Frame */}
            <rect
              x={0}
              y={0}
              width={design.frameWidth}
              height={design.frameHeight}
              fill="#1e293b"
              stroke="#64748b"
              strokeWidth={2}
            />
            
            {/* Frame profile */}
            <rect
              x={design.frameThickness}
              y={design.frameThickness}
              width={design.frameWidth - 2 * design.frameThickness}
              height={design.frameHeight - 2 * design.frameThickness}
              fill="#0f172a"
              stroke="#475569"
              strokeWidth={1}
            />

            {/* Panels */}
            {design.panels.sort((a, b) => a.zIndex - b.zIndex).map(panel => (
              <g
                key={panel.id}
                onMouseDown={(e) => startDrag(e, 'panel', panel.id, panel)}
                style={{ cursor: tool === 'select' ? 'move' : 'default' }}
              >
                {/* Panel background */}
                <rect
                  x={panel.x}
                  y={panel.y}
                  width={panel.width}
                  height={panel.height}
                  fill={panel.type === 'FIXED' ? '#1e3a5f' : '#0ea5e9'}
                  fillOpacity={0.2}
                  stroke={selectedId === panel.id ? '#a855f7' : '#0ea5e9'}
                  strokeWidth={selectedId === panel.id ? 3 : 2}
                />
                
                {/* Glass effect */}
                <rect
                  x={panel.x + 25}
                  y={panel.y + 25}
                  width={panel.width - 50}
                  height={panel.height - 50}
                  fill="url(#glassGradient)"
                  stroke="#67e8f9"
                  strokeWidth={1}
                  opacity={0.6}
                />
                
                {/* Panel type indicator */}
                {panel.type === 'SLIDING' && panel.openDirection && (
                  <path
                    d={panel.openDirection === 'LEFT' 
                      ? `M ${panel.x + panel.width - 60} ${panel.y + panel.height / 2} l -40 -20 l 0 40 z`
                      : `M ${panel.x + 60} ${panel.y + panel.height / 2} l 40 -20 l 0 40 z`
                    }
                    fill="#0ea5e9"
                    opacity={0.5}
                  />
                )}

                {panel.type === 'CASEMENT' && (
                  <path
                    d={panel.openDirection === 'LEFT'
                      ? `M ${panel.x + 25} ${panel.y + 25} L ${panel.x + panel.width - 25} ${panel.y + panel.height / 2} L ${panel.x + 25} ${panel.y + panel.height - 25} Z`
                      : `M ${panel.x + panel.width - 25} ${panel.y + 25} L ${panel.x + 25} ${panel.y + panel.height / 2} L ${panel.x + panel.width - 25} ${panel.y + panel.height - 25} Z`
                    }
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5,5"
                  />
                )}

                {/* Handle */}
                {panel.handleSide && panel.type !== 'FIXED' && (
                  <rect
                    x={panel.handleSide === 'LEFT' ? panel.x + 30 : panel.x + panel.width - 45}
                    y={panel.y + panel.height / 2 - 30}
                    width={15}
                    height={60}
                    rx={3}
                    fill="#fbbf24"
                    stroke="#f59e0b"
                    strokeWidth={1}
                  />
                )}

                {/* Mesh indicator */}
                {panel.hasMesh && (
                  <g opacity={0.3}>
                    {Array.from({ length: Math.floor((panel.width - 50) / 20) }).map((_, i) => (
                      <line
                        key={`mv-${i}`}
                        x1={panel.x + 25 + i * 20}
                        y1={panel.y + 25}
                        x2={panel.x + 25 + i * 20}
                        y2={panel.y + panel.height - 25}
                        stroke="#22c55e"
                        strokeWidth={0.5}
                      />
                    ))}
                    {Array.from({ length: Math.floor((panel.height - 50) / 20) }).map((_, i) => (
                      <line
                        key={`mh-${i}`}
                        x1={panel.x + 25}
                        y1={panel.y + 25 + i * 20}
                        x2={panel.x + panel.width - 25}
                        y2={panel.y + 25 + i * 20}
                        stroke="#22c55e"
                        strokeWidth={0.5}
                      />
                    ))}
                  </g>
                )}

                {/* Label */}
                {showLabels && (
                  <text
                    x={panel.x + panel.width / 2}
                    y={panel.y + panel.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#fff"
                    fontSize={Math.min(panel.width, panel.height) / 4}
                    fontWeight="bold"
                    opacity={0.8}
                  >
                    {panel.label}
                  </text>
                )}

                {/* Resize handles (when selected) */}
                {selectedId === panel.id && tool === 'select' && (
                  <>
                    {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(handle => {
                      const positions: Record<string, { x: number, y: number }> = {
                        nw: { x: panel.x, y: panel.y },
                        n: { x: panel.x + panel.width / 2, y: panel.y },
                        ne: { x: panel.x + panel.width, y: panel.y },
                        e: { x: panel.x + panel.width, y: panel.y + panel.height / 2 },
                        se: { x: panel.x + panel.width, y: panel.y + panel.height },
                        s: { x: panel.x + panel.width / 2, y: panel.y + panel.height },
                        sw: { x: panel.x, y: panel.y + panel.height },
                        w: { x: panel.x, y: panel.y + panel.height / 2 },
                      }
                      const pos = positions[handle]
                      return (
                        <rect
                          key={handle}
                          x={pos.x - 6}
                          y={pos.y - 6}
                          width={12}
                          height={12}
                          fill="#a855f7"
                          stroke="#fff"
                          strokeWidth={1}
                          style={{ cursor: `${handle}-resize` }}
                          onMouseDown={(e) => startResize(e, panel.id, handle)}
                        />
                      )
                    })}
                  </>
                )}
              </g>
            ))}

            {/* Mullions */}
            {design.mullions.map(mullion => (
              <g
                key={mullion.id}
                onMouseDown={(e) => startDrag(e, 'mullion', mullion.id, mullion)}
                style={{ cursor: tool === 'select' ? 'ew-resize' : 'default' }}
              >
                <rect
                  x={mullion.x - mullion.thickness / 2}
                  y={mullion.y1}
                  width={mullion.thickness}
                  height={mullion.y2 - mullion.y1}
                  fill="#334155"
                  stroke={selectedId === mullion.id ? '#a855f7' : '#64748b'}
                  strokeWidth={selectedId === mullion.id ? 2 : 1}
                />
              </g>
            ))}

            {/* Transoms */}
            {design.transoms.map(transom => (
              <g
                key={transom.id}
                onMouseDown={(e) => startDrag(e, 'transom', transom.id, transom)}
                style={{ cursor: tool === 'select' ? 'ns-resize' : 'default' }}
              >
                <rect
                  x={transom.x1}
                  y={transom.y - transom.thickness / 2}
                  width={transom.x2 - transom.x1}
                  height={transom.thickness}
                  fill="#334155"
                  stroke={selectedId === transom.id ? '#a855f7' : '#64748b'}
                  strokeWidth={selectedId === transom.id ? 2 : 1}
                />
              </g>
            ))}

            {/* Dimensions */}
            {showDimensions && (
              <g fill="#94a3b8" fontSize={14} fontFamily="monospace">
                {/* Frame width */}
                <line x1={0} y1={-20} x2={design.frameWidth} y2={-20} stroke="#94a3b8" strokeWidth={1} markerEnd="url(#arrow)" markerStart="url(#arrow)" />
                <text x={design.frameWidth / 2} y={-30} textAnchor="middle">{design.frameWidth} mm</text>
                
                {/* Frame height */}
                <line x1={-20} y1={0} x2={-20} y2={design.frameHeight} stroke="#94a3b8" strokeWidth={1} />
                <text x={-30} y={design.frameHeight / 2} textAnchor="middle" transform={`rotate(-90, -30, ${design.frameHeight / 2})`}>{design.frameHeight} mm</text>

                {/* Panel dimensions when selected */}
                {selectedId && selectedType === 'panel' && (() => {
                  const panel = design.panels.find(p => p.id === selectedId)
                  if (!panel) return null
                  return (
                    <>
                      <text x={panel.x + panel.width / 2} y={panel.y - 10} textAnchor="middle" fill="#a855f7">{panel.width}</text>
                      <text x={panel.x - 10} y={panel.y + panel.height / 2} textAnchor="end" fill="#a855f7">{panel.height}</text>
                    </>
                  )
                })()}
              </g>
            )}

            {/* Defs */}
            <defs>
              <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.3} />
                <stop offset="50%" stopColor="#0ea5e9" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#67e8f9" stopOpacity={0.3} />
              </linearGradient>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
              </marker>
            </defs>
          </svg>

          {/* Mouse position indicator */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded bg-slate-800/90 text-xs font-mono text-slate-400">
            Tool: {tool.toUpperCase()} | Zoom: {Math.round(zoom * 100)}% | Grid: {showGrid ? gridSize + 'mm' : 'OFF'}
          </div>
        </div>
      </div>

      {/* Right Panel - Properties */}
      <div className="w-72 bg-slate-950 border-l border-slate-800 flex flex-col overflow-hidden">
        
        {/* Panel Type Selector (when adding panels) */}
        {tool === 'panel' && (
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">New Panel Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {(['FIXED', 'SLIDING', 'CASEMENT', 'TILT_TURN', 'TOP_HUNG', 'AWNING'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setNewPanelType(type)}
                  className={`px-3 py-2 rounded text-xs font-medium transition-all ${
                    newPanelType === type
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Element Properties */}
        {selectedId && selectedType && (
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase">
                {selectedType === 'panel' ? 'Panel' : selectedType === 'mullion' ? 'Mullion' : 'Transom'} Properties
              </h3>
              <button onClick={deleteSelected} className="text-red-400 hover:text-red-300 text-xs">🗑️ Delete</button>
            </div>

            {selectedType === 'panel' && (() => {
              const panel = design.panels.find(p => p.id === selectedId)
              if (!panel) return null
              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">X (mm)</label>
                      <input
                        type="number"
                        value={panel.x}
                        onChange={(e) => updatePanel(panel.id, { x: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Y (mm)</label>
                      <input
                        type="number"
                        value={panel.y}
                        onChange={(e) => updatePanel(panel.id, { y: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Width</label>
                      <input
                        type="number"
                        value={panel.width}
                        onChange={(e) => updatePanel(panel.id, { width: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Height</label>
                      <input
                        type="number"
                        value={panel.height}
                        onChange={(e) => updatePanel(panel.id, { height: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Label</label>
                    <input
                      value={panel.label}
                      onChange={(e) => updatePanel(panel.id, { label: e.target.value })}
                      className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Type</label>
                    <select
                      value={panel.type}
                      onChange={(e) => updatePanel(panel.id, { type: e.target.value as Panel['type'] })}
                      className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm"
                    >
                      <option value="FIXED">Fixed</option>
                      <option value="SLIDING">Sliding</option>
                      <option value="CASEMENT">Casement</option>
                      <option value="TILT_TURN">Tilt & Turn</option>
                      <option value="TOP_HUNG">Top Hung</option>
                      <option value="AWNING">Awning</option>
                    </select>
                  </div>

                  {panel.type !== 'FIXED' && (
                    <>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Open Direction</label>
                        <select
                          value={panel.openDirection || 'LEFT'}
                          onChange={(e) => updatePanel(panel.id, { openDirection: e.target.value as any })}
                          className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm"
                        >
                          <option value="LEFT">Left</option>
                          <option value="RIGHT">Right</option>
                          <option value="INWARD">Inward</option>
                          <option value="OUTWARD">Outward</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Handle Side</label>
                        <select
                          value={panel.handleSide || 'RIGHT'}
                          onChange={(e) => updatePanel(panel.id, { handleSide: e.target.value as any })}
                          className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm"
                        >
                          <option value="LEFT">Left</option>
                          <option value="RIGHT">Right</option>
                        </select>
                      </div>
                    </>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={panel.hasMesh}
                      onChange={(e) => updatePanel(panel.id, { hasMesh: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-slate-300">Has Mesh</span>
                  </label>

                  <button
                    onClick={duplicateSelected}
                    className="w-full px-3 py-2 rounded bg-slate-800 text-slate-300 text-sm hover:bg-slate-700"
                  >
                    📋 Duplicate (Ctrl+D)
                  </button>
                </div>
              )
            })()}

            {selectedType === 'mullion' && (() => {
              const mullion = design.mullions.find(m => m.id === selectedId)
              if (!mullion) return null
              return (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">X Position (mm)</label>
                    <input
                      type="number"
                      value={mullion.x}
                      onChange={(e) => updateMullion(mullion.id, { x: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Start Y</label>
                      <input
                        type="number"
                        value={mullion.y1}
                        onChange={(e) => updateMullion(mullion.id, { y1: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">End Y</label>
                      <input
                        type="number"
                        value={mullion.y2}
                        onChange={(e) => updateMullion(mullion.id, { y2: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Thickness</label>
                    <input
                      type="number"
                      value={mullion.thickness}
                      onChange={(e) => updateMullion(mullion.id, { thickness: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm font-mono"
                    />
                  </div>
                </div>
              )
            })()}

            {selectedType === 'transom' && (() => {
              const transom = design.transoms.find(t => t.id === selectedId)
              if (!transom) return null
              return (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Y Position (mm)</label>
                    <input
                      type="number"
                      value={transom.y}
                      onChange={(e) => updateTransom(transom.id, { y: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Start X</label>
                      <input
                        type="number"
                        value={transom.x1}
                        onChange={(e) => updateTransom(transom.id, { x1: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">End X</label>
                      <input
                        type="number"
                        value={transom.x2}
                        onChange={(e) => updateTransom(transom.id, { x2: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Thickness</label>
                    <input
                      type="number"
                      value={transom.thickness}
                      onChange={(e) => updateTransom(transom.id, { thickness: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm font-mono"
                    />
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Layers / Elements List */}
        <div className="flex-1 overflow-y-auto p-4 border-b border-slate-800">
          <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">Elements</h3>
          
          <div className="space-y-1">
            <div className="text-xs text-slate-500 mb-2">Panels ({design.panels.length})</div>
            {design.panels.map(panel => (
              <div
                key={panel.id}
                onClick={() => { setSelectedId(panel.id); setSelectedType('panel') }}
                className={`px-3 py-2 rounded cursor-pointer flex items-center justify-between ${
                  selectedId === panel.id ? 'bg-purple-600/30 border border-purple-500' : 'bg-slate-800/50 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">◻</span>
                  <span className="text-sm text-white">{panel.label}</span>
                  <span className="text-xs text-slate-500">{panel.type}</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">{panel.width}×{panel.height}</span>
              </div>
            ))}

            {design.mullions.length > 0 && (
              <>
                <div className="text-xs text-slate-500 mt-3 mb-2">Mullions ({design.mullions.length})</div>
                {design.mullions.map((m, i) => (
                  <div
                    key={m.id}
                    onClick={() => { setSelectedId(m.id); setSelectedType('mullion') }}
                    className={`px-3 py-2 rounded cursor-pointer flex items-center justify-between ${
                      selectedId === m.id ? 'bg-purple-600/30 border border-purple-500' : 'bg-slate-800/50 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400">│</span>
                      <span className="text-sm text-white">Mullion {i + 1}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">x={m.x}</span>
                  </div>
                ))}
              </>
            )}

            {design.transoms.length > 0 && (
              <>
                <div className="text-xs text-slate-500 mt-3 mb-2">Transoms ({design.transoms.length})</div>
                {design.transoms.map((t, i) => (
                  <div
                    key={t.id}
                    onClick={() => { setSelectedId(t.id); setSelectedType('transom') }}
                    className={`px-3 py-2 rounded cursor-pointer flex items-center justify-between ${
                      selectedId === t.id ? 'bg-purple-600/30 border border-purple-500' : 'bg-slate-800/50 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">─</span>
                      <span className="text-sm text-white">Transom {i + 1}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">y={t.y}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Materials Summary */}
        <div className="p-4 bg-slate-900/50">
          <button
            onClick={() => setShowMaterials(!showMaterials)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 uppercase mb-3"
          >
            <span>📊 Materials</span>
            <span>{showMaterials ? '▲' : '▼'}</span>
          </button>
          
          {showMaterials && (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Frame Length</span>
                <span className="text-white font-mono">{materials.frame.length.toFixed(0)} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Panels</span>
                <span className="text-white font-mono">{design.panels.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Glass Area</span>
                <span className="text-cyan-400 font-mono">{materials.totalGlassArea.toFixed(3)} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mullion Length</span>
                <span className="text-white font-mono">{materials.mullions.totalLength} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transom Length</span>
                <span className="text-white font-mono">{materials.transoms.totalLength} mm</span>
              </div>
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-600">
          <div className="grid grid-cols-2 gap-1">
            <span>V - Select</span>
            <span>P - Panel</span>
            <span>M - Mullion</span>
            <span>T - Transom</span>
            <span>H - Pan</span>
            <span>G - Grid</span>
            <span>Del - Delete</span>
            <span>Ctrl+Z - Undo</span>
          </div>
        </div>
      </div>
    </div>
  )
}
