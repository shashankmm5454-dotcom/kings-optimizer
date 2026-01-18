// ==========================================
// HARDWARE OPTIMIZER
// ==========================================

import type { Window, Project, HardwareResult, HardwareItem } from '../types'

// Hardware configuration per window type
const HARDWARE_CONFIG: Record<string, HardwareSpec[]> = {
  '2T': [
    { item: 'ROLLER', qty_formula: '4 * qty', rate: 85 },
    { item: 'LOCK', qty_formula: '1 * qty', rate: 450 },
    { item: 'HANDLE', qty_formula: '2 * qty', rate: 180 },
    { item: 'INTERLOCK', qty_formula: 'height_m * 2', rate: 120 },
    { item: 'WOOLLEN PILE', qty_formula: 'perimeter_m * 4', rate: 25 },
    { item: 'GASKET', qty_formula: 'perimeter_m * 2', rate: 35 },
    { item: 'SCREWS', qty_formula: '20 * qty', rate: 0.5 },
  ],
  '2+1': [
    { item: 'ROLLER', qty_formula: '6 * qty', rate: 85 },
    { item: 'LOCK', qty_formula: '1 * qty', rate: 450 },
    { item: 'HANDLE', qty_formula: '2 * qty', rate: 180 },
    { item: 'INTERLOCK', qty_formula: 'height_m * 3', rate: 120 },
    { item: 'WOOLLEN PILE', qty_formula: 'perimeter_m * 6', rate: 25 },
    { item: 'GASKET', qty_formula: 'perimeter_m * 2', rate: 35 },
    { item: 'MESH NET', qty_formula: 'sqft', rate: 45 },
    { item: 'SCREWS', qty_formula: '24 * qty', rate: 0.5 },
  ],
  'FIX': [
    { item: 'GASKET', qty_formula: 'perimeter_m * 2', rate: 35 },
    { item: 'SCREWS', qty_formula: '12 * qty', rate: 0.5 },
  ],
  'CO': [
    { item: 'FRICTION STAY', qty_formula: '2 * qty', rate: 350 },
    { item: 'HANDLE', qty_formula: '1 * qty', rate: 220 },
    { item: 'GASKET', qty_formula: 'perimeter_m * 2', rate: 35 },
    { item: 'SCREWS', qty_formula: '16 * qty', rate: 0.5 },
  ],
  'FD': [
    { item: 'ROLLER', qty_formula: '8 * qty', rate: 95 },
    { item: 'DOOR LOCK', qty_formula: '1 * qty', rate: 850 },
    { item: 'DOOR HANDLE', qty_formula: '1 * qty', rate: 650 },
    { item: 'INTERLOCK', qty_formula: 'height_m * 4', rate: 120 },
    { item: 'WOOLLEN PILE', qty_formula: 'perimeter_m * 8', rate: 25 },
    { item: 'GASKET', qty_formula: 'perimeter_m * 4', rate: 35 },
    { item: 'SCREWS', qty_formula: '40 * qty', rate: 0.5 },
  ],
}

interface HardwareSpec {
  item: string
  qty_formula: string
  rate: number
}

export async function runHardwareOptimizer(
  windows: Window[],
  project: Project
): Promise<HardwareResult> {
  const itemTotals: Record<string, { qty: number; rate: number }> = {}
  
  for (const win of windows) {
    const type = normalizeType(win.opening_type)
    const config = HARDWARE_CONFIG[type] || HARDWARE_CONFIG['2T']
    const qty = win.qty || 1
    
    // Calculate variables
    const perimeter_m = ((win.width + win.height) * 2) / 1000
    const height_m = win.height / 1000
    const sqft = (win.width * win.height) / 92903.04
    
    for (const spec of config) {
      const itemQty = evaluateFormula(spec.qty_formula, {
        qty,
        perimeter_m,
        height_m,
        sqft,
      })
      
      if (!itemTotals[spec.item]) {
        itemTotals[spec.item] = { qty: 0, rate: spec.rate }
      }
      itemTotals[spec.item].qty += itemQty
    }
  }
  
  // Build items array
  const items: HardwareItem[] = Object.entries(itemTotals).map(([name, data]) => ({
    item_name: name,
    sku: null,
    category: categorizeItem(name),
    qty: Math.ceil(data.qty * 100) / 100, // Round to 2 decimals
    unit: getUnit(name),
    rate: data.rate,
    amount: Math.round(data.qty * data.rate),
  }))
  
  // Group by category
  const byCategory: Record<string, HardwareItem[]> = {}
  for (const item of items) {
    if (!byCategory[item.category]) byCategory[item.category] = []
    byCategory[item.category].push(item)
  }
  
  const totalCost = items.reduce((sum, i) => sum + i.amount, 0)

  return {
    items,
    by_category: byCategory,
    total_cost: totalCost,
  }
}

function normalizeType(type: string): string {
  const t = (type || '').toUpperCase()
  if (t.includes('2+1')) return '2+1'
  if (t.includes('2T')) return '2T'
  if (t.includes('3T')) return '2T' // Similar hardware
  if (t.includes('FIX')) return 'FIX'
  if (t.includes('CO') || t.includes('CASE')) return 'CO'
  if (t.startsWith('FD')) return 'FD'
  return '2T'
}

function evaluateFormula(
  formula: string,
  vars: Record<string, number>
): number {
  try {
    let expr = formula
    for (const [key, val] of Object.entries(vars)) {
      expr = expr.replace(new RegExp(key, 'g'), String(val))
    }
    // Safe eval using Function
    return new Function(`return ${expr}`)()
  } catch {
    return 0
  }
}

function categorizeItem(name: string): string {
  const n = name.toUpperCase()
  if (n.includes('ROLLER') || n.includes('FRICTION')) return 'Movement'
  if (n.includes('LOCK') || n.includes('HANDLE')) return 'Hardware'
  if (n.includes('GASKET') || n.includes('PILE') || n.includes('SEAL')) return 'Sealing'
  if (n.includes('SCREW') || n.includes('FASTENER')) return 'Fasteners'
  if (n.includes('MESH') || n.includes('NET')) return 'Mesh'
  return 'Other'
}

function getUnit(name: string): string {
  const n = name.toUpperCase()
  if (n.includes('PILE') || n.includes('GASKET') || n.includes('INTERLOCK')) return 'MTR'
  if (n.includes('MESH') || n.includes('NET')) return 'SQFT'
  return 'PCS'
}