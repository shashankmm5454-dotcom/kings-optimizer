// ==========================================
// KINGS OPTIMIZER - TYPE DEFINITIONS
// Complete type system for SAAS
// ==========================================

// ==================== PROFILE TYPES ====================

export type ProfileFamily = 
  | 'FRAME' 
  | 'SASH' 
  | 'MULLION' 
  | 'TRANSOM' 
  | 'BEADING' 
  | 'INTERLOCK' 
  | 'ADDON'
  | 'MESH_FRAME'
  | 'SHUTTER';

export interface UPVCProfile {
  id: string;
  code: string;
  name: string;
  family: ProfileFamily;
  brand: string;
  
  // Dimensions
  stockLength: number;          // mm
  weightPerMeter: number;       // kg
  
  // Pricing
  ratePerMeter: number;
  ratePerPiece: number;
  pricingMode: 'METER' | 'PIECE';
  
  // Deductions for calculations
  deductions: {
    frame: number;              // Deduct from frame W/H
    sash: number;               // Deduct from sash W/H
    beading: number;            // Deduct for beading
  };
  
  // Visual
  color: string;
  imageUrl?: string;
  
  // Metadata
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== GLASS TYPES ====================

export type GlassType = 
  | 'FLOAT' 
  | 'TOUGHENED' 
  | 'LAMINATED' 
  | 'DGU' 
  | 'FROSTED' 
  | 'REFLECTIVE'
  | 'TINTED';

export interface GlassVariant {
  id: string;
  thickness: string;            // e.g., "5mm", "6mm", "5+12+5 DGU"
  ratePerSqft: number;
  ratePerSqm: number;
  weightPerSqm: number;         // kg
  isDefault: boolean;
}

export interface GlassStockSize {
  id: string;
  width: number;                // mm
  height: number;               // mm
  ratePerSheet: number;
  label: string;                // e.g., "8x6 ft"
}

export interface GlassOption {
  id: string;
  name: string;
  displayName: string;          // e.g., "Clear Float Glass"
  type: GlassType;
  
  variants: GlassVariant[];
  stockSizes: GlassStockSize[];
  
  // Visual
  color: string;                // For UI display
  opacity: number;              // 0-1 for drawing preview
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== HARDWARE TYPES ====================

export type HardwareCategory = 
  | 'ROLLER'
  | 'LOCK' 
  | 'HANDLE'
  | 'HINGE'
  | 'INTERLOCK'
  | 'GASKET'
  | 'PILE'
  | 'SCREW'
  | 'ANCHOR'
  | 'CORNER'
  | 'DRAINAGE'
  | 'REINFORCEMENT'
  | 'OTHER';

export type HardwareUnit = 'PCS' | 'MTR' | 'KG' | 'SET' | 'PAIR' | 'BOX';

export type CalculationRuleType = 
  | 'PER_WINDOW'
  | 'PER_SASH'
  | 'PER_PANEL'
  | 'PER_METER_FRAME'
  | 'PER_METER_SASH'
  | 'PER_SQFT'
  | 'FIXED'
  | 'FORMULA';

export interface HardwareCalculationRule {
  type: CalculationRuleType;
  formula?: string;             // Custom formula if type is FORMULA
  multiplier: number;           // Quantity multiplier
  applicableTypes?: string[];   // Window type codes this applies to
  excludeTypes?: string[];      // Window types to exclude
}

export interface HardwareVariant {
  id: string;
  name: string;                 // e.g., "22mm", "Standard", "Heavy Duty"
  rate: number;
  isDefault: boolean;
}

export interface HardwareItem {
  id: string;
  name: string;
  code: string;                 // Short code for reference
  category: HardwareCategory;
  description?: string;
  
  // Pricing
  unit: HardwareUnit;
  rate: number;
  
  // Variants (sizes/types)
  variants: HardwareVariant[];
  
  // Auto-calculation
  calculationRule: HardwareCalculationRule;
  
