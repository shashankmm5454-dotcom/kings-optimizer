'use client';

// ===============================================
// VISUAL CREATOR COMPONENT - SPRINT 2
// ===============================================

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  WindowTypeDefinition,
  PanelDefinition,
  MullionDefinition,
  TransomDefinition,
  DrawingOptions,
  PanelType,
  OpenDirection,
  HandlePosition,
  WindowCategory
} from '@/types/drawing';
import { WindowDrawingEngine, defaultDrawingOptions } from '@/lib/drawing/svg-engine';
import { windowTemplates, getTemplateByCode } from '@/lib/drawing/templates';
import { calculateMaterials, getMaterialSummary } from '@/lib/calculator/material-calculator';

// ===============================================
// ICONS (using simple SVG)
// ===============================================
const Icons = {
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Save: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  ),
  Grid: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
};

// ===============================================
// COMPONENT PROPS
// ===============================================
interface VisualCreatorProps {
  initialTemplate?: string;  // Template code to start with
  onSave?: (windowDef: WindowTypeDefinition) => void;
  onCancel?: () => void;
}

// ===============================================
// MAIN VISUAL CREATOR COMPONENT
// ===============================================
export function VisualCreator({ initialTemplate, onSave, onCancel }: VisualCreatorProps) {
  // ===============================================
  // STATE
  // ===============================================
  const [windowDef, setWindowDef] = useState<WindowTypeDefinition>(() => {
    if (initialTemplate) {
      const template = getTemplateByCode(initialTemplate);
      if (template) return { ...template, id: `custom_${Date.now()}` };
    }
    return { ...windowTemplates[0], id: `custom_${Date.now()}` };
  });
  
  const [dimensions, setDimensions] = useState({ width: 1500, height: 1200 });
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [selectedMullionId, setSelectedMullionId] = useState<string | null>(null);
  const [selectedTransomId, setSelectedTransomId] = useState<string | null>(null);
  const [drawingOptions, setDrawingOptions] = useState<DrawingOptions>(defaultDrawingOptions);
  const [showMaterialCalc, setShowMaterialCalc] = useState(false);
  const [activeTab, setActiveTab] = useState<'panels' | 'structure' | 'settings'>('panels');
  
  // ===============================================
  // GENERATE SVG
  // ===============================================
  const svgContent = useMemo(() => {
    const engine = new WindowDrawingEngine(
      dimensions.width,
      dimensions.height,
      windowDef.drawing.frameThickness,
      drawingOptions
    );
    return engine.render(windowDef);
  }, [windowDef, dimensions, drawingOptions]);
  
  // ===============================================
  // CALCULATE MATERIALS
  // ===============================================
  const materialSummary = useMemo(() => {
    return getMaterialSummary(windowDef, dimensions.width, dimensions.height);
  }, [windowDef, dimensions]);
  
  const materialDetails = useMemo(() => {
    return calculateMaterials(windowDef, dimensions.width, dimensions.height);
  }, [windowDef, dimensions]);
  
  // ===============================================
  // PANEL OPERATIONS
  // ===============================================
  const addPanel = useCallback(() => {
    const newPanel: PanelDefinition = {
      id: `panel_${Date.now()}`,
      type: 'FIXED',
      position: { x: 0, y: 0, width: 100, height: 100 },
      hasHandle: false,
      hasMesh: false
    };
    
    // If there are existing panels, split the last one
    if (windowDef.drawing.panels.length > 0) {
      const panels = [...windowDef.drawing.panels];
      const lastPanel = panels[panels.length - 1];
      
      // Split horizontally
      lastPanel.position.width = lastPanel.position.width / 2;
      newPanel.position = {
        x: lastPanel.position.x + lastPanel.position.width,
        y: lastPanel.position.y,
        width: lastPanel.position.width,
        height: lastPanel.position.height
      };
      
      setWindowDef({
        ...windowDef,
        drawing: { ...windowDef.drawing, panels: [...panels, newPanel] }
      });
    } else {
      setWindowDef({
        ...windowDef,
        drawing: { ...windowDef.drawing, panels: [newPanel] }
      });
    }
  }, [windowDef]);
  
  const updatePanel = useCallback((panelId: string, updates: Partial<PanelDefinition>) => {
    const panels = windowDef.drawing.panels.map(p =>
      p.id === panelId ? { ...p, ...updates } : p
    );
    setWindowDef({
      ...windowDef,
      drawing: { ...windowDef.drawing, panels }
    });
  }, [windowDef]);
  
  const deletePanel = useCallback((panelId: string) => {
    const panels = windowDef.drawing.panels.filter(p => p.id !== panelId);
    if (panels.length > 0) {
      // Recalculate positions
      const totalWidth = panels.reduce((sum, p) => sum + p.position.width, 0);
      let currentX = 0;
      panels.forEach(p => {
        p.position.x = (currentX / totalWidth) * 100;
        p.position.width = (p.position.width / totalWidth) * 100;
        currentX += p.position.width * totalWidth / 100;
      });
    }
    setWindowDef({
      ...windowDef,
      drawing: { ...windowDef.drawing, panels }
    });
    setSelectedPanelId(null);
  }, [windowDef]);
  
  // ===============================================
  // MULLION OPERATIONS
  // ===============================================
  const addMullion = useCallback(() => {
    const newMullion: MullionDefinition = {
      id: `mullion_${Date.now()}`,
      position: 50,
      startY: 0,
      endY: 100,
      thickness: 40
    };
    setWindowDef({
      ...windowDef,
      drawing: {
        ...windowDef.drawing,
        mullions: [...windowDef.drawing.mullions, newMullion]
      }
    });
  }, [windowDef]);
  
  const updateMullion = useCallback((mullionId: string, updates: Partial<MullionDefinition>) => {
    const mullions = windowDef.drawing.mullions.map(m =>
      m.id === mullionId ? { ...m, ...updates } : m
    );
    setWindowDef({
      ...windowDef,
      drawing: { ...windowDef.drawing, mullions }
    });
  }, [windowDef]);
  
  const deleteMullion = useCallback((mullionId: string) => {
    const mullions = windowDef.drawing.mullions.filter(m => m.id !== mullionId);
    setWindowDef({
      ...windowDef,
      drawing: { ...windowDef.drawing, mullions }
    });
    setSelectedMullionId(null);
  }, [windowDef]);
  
  // ===============================================
  // TRANSOM OPERATIONS
  // ===============================================
  const addTransom = useCallback(() => {
    const newTransom: TransomDefinition = {
      id: `transom_${Date.now()}`,
      position: 50,
      startX: 0,
      endX: 100,
      thickness: 40
    };
    setWindowDef({
      ...windowDef,
      drawing: {
        ...windowDef.drawing,
        transoms: [...windowDef.drawing.transoms, newTransom]
      }
    });
  }, [windowDef]);
  
  const deleteTransom = useCallback((transomId: string) => {
    const transoms = windowDef.drawing.transoms.filter(t => t.id !== transomId);
    setWindowDef({
      ...windowDef,
      drawing: { ...windowDef.drawing, transoms }
    });
    setSelectedTransomId(null);
  }, [windowDef]);
  
  // ===============================================
  // LOAD TEMPLATE
  // ===============================================
  const loadTemplate = useCallback((code: string) => {
    const template = getTemplateByCode(code);
    if (template) {
      setWindowDef({ ...template, id: `custom_${Date.now()}` });
      setDimensions({
        width: template.drawing.defaultWidth,
        height: template.drawing.defaultHeight
      });
    }
  }, []);
  
  // ===============================================
  // EXPORT SVG
  // ===============================================
  const exportSVG = useCallback(() => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${windowDef.code || 'window'}_${dimensions.width}x${dimensions.height}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [svgContent, windowDef.code, dimensions]);
  
  // ===============================================
  // RENDER
  // ===============================================
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Visual Creator</h2>
          <select
            value={windowDef.code}
            onChange={(e) => loadTemplate(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm bg-white"
          >
            {windowTemplates.map(t => (
              <option key={t.code} value={t.code}>{t.name} ({t.code})</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMaterialCalc(!showMaterialCalc)}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition ${
              showMaterialCalc ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Icons.Settings />
            Materials
          </button>
          <button
            onClick={exportSVG}
            className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 bg-gray-100 hover:bg-gray-200"
          >
            <Icons.Download />
            Export SVG
          </button>
          {onSave && (
            <button
              onClick={() => onSave(windowDef)}
              className="px-4 py-1.5 rounded-lg text-sm flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              <Icons.Save />
              Save
            </button>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Controls */}
        <div className="w-80 bg-white border-r flex flex-col">
          {/* Dimensions */}
          <div className="p-4 border-b">
            <h3 className="font-medium text-sm text-gray-700 mb-3">Window Dimensions</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Width (mm)</label>
                <input
                  type="number"
                  value={dimensions.width}
                  onChange={(e) => setDimensions({ ...dimensions, width: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Height (mm)</label>
                <input
                  type="number"
                  value={dimensions.height}
                  onChange={(e) => setDimensions({ ...dimensions, height: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Type Info */}
          <div className="p-4 border-b">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Code</label>
                <input
                  type="text"
                  value={windowDef.code}
                  onChange={(e) => setWindowDef({ ...windowDef, code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Category</label>
                <select
                  value={windowDef.category}
                  onChange={(e) => setWindowDef({ ...windowDef, category: e.target.value as WindowCategory })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="SLIDING">Sliding</option>
                  <option value="CASEMENT">Casement</option>
                  <option value="FIXED">Fixed</option>
                  <option value="VENTILATOR">Ventilator</option>
                  <option value="DOOR">Door</option>
                  <option value="COMBINATION">Combination</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs text-gray-500">Name</label>
              <input
                type="text"
                value={windowDef.name}
                onChange={(e) => setWindowDef({ ...windowDef, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b">
            {(['panels', 'structure', 'settings'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-4">
            {/* Panels Tab */}
            {activeTab === 'panels' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm text-gray-700">Panels ({windowDef.drawing.panels.length})</h4>
                  <button
                    onClick={addPanel}
                    className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                  >
                    <Icons.Plus />
                  </button>
                </div>
                
                {windowDef.drawing.panels.map((panel, idx) => (
                  <div
                    key={panel.id}
                    onClick={() => setSelectedPanelId(panel.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      selectedPanelId === panel.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">Panel {idx + 1}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); deletePanel(panel.id); }}
                        className="p-1 rounded text-red-500 hover:bg-red-50"
                        disabled={windowDef.drawing.panels.length <= 1}
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                    
                    {selectedPanelId === panel.id && (
                      <div className="space-y-2 mt-3">
                        <div>
                          <label className="text-xs text-gray-500">Type</label>
                          <select
                            value={panel.type}
                            onChange={(e) => updatePanel(panel.id, { type: e.target.value as PanelType })}
                            className="w-full px-2 py-1.5 border rounded text-sm"
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
                              <label className="text-xs text-gray-500">Open Direction</label>
                              <select
                                value={panel.openDirection || 'LEFT'}
                                onChange={(e) => updatePanel(panel.id, { openDirection: e.target.value as OpenDirection })}
                                className="w-full px-2 py-1.5 border rounded text-sm"
                              >
                                <option value="LEFT">Left</option>
                                <option value="RIGHT">Right</option>
                                <option value="INWARD">Inward</option>
                                <option value="OUTWARD">Outward</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="text-xs text-gray-500">Handle Position</label>
                              <select
                                value={panel.handlePosition || 'LEFT'}
                                onChange={(e) => updatePanel(panel.id, { handlePosition: e.target.value as HandlePosition })}
                                className="w-full px-2 py-1.5 border rounded text-sm"
                              >
                                <option value="LEFT">Left</option>
                                <option value="RIGHT">Right</option>
                                <option value="CENTER">Center</option>
                              </select>
                            </div>
                            
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={panel.hasHandle}
                                onChange={(e) => updatePanel(panel.id, { hasHandle: e.target.checked })}
                              />
                              Show Handle
                            </label>
                          </>
                        )}
                        
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={panel.hasMesh}
                            onChange={(e) => updatePanel(panel.id, { hasMesh: e.target.checked })}
                          />
                          Has Mesh
                        </label>
                        
                        <div>
                          <label className="text-xs text-gray-500">Label</label>
                          <input
                            type="text"
                            value={panel.label || ''}
                            onChange={(e) => updatePanel(panel.id, { label: e.target.value })}
                            className="w-full px-2 py-1.5 border rounded text-sm"
                            placeholder="e.g., L, R, F"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Structure Tab */}
            {activeTab === 'structure' && (
              <div className="space-y-4">
                {/* Mullions */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm text-gray-700">Mullions (Vertical)</h4>
                    <button
                      onClick={addMullion}
                      className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                      <Icons.Plus />
                    </button>
                  </div>
                  
                  {windowDef.drawing.mullions.length === 0 ? (
                    <p className="text-xs text-gray-400">No mullions added</p>
                  ) : (
                    windowDef.drawing.mullions.map((mullion, idx) => (
                      <div key={mullion.id} className="p-3 rounded-lg border mb-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Mullion {idx + 1}</span>
                          <button
                            onClick={() => deleteMullion(mullion.id)}
                            className="p-1 rounded text-red-500 hover:bg-red-50"
                          >
                            <Icons.Trash />
                          </button>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Position (%)</label>
                          <input
                            type="range"
                            min="10"
                            max="90"
                            value={mullion.position}
                            onChange={(e) => updateMullion(mullion.id, { position: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-500">{mullion.position}%</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Transoms */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm text-gray-700">Transoms (Horizontal)</h4>
                    <button
                      onClick={addTransom}
                      className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                      <Icons.Plus />
                    </button>
                  </div>
                  
                  {windowDef.drawing.transoms.length === 0 ? (
                    <p className="text-xs text-gray-400">No transoms added</p>
                  ) : (
                    windowDef.drawing.transoms.map((transom, idx) => (
                      <div key={transom.id} className="p-3 rounded-lg border mb-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Transom {idx + 1}</span>
                          <button
                            onClick={() => deleteTransom(transom.id)}
                            className="p-1 rounded text-red-500 hover:bg-red-50"
                          >
                            <Icons.Trash />
                          </button>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Position (%)</label>
                          <input
                            type="range"
                            min="10"
                            max="90"
                            value={transom.position}
                            onChange={(e) => {
                              const transoms = windowDef.drawing.transoms.map(t =>
                                t.id === transom.id ? { ...t, position: parseInt(e.target.value) } : t
                              );
                              setWindowDef({
                                ...windowDef,
                                drawing: { ...windowDef.drawing, transoms }
                              });
                            }}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-500">{transom.position}%</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Frame Thickness */}
                <div>
                  <label className="text-xs text-gray-500">Frame Thickness (mm)</label>
                  <input
                    type="number"
                    value={windowDef.drawing.frameThickness}
                    onChange={(e) => setWindowDef({
                      ...windowDef,
                      drawing: { ...windowDef.drawing, frameThickness: parseInt(e.target.value) || 60 }
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
            
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-700 mb-3">Display Options</h4>
                
                {[
                  { key: 'showDimensions', label: 'Show Dimensions' },
                  { key: 'showLabels', label: 'Show Labels' },
                  { key: 'showHandles', label: 'Show Handles' },
                  { key: 'showArrows', label: 'Show Arrows' },
                  { key: 'showMeshIndicator', label: 'Show Mesh' },
                  { key: 'showGlass', label: 'Show Glass' },
                  { key: 'showFrame', label: 'Show Frame' }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={drawingOptions[key as keyof DrawingOptions] as boolean}
                      onChange={(e) => setDrawingOptions({
                        ...drawingOptions,
                        [key]: e.target.checked
                      })}
                    />
                    {label}
                  </label>
                ))}
                
                <h4 className="font-medium text-sm text-gray-700 mt-4 mb-3">Constraints</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Min Width</label>
                    <input
                      type="number"
                      value={windowDef.constraints.minWidth}
                      onChange={(e) => setWindowDef({
                        ...windowDef,
                        constraints: { ...windowDef.constraints, minWidth: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Max Width</label>
                    <input
                      type="number"
                      value={windowDef.constraints.maxWidth}
                      onChange={(e) => setWindowDef({
                        ...windowDef,
                        constraints: { ...windowDef.constraints, maxWidth: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Min Height</label>
                    <input
                      type="number"
                      value={windowDef.constraints.minHeight}
                      onChange={(e) => setWindowDef({
                        ...windowDef,
                        constraints: { ...windowDef.constraints, minHeight: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Max Height</label>
                    <input
                      type="number"
                      value={windowDef.constraints.maxHeight}
                      onChange={(e) => setWindowDef({
                        ...windowDef,
                        constraints: { ...windowDef.constraints, maxHeight: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Center - Drawing Canvas */}
        <div className="flex-1 flex flex-col bg-gray-100">
          {/* Canvas Area */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <div
              className="bg-white rounded-lg shadow-lg p-4"
              style={{ maxWidth: '90%', maxHeight: '90%' }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: svgContent }}
                className="w-full h-full"
                style={{ minWidth: '400px', minHeight: '300px' }}
              />
            </div>
          </div>
          
          {/* Quick Info Bar */}
          <div className="bg-white border-t px-4 py-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-gray-600">
              <span><strong>{windowDef.code}</strong> - {windowDef.name}</span>
              <span className="text-gray-400">|</span>
              <span>{dimensions.width} × {dimensions.height} mm</span>
              <span className="text-gray-400">|</span>
              <span>{windowDef.drawing.panels.length} panels</span>
            </div>
            <div className="flex items-center gap-4 text-gray-500">
              <span>Area: {((dimensions.width * dimensions.height) / 1000000 * 10.764).toFixed(2)} sqft</span>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Materials (conditional) */}
        {showMaterialCalc && (
          <div className="w-72 bg-white border-l overflow-auto">
            <div className="p-4 border-b">
              <h3 className="font-medium text-gray-800">Material Calculation</h3>
              <p className="text-xs text-gray-500 mt-1">Based on current dimensions</p>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Summary */}
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="font-medium text-sm text-blue-800 mb-2">Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profile Length:</span>
                    <span className="font-medium">{(materialSummary.totalProfileLength / 1000).toFixed(2)} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Glass Area:</span>
                    <span className="font-medium">{materialSummary.totalGlassArea.toFixed(3)} sqm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Steel Weight:</span>
                    <span className="font-medium">{materialSummary.totalSteelWeight.toFixed(2)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hardware Items:</span>
                    <span className="font-medium">{materialSummary.hardwareCount} pcs</span>
                  </div>
                </div>
              </div>
              
              {/* Profiles */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Profiles</h4>
                {materialDetails.profiles.map((p, i) => (
                  <div key={i} className="text-xs py-1 flex justify-between border-b border-gray-100">
                    <span className="text-gray-600">{p.family}</span>
                    <span>{p.length} mm × {p.quantity}</span>
                  </div>
                ))}
              </div>
              
              {/* Glass */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Glass</h4>
                {materialDetails.glass.map((g, i) => (
                  <div key={i} className="text-xs py-1 flex justify-between border-b border-gray-100">
                    <span className="text-gray-600">{g.description}</span>
                    <span>{g.width} × {g.height}</span>
                  </div>
                ))}
              </div>
              
              {/* Hardware */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Hardware</h4>
                {materialDetails.hardware.map((h, i) => (
                  <div key={i} className="text-xs py-1 flex justify-between border-b border-gray-100">
                    <span className="text-gray-600">{h.name}</span>
                    <span>{h.quantity} {h.unit}</span>
                  </div>
                ))}
              </div>
              
              {/* Steel */}
              {materialDetails.steel.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Steel</h4>
                  {materialDetails.steel.map((s, i) => (
                    <div key={i} className="text-xs py-1 flex justify-between border-b border-gray-100">
                      <span className="text-gray-600">{s.section} - {s.description}</span>
                      <span>{s.length} mm ({s.weight} kg)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VisualCreator;
