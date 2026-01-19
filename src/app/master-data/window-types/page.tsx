'use client';

// ===============================================
// WINDOW TYPES PAGE - SPRINT 2
// Master Data > Window Types
// ===============================================

import React, { useState, useMemo } from 'react';
import { WindowTypeDefinition, WindowCategory } from '@/types/drawing';
import { windowTemplates, getTemplatesByCategory } from '@/lib/drawing/templates';
import { WindowDrawingEngine, defaultDrawingOptions } from '@/lib/drawing/svg-engine';
import VisualCreator from '@/components/drawing/VisualCreator';

// ===============================================
// ICONS
// ===============================================
const Icons = {
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Copy: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  Grid: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  List: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  )
};

// Category colors
const categoryColors: Record<WindowCategory, string> = {
  SLIDING: 'bg-blue-100 text-blue-700',
  CASEMENT: 'bg-green-100 text-green-700',
  FIXED: 'bg-gray-100 text-gray-700',
  VENTILATOR: 'bg-purple-100 text-purple-700',
  DOOR: 'bg-amber-100 text-amber-700',
  COMBINATION: 'bg-pink-100 text-pink-700'
};

// ===============================================
// WINDOW TYPE CARD COMPONENT
// ===============================================
interface WindowTypeCardProps {
  windowType: WindowTypeDefinition;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function WindowTypeCard({ windowType, onEdit, onDuplicate, onDelete }: WindowTypeCardProps) {
  // Generate thumbnail SVG
  const thumbnailSvg = useMemo(() => {
    const engine = new WindowDrawingEngine(
      windowType.drawing.defaultWidth,
      windowType.drawing.defaultHeight,
      windowType.drawing.frameThickness,
      { ...defaultDrawingOptions, showDimensions: false, showLabels: false }
    );
    return engine.renderThumbnail(windowType, 120);
  }, [windowType]);
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Thumbnail */}
      <div className="bg-gray-50 p-4 flex items-center justify-center h-40 relative">
        <div
          dangerouslySetInnerHTML={{ __html: thumbnailSvg }}
          className="transform group-hover:scale-105 transition-transform"
        />
        