  // Visual
  imageUrl?: string;
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== WINDOW TYPE DEFINITIONS ====================

export type WindowCategory = 
  | 'SLIDING'
  | 'CASEMENT'
  | 'FIXED'
  | 'VENTILATOR'
  | 'DOOR'
  | 'COMBINATION'
  | 'CUSTOM';

export type PanelType = 
  | 'FIXED'
  | 'SLIDING_LEFT'
  | 'SLIDING_RIGHT'
  | 'CASEMENT_LEFT'
  | 'CASEMENT_RIGHT'
  | 'TOP_HUNG'
  | 'BOTTOM_HUNG'
  | 'TILT_TURN'
  | 'MESH';

export interface PanelDefinition {
  id: string;
  type: PanelType;
  position: {
    x: number;                  // Relative position (0-1)
    y: number;
    width: number;              // Relative size (0-1)
    height: number;
  };
  hasGlass: boolean;
  hasMesh: boolean;
  handlePosition?: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM';
}

export interface DividerDefinition {
  id: string;
  type: 'MULLION' | 'TRANSOM';
  position: number;             // Relative position (0-1)
  profileCode?: string;         // Which profile to use
}

export interface ProfileRequirement {
  profileFamily: ProfileFamily;
  formula: string;              // e.g., "2 * (W + H) / 1000"
  description: string;
}

export interface HardwareRequirement {
  hardwareId?: string;          // Link to specific hardware
  category: HardwareCategory;
  formula: string;              // e.g., "PANEL_COUNT * 2"
  description: string;
}

export interface SteelRequirement {
  section: string;              // e.g., "FRAME_VERTICAL"
  formula: string;              // e.g., "2 * H / 1000"
  description: string;
}

export interface WindowTypeDefinition {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: WindowCategory;
  
  // Drawing
  drawing: {
    svg: string;                // Base SVG template
    thumbnail?: string;         // Thumbnail image
    panels: PanelDefinition[];
    dividers: DividerDefinition[];
  };
  
  // Material requirements (formulas)
  profileRequirements: ProfileRequirement[];
  hardwareRequirements: HardwareRequirement[];
  steelRequirements: SteelRequirement[];
  
  // Glass calculation
  glassCalculation: {
    panelCount: number;
    sizeFormula: string;        // How to calc glass size
    deductions: {
      width: number;
      height: number;
    };
  };
  
  // Mesh
  hasMesh: boolean;
  meshCalculation?: {
    panelCount: number;
    sizeFormula: string;
  };
  
  // Constraints
  constraints: {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
  };
  
  // Metadata
  isSystem: boolean;            // Built-in vs custom
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== QUOTE TYPES ====================

export type QuoteStatus = 
  | 'DRAFT'
  | 'QUOTED'
  | 'CONFIRMED'
  | 'PRODUCTION'
  | 'COMPLETED'
  | 'CANCELLED';

export type SteelMode = 
  | 'full'
  | 'onlyHeight'
  | 'frameMesh'
  | 'cut200Frame'
  | 'cut200PlusMesh';

export interface ProjectDetails {
  siteName: string;
  clientName: string;
  phone: string;
  email?: string;
  address: string;
  gpsLink?: string;
  date: string;
}

export interface QuoteWindow {
  id: string;
  sl: number;
  flat: string;
  location?: string;            // e.g., "Living Room"
  
  // Type
  typeCode: string;
  typeName?: string;
  
  // Dimensions (all in mm)
  width: number;
  height: number;
  sashWidth: number;
  sashHeight: number;
  meshWidth: number;
  meshHeight: number;
  
  // Quantity & area
  qty: number;
  sqft: number;
  
  // Pricing
  rate: number;
  amount: number;
  
  // Custom drawing override
  customDrawing?: {
    svg: string;
    panels: PanelDefinition[];
    overrides: Record<string, any>;
  };
  
  // Notes
  notes?: string;
}

export interface QuoteOptions {
  brand: string;
  glassType: string;
  glassThickness: string;
  meshType: string;
  steelMode: SteelMode;
}

export interface QuotePricing {
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
  extraChargesNote?: string;
  total: number;
  perSqft: number;
  roundingAdjustment: number;
}

export interface OptimizationResults {
  profile?: ProfileOptimizationResult;
  glass?: GlassOptimizationResult;
  steel?: SteelOptimizationResult;
  hardware?: HardwareCalculationResult;
  labor?: LaborEstimate;
}

export interface QuoteFiles {
  quotationPdf?: string;
  profileCuttingList?: string;
  glassCuttingList?: string;
  steelCuttingList?: string;
  hardwareList?: string;
  packingList?: string;
  folderId?: string;
}

export interface Quote {
  id: string;
  quoteNo: string;
  version: number;
  parentQuoteId?: string;
  
