// ==========================================
// UPVC PROFILE CUTTING OPTIMIZER
// Converted from your UPVC_OPTIMIZER.txt
// ==========================================

import Decimal from 'decimal.js'
import type { Window, Project, OptimizerResult, CuttingPattern, CuttingPiece } from '../types'

// Stock lengths available (mm)
const STOCK_LENGTHS = [6500, 6000, 5500]

// Profile configuration by window type
const PROFILE_CONFIG: Record<string, ProfileConfig[]> = {
  '2T': [
    { family: 'FRAME', code: 'FR-01', formula: 'perimeter', multiplier: 1 },
    { family: 'SASH', code: 'SH-01', formula: 'sash_perimeter', multiplier: 2 },
    { family: 'INTERLOCK', code: 'IL-01', formula: 'height', multiplier: 2 },
    { family: 'BEADING', code: 'BD-01', formula: 'glass_perimeter', multiplier: 2 },
  ],
  '2+1': [
    { family: 'FRAME', code: 'FR-01', formula: 'perimeter', multiplier: 1 },
    { family: 'SASH', code: 'SH-01', formula: 'sash_perimeter', multiplier: 2 },
    { family: 'MESH', code: 'MS-01', formula: 'mesh_perimeter', multiplier: 1 },
    { family: 'INTERLOCK', code: 'IL-01', formula: 'height', multiplier: 3 },
    { family: 'BEADING', code: 'BD-01', formula: 'glass_perimeter', multiplier: 2 },
    { family: 'MESH BEADING', code: 'MB-01', formula: 'mesh_perimeter', multiplier: 1 },
  ],
  '3T': [
    { family: 'FRAME', code: 'FR-01', formula: 'perimeter', multiplier: 1 },
    { family: 'SASH', code: 'SH-01', formula: 'sash_perimeter', multiplier: 2 },
    { family: 'INTERLOCK', code: 'IL-01', formula: 'height', multiplier: 3 },
    { family: 'BEADING', code: 'BD-01', formula: 'glass_perimeter', multiplier: 2 },
  ],
  'FIX': [
    { family: 'FRAME', code: 'FR-01', formula: 'perimeter', multiplier: 1 },
    { family: 'BEADING', code: 'BD-01', formula: 'glass_perimeter', multiplier: 1 },
  ],
  'CO': [
    { family: 'FRAME', code: 'FR-01', formula: 'perimeter', multiplier: 1 },
    { family: 'SASH', code: 'SH-01', formula: 'sash_perimeter', multiplier: 1 },
    { family: 'BEADING', code: 'BD-01', formula: 'glass_perimeter', multiplier: 1 },
  ],
  // Add more types as needed...
}

interface ProfileConfig {
  family: string
  code: string
  formula: string
  multiplier: number
}

interface Piece {
  length: number
  qty: number
  window_id: string
  flat: string
  sl: number
  profile_code: string
  family: string
}

// Deduction constants (mm)
const DEDUCTIONS = {
  frame_width: 50,
  frame_height: 50,
  sash_width: 100,
  sash_height: 100,
  beading: 40,
  interlock: 20,
}

// Profile rates (₹/meter) - should come from DB in production
const PROFILE_RATES: Record<string, number> = {
  'FR-01': 85,
  'SH-01': 75,
  'IL-01': 45,
  'BD-01': 35,
  'MS-01': 55,
  'MB-01': 30,
}

// ==========================================
// MAIN OPTIMIZER FUNCTION
// ==========================================

export async function runUPVCOptimizer(
  windows: Window[],
  project: Project
): Promise<OptimizerResult> {
  const startTime = Date.now()

  // 1. Expand windows to pieces
  const allPieces = expandWindowsToPieces(windows)

  // 2. Group pieces by profile code
  const groupedByProfile = groupByProfile(allPieces)

  // 3. Run cutting optimization for each profile group
  const patterns: CuttingPattern[] = []
  let totalCost = 0
  const byProfile: Record<string, { stock_count: number; total_length: number; cost: number }> = {}

  for (const [profileCode, pieces] of Object.entries(groupedByProfile)) {
    const result = optimizeCutting(pieces, profileCode)
    patterns.push(...result.patterns)
    
    const rate = PROFILE_RATES[profileCode] || 50
    const totalMeters = result.totalStockUsed * 6.5 // Assuming 6500mm stock
    const cost = totalMeters * rate
    
    byProfile[profileCode] = {
      stock_count: result.totalStockUsed,
      total_length: result.totalLength,
      cost: cost,
    }
    
    totalCost += cost
  }

  // 4. Calculate summary
  const totalStock = Object.values(byProfile).reduce((sum, p) => sum + p.stock_count, 0)
  const totalPieces = allPieces.length
  const totalWasteMm = patterns.reduce((sum, p) => sum + p.waste_mm, 0)
  const totalUsedMm = patterns.reduce((sum, p) => sum + p.total_used, 0)
  const totalWastePct = totalUsedMm > 0 ? (totalWasteMm / (totalWasteMm + totalUsedMm)) * 100 : 0

  return {
    engine: 'UPVC',
    patterns,
    summary: {
      total_stock: totalStock,
      total_pieces: totalPieces,
      total_waste_mm: totalWasteMm,
      total_waste_pct: totalWastePct,
      total_cost: totalCost,
    },
    by_profile: byProfile,
    computed_at: new Date().toISOString(),
  }
}

