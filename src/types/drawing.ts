// ===============================================
// DRAWING SYSTEM TYPES - SPRINT 2
// ===============================================

// Panel Types
export type PanelType = 'FIXED' | 'SLIDING' | 'CASEMENT' | 'TILT_TURN' | 'TOP_HUNG' | 'AWNING';
export type OpenDirection = 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM' | 'INWARD' | 'OUTWARD';
export type HandlePosition = 'LEFT' | 'RIGHT' | 'CENTER' | 'TOP' | 'BOTTOM';

// Window Categories
export type WindowCategory = 'SLIDING' | 'CASEMENT' | 'FIXED' | 'VENTILATOR' | 'DOOR' | 'COMBINATION';

// ===============================================
// PANEL DEFINITION
// ===============================================
export interface PanelDefinition {
  id: string;
  type: PanelType;
  position: {
    x: number;      // Percentage from left (0-100)
    y: number;      // Percentage from top (0-100)
    width: number;  // Percentage of total width
    height: number; // Percentage of total height
  };
  openDirection?: OpenDirection;
  handlePosition?: HandlePosition;
  hasHandle: boolean;
  hasMesh: boolean;
  meshSide?: 'INSIDE' | 'OUTSIDE';
  track?: number;   // For sliding windows (1, 2, 3, etc.)
  label?: string;   // e.g., "L", "R", "Fixed"
}

// ===============================================
// MULLION & TRANSOM
// ===============================================
export interface MullionDefinition {
  id: string;
  position: number;     // Percentage from left (0-100)
  startY: number;       // Start percentage from top
  endY: number;         // End percentage from top (usually 100)
  thickness: number;    // Visual thickness in mm
  profileCode?: string; // Associated profile
}

export interface TransomDefinition {
  id: string;
  position: number;     // Percentage from top (0-100)
  startX: number;       // Start percentage from left
  endX: number;         // End percentage from left (usually 100)
  thickness: number;    // Visual thickness in mm
  profileCode?: string; // Associated profile
}

// ===============================================
// PROFILE REQUIREMENT
// ===============================================
export interface ProfileRequirement {
  profileFamily: 'FRAME' | 'SASH' | 'MULLION' | 'TRANSOM' | 'BEADING' | 'INTERLOCK' | 'ADDON';
  quantityType: 'FORMULA' | 'FIXED';
  formula?: string;     // e.g., "2 * (W + H)"
  fixedQty?: number;
  description: string;  // e.g., "Frame perimeter"
}

// ===============================================
// HARDWARE REQUIREMENT
// ===============================================
export interface HardwareRequirement {
  itemCategory: string;
  itemName: string;
  quantityType: 'FORMULA' | 'FIXED' | 'PER_SASH' | 'PER_PANEL';
  formula?: string;
  fixedQty?: number;
  multiplier?: number;
  applicableCondition?: string; // e.g., "PANEL_TYPE === 'SLIDING'"
}

// ===============================================
// STEEL REQUIREMENT
// ===============================================
export interface SteelRequirement {
  section: string;      // e.g., "25x25", "20x20"
  location: 'FRAME_VERTICAL' | 'FRAME_HORIZONTAL' | 'SASH_VERTICAL' | 'SASH_HORIZONTAL' | 'MULLION' | 'TRANSOM';
  formula: string;      // e.g., "H - 100"
  description: string;
}

// ===============================================
// GLASS CALCULATION
// ===============================================
export interface GlassCalculation {
  panelId: string;
  widthFormula: string;   // e.g., "PANEL_W - 50"
  heightFormula: string;  // e.g., "PANEL_H - 50"
  description: string;
}

// ===============================================
// WINDOW TYPE DEFINITION - MAIN MODEL
// ===============================================
export interface WindowTypeDefinition {
  id: string;
  code: string;           // e.g., "2T", "3T", "CO", "2TCO"
  name: string;           // e.g., "2 Track Sliding"
  category: WindowCategory;
  description?: string;
  
  // Visual Configuration
  drawing: {
    defaultWidth: number;   // Default width in mm
    defaultHeight: number;  // Default height in mm
    frameThickness: number; // Visual frame thickness
    panels: PanelDefinition[];
    mullions: MullionDefinition[];
    transoms: TransomDefinition[];
  };
  
  // Material Requirements
  profileRequirements: ProfileRequirement[];
  hardwareRequirements: HardwareRequirement[];
  steelRequirements: SteelRequirement[];
  glassCalculations: GlassCalculation[];
  
  // Mesh Configuration
  hasMesh: boolean;
  meshCalculation?: {
    widthFormula: string;
    heightFormula: string;
  };
  
  // Constraints
  constraints: {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    minPanelWidth?: number;
    maxPanelWidth?: number;
  };
  
  // Metadata
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  thumbnailSvg?: string;
  createdAt: string;
  updatedAt: string;
}

// ===============================================
// DRAWING RENDERING OPTIONS
// ===============================================
export interface DrawingOptions {
  showDimensions: boolean;
  showLabels: boolean;
  showHandles: boolean;
  showArrows: boolean;
  showMeshIndicator: boolean;
  showGlass: boolean;
  showFrame: boolean;
  scale: number;
  
  // Colors
  frameColor: string;
  sashColor: string;
  glassColor: string;
  meshColor: string;
  dimensionColor: string;
  labelColor: string;
}

// ===============================================
// CALCULATED MATERIAL RESULTS
// ===============================================
export interface MaterialRequirements {
  profiles: {
    family: string;
    code: string;
    length: number;       // in mm
    quantity: number;
    description: string;
  }[];
  
  glass: {
    panelId: string;
    width: number;        // in mm
    height: number;       // in mm
    area: number;         // in sqm
    description: string;
  }[];
  
  hardware: {
    name: string;
    quantity: number;
    unit: string;
    description: string;
  }[];
  
  steel: {
    section: string;
    length: number;       // in mm
    quantity: number;
    weight: number;       // in kg
    description: string;
  }[];
  
  mesh?: {
    width: number;
    height: number;
    area: number;
  };
}

// ===============================================
// VISUAL CREATOR STATE
// ===============================================
export interface VisualCreatorState {
  windowType: Partial<WindowTypeDefinition>;
  selectedPanelId: string | null;
  selectedMullionId: string | null;
  selectedTransomId: string | null;
  isDragging: boolean;
  dragTarget: 'PANEL' | 'MULLION' | 'TRANSOM' | null;
  zoom: number;
  gridSnap: boolean;
  showGuides: boolean;
}

// ===============================================
// PRESET TEMPLATES
// ===============================================
export interface WindowTemplate {
  id: string;
  name: string;
  category: WindowCategory;
  description: string;
  definition: Omit<WindowTypeDefinition, 'id' | 'createdAt' | 'updatedAt'>;
  thumbnail: string;
}

// ===============================================
// FORMULA VARIABLES
// ===============================================
export interface FormulaVariables {
  W: number;              // Window width
  H: number;              // Window height
  FT: number;             // Frame thickness
  SW: number;             // Sash width
  SH: number;             // Sash height
  PANEL_COUNT: number;
  SASH_COUNT: number;
  MULLION_COUNT: number;
  TRANSOM_COUNT: number;
  [key: string]: number;
}

// ===============================================
// DRAWING EXPORT OPTIONS
// ===============================================
export interface DrawingExportOptions {
  format: 'SVG' | 'PNG' | 'PDF';
  width?: number;
  height?: number;
  backgroundColor?: string;
  includeTitle: boolean;
  includeDimensions: boolean;
  scale?: number;
}