  project: ProjectDetails;
  windows: QuoteWindow[];
  options: QuoteOptions;
  pricing: QuotePricing;
  
  optimizerResults?: OptimizationResults;
  
  status: QuoteStatus;
  files: QuoteFiles;
  
  createdAt: string;
  updatedAt: string;
  savedAt?: string;
  lockedAt?: string;
}

// ==================== OPTIMIZATION RESULT TYPES ====================

export interface ProfileCuttingPattern {
  stockLength: number;
  cuts: { length: number; windowId: string; profileCode: string }[];
  waste: number;
  wastePercent: number;
}

export interface ProfileOptimizationResult {
  summary: {
    totalStock: number;
    totalLength: number;
    totalWaste: number;
    wastePercent: number;
    totalCost: number;
  };
  byProfile: {
    code: string;
    family: ProfileFamily;
    stock: number;
    length: number;
    waste: number;
    cost: number;
    patterns: ProfileCuttingPattern[];
  }[];
  cuttingList: {
    sl: number;
    profileCode: string;
    length: number;
    qty: number;
    windowRef: string;
  }[];
}

export interface GlassSheet {
  id: number;
  stockSize: string;
  pieces: { width: number; height: number; windowId: string }[];
  usedPercent: number;
  wastePercent: number;
  layout?: string;              // SVG of cutting layout
}

export interface GlassOptimizationResult {
  summary: {
    totalSheets: number;
    totalArea: number;
    totalWaste: number;
    wastePercent: number;
    totalCost: number;
  };
  sheets: GlassSheet[];
  cuttingList: {
    sl: number;
    width: number;
    height: number;
    qty: number;
    windowRef: string;
    area: number;
  }[];
}

export interface SteelOptimizationResult {
  summary: {
    totalLength: number;
    totalWeight: number;
    totalCost: number;
    mode: SteelMode;
  };
  bySection: {
    section: string;
    length: number;
    weight: number;
    cost: number;
  }[];
  cuttingList: {
    sl: number;
    section: string;
    length: number;
    qty: number;
    windowRef: string;
  }[];
}

export interface HardwareCalculationResult {
  summary: {
    totalItems: number;
    totalCost: number;
  };
  items: {
    name: string;
    code: string;
    category: HardwareCategory;
    qty: number;
    unit: HardwareUnit;
    rate: number;
    amount: number;
  }[];
}

export interface LaborEstimate {
  production: {
    hours: number;
    days: number;
    team: number;
  };
  installation: {
    hours: number;
    days: number;
    team: number;
  };
}

// ==================== USER & SETTINGS TYPES ====================

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
  website?: string;
}

export interface UserSettings {
  defaults: {
    profitPct: number;
    wastePct: number;
    gstPct: number;
    steelMode: SteelMode;
    brand: string;
    glassType: string;
    glassThickness: string;
    meshType: string;
  };
  appearance: {
    darkMode: boolean;
    compactMode: boolean;
    showDimensions: boolean;
  };
  quotation: {
    autoNumber: boolean;
    numberPrefix: string;
    numberSuffix: string;
    termsAndConditions: string;
    validityDays: number;
  };
  notifications: {
    emailOnSave: boolean;
    emailOnConfirm: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  company: CompanyInfo;
  settings: UserSettings;
  allowedEmails: string[];
  subscription: {
    plan: 'FREE' | 'PRO' | 'BUSINESS';
    validUntil: string;
    quotesUsed: number;
    quotesLimit: number;
  };
  createdAt: string;
  updatedAt: string;
}

// ==================== STORAGE TYPES ====================

export interface StorageFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  downloadLink?: string;
  createdAt: string;
}

export interface StorageFolder {
  id: string;
  name: string;
  webViewLink?: string;
}

// ==================== FORMULA CONTEXT ====================

export interface FormulaContext {
  W: number;                    // Window width
  H: number;                    // Window height
  SW: number;                   // Sash width
  SH: number;                   // Sash height
  MW: number;                   // Mesh width
  MH: number;                   // Mesh height
  QTY: number;                  // Quantity
  SQFT: number;                 // Square feet
  PANEL_COUNT: number;          // Number of panels
  SASH_COUNT: number;           // Number of sashes
  MESH_COUNT: number;           // Number of mesh panels
  GLASS_COUNT: number;          // Number of glass panels
  [key: string]: number;        // Custom variables
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}