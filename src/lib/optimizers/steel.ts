// ==========================================
// STEEL REINFORCEMENT OPTIMIZER
// ==========================================

import type { Window, Project, OptimizerResult } from '../types'

// Steel sections and rates
const STEEL_SECTIONS = {
  'SECTION_A': { weight: 0.5, rate: 65 }, // kg/m, ₹/kg
  'SECTION_B': { weight: 0.75, rate: 65 },
  'SECTION_C': { weight: 1.0, rate: 65 },
}

// Minimum dimensions requiring steel
const STEEL_THRESHOLD = {
  width: 900, // mm
  height: 1200, // mm
}

export async function runSteelOptimizer(
  windows: Window[],
  project: Project
): Promise<OptimizerResult> {
  const pieces: any[] = []
  let totalLength = 0
  let totalWeight = 0
  
  for (const win of windows) {
    const qty = win.qty || 1
    
    // Check if window needs steel
    const needsSteel = win.width >= STEEL_THRESHOLD.width || 
                       win.height >= STEEL_THRESHOLD.height
    
    if (!needsSteel) continue
    
    // Calculate steel lengths
    // Frame steel: 2 widths + 2 heights
    const frameW = win.width - 60
    const frameH = win.height - 60
    
    // Sash steel (for sliding windows)
    const type = (win.opening_type || '').toUpperCase()
    let sashCount = 0
    if (type.includes('2T') || type.includes('2+1')) sashCount = 2
    else if (type.includes('3T')) sashCount = 3
    else if (type.includes('CO')) sashCount = 1
    
    const sashW = frameW / Math.max(sashCount, 1) - 40
    const sashH = frameH - 80
    
    for (let q = 0; q < qty; q++) {
      // Frame pieces
      pieces.push({ length: frameW, type: 'FRAME_WIDTH', window_id: win.id })
      pieces.push({ length: frameW, type: 'FRAME_WIDTH', window_id: win.id })
      pieces.push({ length: frameH, type: 'FRAME_HEIGHT', window_id: win.id })
      pieces.push({ length: frameH, type: 'FRAME_HEIGHT', window_id: win.id })
      
      // Sash pieces
      for (let s = 0; s < sashCount; s++) {
        pieces.push({ length: sashW, type: 'SASH_WIDTH', window_id: win.id })
        pieces.push({ length: sashW, type: 'SASH_WIDTH', window_id: win.id })
        pieces.push({ length: sashH, type: 'SASH_HEIGHT', window_id: win.id })
        pieces.push({ length: sashH, type: 'SASH_HEIGHT', window_id: win.id })
      }
    }
  }
  
  // Calculate totals
  totalLength = pieces.reduce((sum, p) => sum + p.length, 0)
  const totalMeters = totalLength / 1000
  const section = STEEL_SECTIONS['SECTION_A']
  totalWeight = totalMeters * section.weight
  const totalCost = totalWeight * section.rate

  return {
    engine: 'STEEL',
    patterns: [{
      stock_length: 6000,
      profile_code: 'STEEL',
      pieces: pieces.map(p => ({
        length: p.length,
        qty: 1,
        window_id: p.window_id,
        flat: '',
        sl: 0,
        profile_code: 'STEEL',
        family: p.type,
      })),
      waste_mm: 0,
      waste_pct: 0,
      total_used: totalLength,
    }],
    summary: {
      total_stock: Math.ceil(totalMeters / 6),
      total_pieces: pieces.length,
      total_waste_mm: 0,
      total_waste_pct: 0,
      total_cost: totalCost,
    },
    by_profile: {
      STEEL: {
        stock_count: Math.ceil(totalMeters / 6),
        total_length: totalLength,
        cost: totalCost,
      },
    },
    computed_at: new Date().toISOString(),
  }
}