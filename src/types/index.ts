// ===============================================
// KINGS OPTIMIZER - COMPLETE TYPES INDEX
// Sprint 1 + Sprint 2 Types
// ===============================================

// Re-export all drawing types from Sprint 2
export * from './drawing';

// ===============================================
// SPRINT 1: CORE DATA MODELS
// ===============================================

// UPVC Profile Model
export interface UPVCProfile {
  id: string;
  code: string;                    // e.g., "FR-60", "SH-40"
  name: string;                    // e.g., "Frame 60mm"
  family: 'FRAME' | 'SASH' | 'MULLION' | 'TRANSOM' | 'BEADING' | 'INTERLOCK' | 'ADDON';
  brand: string;                   // e.g., "FENSTAS", "ENCRAFT"
  
  // Dimensions
  stockLength: number;             // Standard stock length in mm (e.g., 6500)
  weight: number;                  // Weight per meter in kg
  
  // Pricing
  ratePerMeter: number;           
  ratePerPiece: number;           
  pricingMode: 'METER' | 'PIECE';
  
  // For calculation
  deductions: {
    frame: number;                 // Deduction from frame size
    sash: number;                  // Deduction from sash size
  };
  
  // Visual
  color: string;
  imageUrl?: string;
  
  // Metadata
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Glass Option Model
export interface GlassOption {
  id: string;
  name: string;                    // e.g., "CLEAR", "TINTED BLUE"
  type: 'FLOAT' | 'TOUGHENED' | 'LAMINATED' | 'DGU' | 'FROSTED' | 'REFLECTIVE';
  
  // Thickness options with rates
  variants: {
    thickness: string;             // e.g., "5mm", "6mm", "5+5 DGU"
    ratePerSqft: number;
    ratePerSqm: number;
    weight: number;                // kg per sqm
  }[];
  
  // Stock sizes available
  stockSizes: {
    width: number;                 // in mm
    height: number;                // in mm
    ratePerSheet: number;
  }[];
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Hardware Item Model
export interface HardwareItem {
  id: string;
  name: string;
  category: 'ROLLER' | 'LOCK' | 'HANDLE' | 'HINGE' | 'INTERLOCK' | 'GASKET' | 'PILE' | 'SCREW' | 'ANCHOR' | 'OTHER';
  
  // Pricing
  unit: 'PCS' | 'MTR' | 'KG' | 'SET' | 'PAIR';
  rate: number;
  
  // Auto-calculation rules
  calculationRule: {
    type: 'PER_WINDOW' | 'PER_SASH' | 'PER_METER' | 'PER_SQFT' | 'FIXED' | 'FORMULA';
    formula?: string;              // e.g., "SASH_COUNT * 2"
    applicableTo?: string[];       // Window types this applies to
  };
  
  // Variants
  variants?: {
    name: string;
    rate: number;
  }[];
  
  brand?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Steel Section Model
export interface SteelSection {
  id: string;
  name: string;                    // e.g., "Square 19x19", "Flat 25x3"
  type: 'SQUARE' | 'FLAT' | 'ANGLE' | 'CHANNEL';
  dimensions: string;              // e.g., "19x19mm", "25x3mm"
  weightPerMeter: number;          // kg/m
  ratePerKg: number;
  ratePerMeter: number;
  stockLength: number;             // mm
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===============================================
// QUOTE MODELS
// ===============================================

export interface Quote {
  id: string;
  quoteNo: string;
  version: number;                 // For revisions
  parentQuoteId?: string;          // If this is a revision
  
  // Project details
  project: {
    siteName: string;
    clientName: string;
    phone: string;
    email?: string;
    address: string;
    gpsLink?: string;
    date: string;
  };
  
  // Windows in this quote
  windows: QuoteWindow[];
  
  // Selected options
  options: {
    brand: string;
    glassType: string;
    glassThickness: string;
    meshType: string;
    steelMode: string;
  };
  
  // Pricing
  pricing: {
    baseCost: number;
    profitPct: number;
    profitAmount: number;
    discountPct: number;
    discountFlat: number;
    discountAmount: number;
    subtotal: number;
    gstPct: number;
    gstAmount: number;
    extraCharges: number;
    total: number;
    perSqft: number;
  };
  
  // Optimizer results (cached)
  optimizerResults?: {
    profile?: ProfileOptimizationResult;
    glass?: GlassOptimizationResult;
    steel?: SteelOptimizationResult;
    hardware?: HardwareCalculationResult;
  };
  