        {/* Actions overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-blue-50 text-blue-600"
            title="Edit"
          >
            <Icons.Edit />
          </button>
          <button
            onClick={onDuplicate}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-green-50 text-green-600"
            title="Duplicate"
          >
            <Icons.Copy />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50 text-red-600"
            title="Delete"
          >
            <Icons.Trash />
          </button>
        </div>
      </div>
      
      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900">{windowType.name}</h3>
            <p className="text-sm text-gray-500">Code: {windowType.code}</p>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[windowType.category]}`}>
            {windowType.category}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
          <span>{windowType.drawing.panels.length} panels</span>
          <span>{windowType.drawing.mullions.length} mullions</span>
          <span>{windowType.hasMesh ? 'With Mesh' : 'No Mesh'}</span>
        </div>
        
        <div className="text-xs text-gray-400 mt-2">
          {windowType.drawing.defaultWidth} × {windowType.drawing.defaultHeight} mm
        </div>
      </div>
    </div>
  );
}

// ===============================================
// WINDOW TYPE ROW COMPONENT (List View)
// ===============================================
interface WindowTypeRowProps {
  windowType: WindowTypeDefinition;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function WindowTypeRow({ windowType, onEdit, onDuplicate, onDelete }: WindowTypeRowProps) {
  const thumbnailSvg = useMemo(() => {
    const engine = new WindowDrawingEngine(
      windowType.drawing.defaultWidth,
      windowType.drawing.defaultHeight,
      windowType.drawing.frameThickness,
      { ...defaultDrawingOptions, showDimensions: false, showLabels: false }
    );
    return engine.renderThumbnail(windowType, 60);
  }, [windowType]);
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div
          dangerouslySetInnerHTML={{ __html: thumbnailSvg }}
          className="w-14 h-14"
        />
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900">{windowType.code}</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-gray-900">{windowType.name}</div>
        {windowType.description && (
          <div className="text-xs text-gray-500 truncate max-w-xs">{windowType.description}</div>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[windowType.category]}`}>
          {windowType.category}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {windowType.drawing.panels.length} panels
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {windowType.drawing.defaultWidth} × {windowType.drawing.defaultHeight}
      </td>
      <td className="px-4 py-3 text-sm">
        {windowType.isActive ? (
          <span className="text-green-600">Active</span>
        ) : (
          <span className="text-gray-400">Inactive</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
            title="Edit"
          >
            <Icons.Edit />
          </button>
          <button
            onClick={onDuplicate}
            className="p-1.5 rounded hover:bg-green-50 text-green-600"
            title="Duplicate"
          >
            <Icons.Copy />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-red-50 text-red-600"
            title="Delete"
          >
            <Icons.Trash />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ===============================================
// MAIN PAGE COMPONENT
// ===============================================
export default function WindowTypesPage() {
  // State
  const [windowTypes, setWindowTypes] = useState<WindowTypeDefinition[]>(windowTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<WindowCategory | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreator, setShowCreator] = useState(false);
  const [editingType, setEditingType] = useState<WindowTypeDefinition | null>(null);
  
  // Filter window types
  const filteredTypes = useMemo(() => {
    return windowTypes.filter(wt => {
      const matchesSearch = searchQuery === '' ||
        wt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wt.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'ALL' || wt.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [windowTypes, searchQuery, categoryFilter]);
  
  // Handlers
  const handleEdit = (windowType: WindowTypeDefinition) => {
    setEditingType(windowType);
    setShowCreator(true);
  };
  
  const handleDuplicate = (windowType: WindowTypeDefinition) => {
    const duplicated: WindowTypeDefinition = {
      ...windowType,
      id: `${windowType.id}_copy_${Date.now()}`,
      code: `${windowType.code}_COPY`,
      name: `${windowType.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setWindowTypes([...windowTypes, duplicated]);
  };
  
  const handleDelete = (windowType: WindowTypeDefinition) => {
    if (windowType.isDefault) {
      alert('Cannot delete default window types');
      return;
    }
    if (confirm(`Are you sure you want to delete "${windowType.name}"?`)) {
      setWindowTypes(windowTypes.filter(wt => wt.id !== windowType.id));
    }
  };
  
  const handleSave = (windowDef: WindowTypeDefinition) => {
    if (editingType) {
      // Update existing
      setWindowTypes(windowTypes.map(wt =>
        wt.id === editingType.id ? { ...windowDef, updatedAt: new Date().toISOString() } : wt
      ));
    } else {
      // Add new
      setWindowTypes([...windowTypes, {
        ...windowDef,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]);
    }
    setShowCreator(false);
    setEditingType(null);
  };
  
  const handleCreateNew = () => {
    setEditingType(null);
    setShowCreator(true);
  };
  
  // Show Visual Creator
  if (showCreator) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-white border-b px-4 py-2 flex items-center">
          <button
            onClick={() => { setShowCreator(false); setEditingType(null); }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Icons.ChevronLeft />
            Back to Window Types
          </button>
        </div>
        <div className="flex-1">
          <VisualCreator
            initialTemplate={editingType?.code}
            onSave={handleSave}
            onCancel={() => { setShowCreator(false); setEditingType(null); }}
          />
        </div>
      </div>
    );
  }
  
  // Main listing view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Window Types</h1>
              <p className="text-sm text-gray-500 mt-1">
                Define and manage window type configurations
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
            >
              <Icons.Plus />
              Create New Type
            </button>
          </div>
          
          {/* Filters */}
          <div className="mt-4 flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Icons.Search />
              <input
                type="text"
                placeholder="Search window types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Icons.Search />
              </div>
            </div>
            
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as WindowCategory | 'ALL')}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="ALL">All Categories</option>
              <option value="SLIDING">Sliding</option>
              <option value="CASEMENT">Casement</option>
              <option value="FIXED">Fixed</option>
              <option value="VENTILATOR">Ventilator</option>
              <option value="DOOR">Door</option>
              <option value="COMBINATION">Combination</option>
            </select>
            
            {/* View Toggle */}
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500'}`}
              >
                <Icons.Grid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500'}`}
              >
                <Icons.List />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          {(['ALL', 'SLIDING', 'CASEMENT', 'FIXED', 'VENTILATOR', 'DOOR'] as const).map(cat => {
            const count = cat === 'ALL'
              ? windowTypes.length
              : windowTypes.filter(wt => wt.category === cat).length;
            const isActive = categoryFilter === cat;
            
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`p-3 rounded-lg text-center transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border hover:border-blue-300'
                }`}
              >
                <div className={`text-2xl font-bold ${isActive ? '' : 'text-gray-900'}`}>
                  {count}
                </div>
                <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                  {cat === 'ALL' ? 'Total' : cat}
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTypes.map(wt => (
              <WindowTypeCard
                key={wt.id}
                windowType={wt}
                onEdit={() => handleEdit(wt)}
                onDuplicate={() => handleDuplicate(wt)}
                onDelete={() => handleDelete(wt)}
              />
            ))}
          </div>
        )}
        
        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Panels</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Default Size</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTypes.map(wt => (
                  <WindowTypeRow
                    key={wt.id}
                    windowType={wt}
                    onEdit={() => handleEdit(wt)}
                    onDuplicate={() => handleDuplicate(wt)}
                    onDelete={() => handleDelete(wt)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Empty State */}
        {filteredTypes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No window types found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