// ==========================================
// PIECE EXPANSION
// ==========================================

function expandWindowsToPieces(windows: Window[]): Piece[] {
  const pieces: Piece[] = []

  for (const win of windows) {
    const type = normalizeWindowType(win.opening_type)
    const config = PROFILE_CONFIG[type] || PROFILE_CONFIG['2T']
    const qty = win.qty || 1

    for (const profile of config) {
      const lengths = calculateLengths(win, profile)
      
      for (const length of lengths) {
        for (let q = 0; q < qty; q++) {
          pieces.push({
            length: Math.round(length),
            qty: 1,
            window_id: win.id,
            flat: win.flat_no || '',
            sl: win.sl_no,
            profile_code: profile.code,
            family: profile.family,
          })
        }
      }
    }
  }

  return pieces
}

function normalizeWindowType(type: string): string {
  const t = (type || '').toUpperCase().replace(/\s+/g, '')
  
  // Handle common variations
  if (t.includes('2+1') || t.includes('2T+M') || t.includes('2P1')) return '2+1'
  if (t.includes('3T') || t.includes('3TRACK')) return '3T'
  if (t.includes('2T') || t.includes('2TRACK')) return '2T'
  if (t.includes('FIX')) return 'FIX'
  if (t.includes('CASE') || t.includes('CO')) return 'CO'
  if (t.startsWith('FD')) return 'FD2P' // Doors
  
  return '2T' // Default
}

function calculateLengths(win: Window, profile: ProfileConfig): number[] {
  const W = win.width
  const H = win.height
  const SW = win.sw || W / 2 - 30 // Shutter width
  const SH = win.sh || H - 80 // Shutter height
  const MW = win.mw || SW // Mesh width
  const MH = win.mh || SH // Mesh height

  const lengths: number[] = []

  switch (profile.formula) {
    case 'perimeter':
      // Frame: 2 widths + 2 heights (with deductions)
      lengths.push(W - DEDUCTIONS.frame_width, W - DEDUCTIONS.frame_width)
      lengths.push(H - DEDUCTIONS.frame_height, H - DEDUCTIONS.frame_height)
      break

    case 'sash_perimeter':
      // Sash: for each shutter
      for (let i = 0; i < profile.multiplier; i++) {
        lengths.push(SW - DEDUCTIONS.sash_width, SW - DEDUCTIONS.sash_width)
        lengths.push(SH - DEDUCTIONS.sash_height, SH - DEDUCTIONS.sash_height)
      }
      break

    case 'height':
      // Interlock: vertical pieces
      for (let i = 0; i < profile.multiplier; i++) {
        lengths.push(H - DEDUCTIONS.interlock)
      }
      break

    case 'glass_perimeter':
      // Beading: around glass
      const GW = SW - DEDUCTIONS.beading
      const GH = SH - DEDUCTIONS.beading
      for (let i = 0; i < profile.multiplier; i++) {
        lengths.push(GW, GW, GH, GH)
      }
      break

    case 'mesh_perimeter':
      // Mesh frame
      lengths.push(MW - 40, MW - 40, MH - 40, MH - 40)
      break

    default:
      // Fallback
      lengths.push(W - 50, W - 50, H - 50, H - 50)
  }

  return lengths.filter(l => l > 0)
}

// ==========================================
// CUTTING OPTIMIZATION (First Fit Decreasing)
// ==========================================

function groupByProfile(pieces: Piece[]): Record<string, Piece[]> {
  const groups: Record<string, Piece[]> = {}
  
  for (const piece of pieces) {
    const key = piece.profile_code
    if (!groups[key]) groups[key] = []
    groups[key].push(piece)
  }
  
  return groups
}

function optimizeCutting(
  pieces: Piece[],
  profileCode: string
): {
  patterns: CuttingPattern[]
  totalStockUsed: number
  totalLength: number
} {
  // Sort pieces by length (descending) - First Fit Decreasing
  const sorted = [...pieces].sort((a, b) => b.length - a.length)
  
  const patterns: CuttingPattern[] = []
  const stockLength = STOCK_LENGTHS[0] // Use 6500mm
  const SAW_KERF = 5 // mm lost per cut

  // Bin packing
  for (const piece of sorted) {
    let placed = false
    
    // Try to fit in existing patterns
    for (const pattern of patterns) {
      const currentUsed = pattern.pieces.reduce((sum, p) => sum + p.length + SAW_KERF, 0)
      const remaining = stockLength - currentUsed
      
      if (remaining >= piece.length + SAW_KERF) {
        pattern.pieces.push(piece)
        pattern.total_used = currentUsed + piece.length + SAW_KERF
        pattern.waste_mm = stockLength - pattern.total_used
        pattern.waste_pct = (pattern.waste_mm / stockLength) * 100
        placed = true
        break
      }
    }
    
    // Create new pattern if not placed
    if (!placed) {
      const newPattern: CuttingPattern = {
        stock_length: stockLength,
        profile_code: profileCode,
        pieces: [piece],
        waste_mm: stockLength - piece.length - SAW_KERF,
        waste_pct: ((stockLength - piece.length - SAW_KERF) / stockLength) * 100,
        total_used: piece.length + SAW_KERF,
      }
      patterns.push(newPattern)
    }
  }

  const totalStockUsed = patterns.length
  const totalLength = pieces.reduce((sum, p) => sum + p.length, 0)

  return { patterns, totalStockUsed, totalLength }
}