  // Status
  status: 'DRAFT' | 'QUOTED' | 'CONFIRMED' | 'PRODUCTION' | 'COMPLETED' | 'CANCELLED';
  
  // Files
  files: {
    quotationPdf?: string;
    profileCuttingList?: string;
    glassCuttingList?: string;
    steelCuttingList?: string;
    hardwareList?: string;
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  savedAt?: string;
}

export interface QuoteWindow {
  id: string;
  sl: number;
  flat: string;
  
  // Type & dimensions
  typeCode: string;
  typeName?: string;
  width: number;
  height: number;
  
  // Sash dimensions
  sashWidth: number;
  sashHeight: number;
  
  // Mesh dimensions (if applicable)
  meshWidth: number;
  meshHeight: number;
  
  // Quantity & area
  qty: number;
  sqft: number;
  
  // Pricing
  rate: number;
  amount: number;
  
  // Custom drawing (if modified)
  customDrawing?: {
    svg: string;
    overrides: any;
  };
  
  // Notes
  notes?: string;
  location?: string;              // e.g., "Living Room", "Bedroom 1"
}

// ===============================================
// OPTIMIZATION RESULT MODELS
// ===============================================

export interface ProfileOptimizationResult {
  summary: {
    totalStock: number;
    totalLength: number;
    totalWaste: number;
    totalCost: number;
  };
  byProfile: {
    code: string;
    family: string;
    stock: number;
    length: number;
    waste: number;
    cost: number;
  }[];
  cuttingPatterns: {
    profile: string;
    stockLength: number;
    cuts: number[];
    waste: number;
  }[];
}

export interface GlassOptimizationResult {
  summary: {
    totalSheets: number;
    totalArea: number;
    totalWaste: number;
    totalCost: number;
  };
  sheets: {
    id: number;
    size: string;
    pieces: number;
    used: number;
    waste: number;
  }[];
  cuttingLayout?: {
    sheetId: number;
    pieces: {
      x: number;
      y: number;
      width: number;
      height: number;
      label: string;
    }[];
  }[];
}

export interface SteelOptimizationResult {
  summary: {
    totalLength: number;
    totalWeight: number;
    totalCost: number;
    mode: string;
  };
  sections: {
    section: string;
    length: number;
    weight: number;
    cost: number;
  }[];
}

export interface HardwareCalculationResult {
  summary: {
    totalItems: number;
    totalCost: number;
  };
  items: {
    item: string;
    category: string;
    qty: number;
    unit: string;
    rate: number;
    amount: number;
  }[];
}

// ===============================================
// COMPANY & USER MODELS
// ===============================================

export interface CompanyInfo {
  companyName: string;
  brandName: string;
  phone: string;
  email: string;
  gst: string;
  address: string;
  logoUrl?: string;
  logoId?: string;
  footerText: string;
  themeColor: string;
  allowedEmails?: string;
}

export interface UserSettings {
  defaultProfitPct: number;
  defaultWastePct: number;
  defaultGstPct: number;
  defaultBrand: string;
  defaultGlassType: string;
  defaultThickness: string;
  defaultMeshType: string;
  defaultSteelMode: string;
  smartRounding: boolean;
  compactMode: boolean;
  darkMode: boolean;
}

// ===============================================
// STORAGE MODELS
// ===============================================

export interface StorageItem<T> {
  id: string;
  data: T;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface SyncStatus {
  lastSync: string;
  pendingChanges: number;
  status: 'synced' | 'syncing' | 'error' | 'offline';
}

// ===============================================
// UI STATE MODELS
// ===============================================

export interface EngineStatus {
  status: 'idle' | 'running' | 'done' | 'error';
  lastRun: string;
  cost: number;
  waste?: number;
  stock?: string;
  error?: string;
}

export interface DashboardStats {
  revenue: number;
  pipeline: number;
  receivable: number;
  quotesThisMonth: number;
  conversionRate: number;
  avgTicket: number;
  topClient: string;
  recentActivity: {
    type: string;
    text: string;
    time: string;
  }[];
}

// ===============================================
// CALCULATION HELPERS
// ===============================================

export interface CalculationOptions {
  brand: string;
  glassType: string;
  glassThickness: string;
  meshType: string;
  steelMode: string;
  wastePct: number;
  profitPct: number;
}

export interface SizeConstraints {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  aspectRatioMin?: number;
  aspectRatioMax?: number;
}
