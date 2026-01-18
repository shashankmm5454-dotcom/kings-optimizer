// ==========================================
// GLASS CUTTING OPTIMIZER (2D Bin Packing)
// ==========================================

import type { Window, Project, OptimizerResult } from '../types'

// Standard glass sheet sizes (mm)
const SHEET_SIZES = [
  { width: 2440, height: 1830, name: '8x6 feet' },
  { width: 3210, height: 2250, name: '10.5x7.5 feet' },
]

// Glass rates (₹/sqft)
const GLASS_RATES: Record<string, number> = {
  'CLEAR 4mm': 45,
  'CLEAR 5mm': 55,
  'CLEAR 6mm': 65,
  'TINTED 5mm': 75,
  'TINTED 6mm': 85,
  'REFLECTIVE 6mm': 120,
}

interface GlassPiece {
  width: number
  height: number
  window_id: string
  flat: string
  sl: number
}

export async function runGlassOptimizer(
  windows: Window[],
  project: Project
): Promise<OptimizerResult> {
  // 1. Extract glass pieces from windows
  const pieces = extractGlassPieces(windows)
  
  // 2. Run 2D bin packing
  const sheets = packGlassSheets(pieces)
  
  // 3. Calculate cost
  const glassType = project.glass_option || 'CLEAR 5mm'
  const ratePerSqft = GLASS_RATES[glassType] || 55
  
  let totalArea = 0
  for (const sheet of sheets) {
    totalArea += (sheet.width * sheet.height) / 92903.04 // Convert mm² to sqft
  }
  
  const totalCost = totalArea * ratePerSqft

  return {
    engine: 'GLASS',
    patterns: sheets.map((s, i) => ({
      stock_length: s.width,
      profile_code: `SHEET-${i + 1}`,
      pieces: s.pieces.map(p => ({
        length: p.width,
        qty: 1,
        window_id: p.window_id,
        flat: p.flat,
        sl: p.sl,
        profile_code: 'GLASS',
        family: 'GLASS',
      })),
      waste_mm: s.waste,
      waste_pct: s.wastePct,
      total_used: s.usedArea,
    })),
    summary: {
      total_stock: sheets.length,
      total_pieces: pieces.length,
      total_waste_mm: sheets.reduce((sum, s) => sum + s.waste, 0),
      total_waste_pct: sheets.reduce((sum, s) => sum + s.wastePct, 0) / Math.max(sheets.length, 1),
      total_cost: totalCost,
    },
    by_profile: {
      GLASS: {
        stock_count: sheets.length,
        total_length: totalArea,
        cost: totalCost,
      },
    },
    computed_at: new Date().toISOString(),
  }
}

function extractGlassPieces(windows: Window[]): GlassPiece[] {
  const pieces: GlassPiece[] = []
  const GLASS_DEDUCTION = 10 // mm clearance
  
  for (const win of windows) {
    const type = (win.opening_type || '').toUpperCase()
    const qty = win.qty || 1
    
    // Calculate glass sizes based on window type
    let glassPanels: { w: number; h: number }[] = []
    
    if (type.includes('FIX')) {
      // Single glass
      glassPanels.push({
        w: win.width - 80 - GLASS_DEDUCTION,
        h: win.height - 80 - GLASS_DEDUCTION,
      })
    } else if (type.includes('2T') || type.includes('2+1')) {
      // Two sliding panels
      const panelW = (win.width / 2) - 50 - GLASS_DEDUCTION
      const panelH = win.height - 100 - GLASS_DEDUCTION
      glassPanels.push({ w: panelW, h: panelH })
      glassPanels.push({ w: panelW, h: panelH })
    } else if (type.includes('3T')) {
      // Three panels
      const panelW = (win.width / 3) - 40 - GLASS_DEDUCTION
      const panelH = win.height - 100 - GLASS_DEDUCTION
      glassPanels.push({ w: panelW, h: panelH })
      glassPanels.push({ w: panelW, h: panelH })
      glassPanels.push({ w: panelW, h: panelH })
    } else {
      // Default: single panel
      glassPanels.push({
        w: win.width - 100 - GLASS_DEDUCTION,
        h: win.height - 100 - GLASS_DEDUCTION,
      })
    }
    
    // Add pieces for each qty
    for (let q = 0; q < qty; q++) {
      for (const panel of glassPanels) {
        if (panel.w > 0 && panel.h > 0) {
          pieces.push({
            width: Math.round(panel.w),
            height: Math.round(panel.h),
            window_id: win.id,
            flat: win.flat_no || '',
            sl: win.sl_no,
          })
        }
      }
    }
  }
  
  return pieces
}

interface PackedSheet {
  width: number
  height: number
  pieces: GlassPiece[]
  usedArea: number
  waste: number
  wastePct: number
}

function packGlassSheets(pieces: GlassPiece[]): PackedSheet[] {
  // Sort by area (descending) for better packing
  const sorted = [...pieces].sort((a, b) => (b.width * b.height) - (a.width * a.height))
  
  const sheets: PackedSheet[] = []
  const CUTTING_GAP = 15 // mm between pieces
  
  const sheetTemplate = SHEET_SIZES[0] // Use standard size
  
  // Simple shelf-based packing
  for (const piece of sorted) {
    let placed = false
    
    // Try to place in existing sheets
    for (const sheet of sheets) {
      // Simple: check if it fits (this is a simplified algorithm)
      const totalUsedWidth = sheet.pieces.reduce((sum, p) => sum + p.width + CUTTING_GAP, 0)
      const maxUsedHeight = Math.max(...sheet.pieces.map(p => p.height), 0)
      
      // Try horizontal placement
      if (totalUsedWidth + piece.width <= sheetTemplate.width &&
          piece.height <= sheetTemplate.height) {
        sheet.pieces.push(piece)
        sheet.usedArea += piece.width * piece.height
        placed = true
        break
      }
    }
    
    // Create new sheet if not placed
    if (!placed) {
      const newSheet: PackedSheet = {
        width: sheetTemplate.width,
        height: sheetTemplate.height,
        pieces: [piece],
        usedArea: piece.width * piece.height,
        waste: 0,
        wastePct: 0,
      }
      sheets.push(newSheet)
    }
  }
  
  // Calculate waste for each sheet
  for (const sheet of sheets) {
    const totalArea = sheet.width * sheet.height
    sheet.waste = totalArea - sheet.usedArea
    sheet.wastePct = (sheet.waste / totalArea) * 100
  }
  
  return sheets
}