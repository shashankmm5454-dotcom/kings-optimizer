// ===============================================
// WINDOW TYPE TEMPLATES - SPRINT 2
// ===============================================

import { WindowTypeDefinition, WindowTemplate } from '../types/drawing';

// ===============================================
// HELPER: Generate unique ID
// ===============================================
const generateId = () => `panel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ===============================================
// 2 TRACK SLIDING WINDOW
// ===============================================
export const twoTrackSliding: WindowTypeDefinition = {
  id: '2t-sliding',
  code: '2T',
  name: '2 Track Sliding',
  category: 'SLIDING',
  description: 'Two panel sliding window with one fixed and one sliding panel',
  
  drawing: {
    defaultWidth: 1500,
    defaultHeight: 1200,
    frameThickness: 60,
    panels: [
      {
        id: 'panel-left',
        type: 'SLIDING',
        position: { x: 0, y: 0, width: 50, height: 100 },
        openDirection: 'RIGHT',
        handlePosition: 'RIGHT',
        hasHandle: true,
        hasMesh: false,
        track: 1,
        label: '←'
      },
      {
        id: 'panel-right',
        type: 'SLIDING',
        position: { x: 50, y: 0, width: 50, height: 100 },
        openDirection: 'LEFT',
        handlePosition: 'LEFT',
        hasHandle: true,
        hasMesh: false,
        track: 2,
        label: '→'
      }
    ],
    mullions: [],
    transoms: []
  },
  
  profileRequirements: [
    { profileFamily: 'FRAME', quantityType: 'FORMULA', formula: '2 * (W + H)', description: 'Frame perimeter' },
    { profileFamily: 'SASH', quantityType: 'FORMULA', formula: '4 * (SW + SH)', description: '2 Sashes perimeter' },
    { profileFamily: 'INTERLOCK', quantityType: 'FORMULA', formula: '2 * H', description: 'Interlock at meeting stile' },
    { profileFamily: 'BEADING', quantityType: 'FORMULA', formula: '4 * (GW + GH)', description: 'Glass beading' }
  ],
  
  hardwareRequirements: [
    { itemCategory: 'ROLLER', itemName: 'Tandem Roller', quantityType: 'PER_SASH', multiplier: 2, applicableCondition: 'PANEL_TYPE === SLIDING' },
    { itemCategory: 'LOCK', itemName: 'Crescent Lock', quantityType: 'FIXED', fixedQty: 1 },
    { itemCategory: 'PILE', itemName: 'Wool Pile 6.8mm', quantityType: 'FORMULA', formula: '4 * (W + H)' }
  ],
  
  steelRequirements: [
    { section: '25x25', location: 'FRAME_VERTICAL', formula: '2 * (H - 100)', description: 'Frame verticals' },
    { section: '25x25', location: 'FRAME_HORIZONTAL', formula: '2 * (W - 100)', description: 'Frame horizontals' },
    { section: '20x20', location: 'SASH_VERTICAL', formula: '4 * (SH - 50)', description: 'Sash verticals' },
    { section: '20x20', location: 'SASH_HORIZONTAL', formula: '4 * (SW - 50)', description: 'Sash horizontals' }
  ],
  
  glassCalculations: [
    { panelId: 'panel-left', widthFormula: 'SW - 50', heightFormula: 'SH - 50', description: 'Left panel glass' },
    { panelId: 'panel-right', widthFormula: 'SW - 50', heightFormula: 'SH - 50', description: 'Right panel glass' }
  ],
  
  hasMesh: false,
  
  constraints: {
    minWidth: 900,
    maxWidth: 3000,
    minHeight: 600,
    maxHeight: 2400
  },
  
  isActive: true,
  isDefault: true,
  sortOrder: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// ===============================================
// 3 TRACK SLIDING WINDOW
// ===============================================
export const threeTrackSliding: WindowTypeDefinition = {
  id: '3t-sliding',
  code: '3T',
  name: '3 Track Sliding',
  category: 'SLIDING',
  description: 'Three panel sliding window with center fixed panel',
  
  drawing: {
    defaultWidth: 2400,
    defaultHeight: 1500,
    frameThickness: 60,
    panels: [
      {
        id: 'panel-left',
        type: 'SLIDING',
        position: { x: 0, y: 0, width: 33.33, height: 100 },
        openDirection: 'RIGHT',
        handlePosition: 'RIGHT',
        hasHandle: true,
        hasMesh: false,
        track: 1,
        label: '→'
      },
      {
        id: 'panel-center',
        type: 'FIXED',
        position: { x: 33.33, y: 0, width: 33.34, height: 100 },
        hasHandle: false,
        hasMesh: false,
        track: 2,
        label: 'F'
      },
      {
        id: 'panel-right',
        type: 'SLIDING',
        position: { x: 66.67, y: 0, width: 33.33, height: 100 },
        openDirection: 'LEFT',
        handlePosition: 'LEFT',
        hasHandle: true,
        hasMesh: false,
        track: 3,
        label: '←'
      }
    ],
    mullions: [],
    transoms: []
  },
  
  profileRequirements: [
    { profileFamily: 'FRAME', quantityType: 'FORMULA', formula: '2 * (W + H)', description: 'Frame perimeter' },
    { profileFamily: 'SASH', quantityType: 'FORMULA', formula: '4 * (SW + SH)', description: '2 Sashes perimeter' },
    { profileFamily: 'INTERLOCK', quantityType: 'FORMULA', formula: '4 * H', description: 'Interlocks' },
    { profileFamily: 'BEADING', quantityType: 'FORMULA', formula: '6 * (GW + GH)', description: 'Glass beading' }
  ],
  
  hardwareRequirements: [
    { itemCategory: 'ROLLER', itemName: 'Tandem Roller', quantityType: 'FIXED', fixedQty: 4 },
    { itemCategory: 'LOCK', itemName: 'Crescent Lock', quantityType: 'FIXED', fixedQty: 2 },
    { itemCategory: 'PILE', itemName: 'Wool Pile 6.8mm', quantityType: 'FORMULA', formula: '6 * (W + H)' }
  ],
  
  steelRequirements: [
    { section: '25x25', location: 'FRAME_VERTICAL', formula: '2 * (H - 100)', description: 'Frame verticals' },
    { section: '25x25', location: 'FRAME_HORIZONTAL', formula: '2 * (W - 100)', description: 'Frame horizontals' }
  ],
  
  glassCalculations: [
    { panelId: 'panel-left', widthFormula: 'SW - 50', heightFormula: 'SH - 50', description: 'Left panel glass' },
    { panelId: 'panel-center', widthFormula: 'PW - 50', heightFormula: 'PH - 50', description: 'Center panel glass' },
    { panelId: 'panel-right', widthFormula: 'SW - 50', heightFormula: 'SH - 50', description: 'Right panel glass' }
  ],
  
  hasMesh: false,
  
  constraints: {
    minWidth: 1500,
    maxWidth: 4500,
    minHeight: 900,
    maxHeight: 2400
  },
  
  isActive: true,
  isDefault: false,
  sortOrder: 2,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// ===============================================
// 2 TRACK SLIDING WITH MESH
// ===============================================
export const twoTrackSlidingWithMesh: WindowTypeDefinition = {
  ...twoTrackSliding,
  id: '2t-mesh',
  code: '2TM',
  name: '2 Track with Mesh',
  description: 'Two track sliding window with integrated mosquito mesh',
  
  drawing: {
    ...twoTrackSliding.drawing,
    panels: [
      {
        id: 'panel-left',
        type: 'SLIDING',
        position: { x: 0, y: 0, width: 50, height: 100 },
        openDirection: 'RIGHT',
        handlePosition: 'RIGHT',
        hasHandle: true,
        hasMesh: true,
        meshSide: 'OUTSIDE',
        track: 1,
        label: '←M'
      },
      {
        id: 'panel-right',
        type: 'SLIDING',
        position: { x: 50, y: 0, width: 50, height: 100 },
        openDirection: 'LEFT',
        handlePosition: 'LEFT',
        hasHandle: true,
        hasMesh: false,
        track: 2,
        label: '→'
      }
    ]
  },
  
  hasMesh: true,
  meshCalculation: {
    widthFormula: 'SW - 30',
    heightFormula: 'SH - 30'
  },
  
  sortOrder: 3,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// ===============================================
// FIXED WINDOW
// ===============================================
export const fixedWindow: WindowTypeDefinition = {
  id: 'fixed',
  code: 'FX',
  name: 'Fixed Window',
  category: 'FIXED',
  description: 'Non-openable fixed glass panel',
  
  drawing: {
    defaultWidth: 1200,
    defaultHeight: 1500,
    frameThickness: 60,
    panels: [
      {
        id: 'panel-fixed',
        type: 'FIXED',
        position: { x: 0, y: 0, width: 100, height: 100 },
        hasHandle: false,
        hasMesh: false,
        label: 'FIXED'
      }
    ],
    mullions: [],
    transoms: []
  },
  
  profileRequirements: [
    { profileFamily: 'FRAME', quantityType: 'FORMULA', formula: '2 * (W + H)', description: 'Frame perimeter' },
    { profileFamily: 'BEADING', quantityType: 'FORMULA', formula: '2 * (GW + GH)', description: 'Glass beading' }
  ],
  
  hardwareRequirements: [],
  
  steelRequirements: [
    { section: '25x25', location: 'FRAME_VERTICAL', formula: '2 * (H - 100)', description: 'Frame verticals' },
    { section: '25x25', location: 'FRAME_HORIZONTAL', formula: '2 * (W - 100)', description: 'Frame horizontals' }
  ],
  
  glassCalculations: [
    { panelId: 'panel-fixed', widthFormula: 'W - 120', heightFormula: 'H - 120', description: 'Fixed glass' }
  ],
  
  hasMesh: false,
  
  constraints: {
    minWidth: 300,
    maxWidth: 2400,
    minHeight: 300,
    maxHeight: 3000
  },
  
  isActive: true,
  isDefault: false,
  sortOrder: 4,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// ===============================================
// CASEMENT WINDOW (Single)
// ===============================================
export const casementSingle: WindowTypeDefinition = {
  id: 'casement-single',
  code: 'CO',
  name: 'Casement (Single)',
  category: 'CASEMENT',
  description: 'Single panel casement window opening outward',
  
  drawing: {
    defaultWidth: 600,
    defaultHeight: 1200,
    frameThickness: 60,
    panels: [
      {
        id: 'panel-casement',
        type: 'CASEMENT',
        position: { x: 0, y: 0, width: 100, height: 100 },
        openDirection: 'OUTWARD',
        handlePosition: 'RIGHT',
        hasHandle: true,
        hasMesh: false,
        label: '◢'
      }
    ],
    mullions: [],
    transoms: []
  },
  
  profileRequirements: [
    { profileFamily: 'FRAME', quantityType: 'FORMULA', formula: '2 * (W + H)', description: 'Frame perimeter' },
    { profileFamily: 'SASH', quantityType: 'FORMULA', formula: '2 * (SW + SH)', description: 'Sash perimeter' },
    { profileFamily: 'BEADING', quantityType: 'FORMULA', formula: '2 * (GW + GH)', description: 'Glass beading' }
  ],
  
  hardwareRequirements: [
    { itemCategory: 'HINGE', itemName: 'Friction Stay 16"', quantityType: 'FIXED', fixedQty: 2 },
    { itemCategory: 'HANDLE', itemName: 'Casement Handle', quantityType: 'FIXED', fixedQty: 1 },
    { itemCategory: 'LOCK', itemName: 'Multi-Point Lock', quantityType: 'FIXED', fixedQty: 1 }
  ],
  
  steelRequirements: [
    { section: '25x25', location: 'FRAME_VERTICAL', formula: '2 * (H - 100)', description: 'Frame verticals' },
    { section: '25x25', location: 'FRAME_HORIZONTAL', formula: '2 * (W - 100)', description: 'Frame horizontals' },
    { section: '20x20', location: 'SASH_VERTICAL', formula: '2 * (SH - 50)', description: 'Sash verticals' },
    { section: '20x20', location: 'SASH_HORIZONTAL', formula: '2 * (SW - 50)', description: 'Sash horizontals' }
  ],
  
  glassCalculations: [
    { panelId: 'panel-casement', widthFormula: 'SW - 50', heightFormula: 'SH - 50', description: 'Casement glass' }
  ],
  
  hasMesh: false,
  
  constraints: {
    minWidth: 400,
    maxWidth: 900,
    minHeight: 600,
    maxHeight: 1800
  },
  
  isActive: true,
  isDefault: false,
  sortOrder: 5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// ===============================================
// CASEMENT WINDOW (Double)
// ===============================================
export const casementDouble: WindowTypeDefinition = {
  id: 'casement-double',
  code: '2CO',
  name: 'Casement (Double)',
  category: 'CASEMENT',
  description: 'Two panel casement window with center mullion',
  
  drawing: {
    defaultWidth: 1200,
    defaultHeight: 1500,
    frameThickness: 60,
    panels: [
      {
        id: 'panel-left',
        type: 'CASEMENT',
        position: { x: 0, y: 0, width: 50, height: 100 },
        openDirection: 'OUTWARD',
        handlePosition: 'RIGHT',
        hasHandle: true,
        hasMesh: false,
        label: '◣'
      },
      {
        id: 'panel-right',
        type: 'CASEMENT',
        position: { x: 50, y: 0, width: 50, height: 100 },
        openDirection: 'OUTWARD',
        handlePosition: 'LEFT',
        hasHandle: true,
        hasMesh: false,
        label: '◢'
      }
    ],
    mullions: [
      {
        id: 'mullion-center',
        position: 50,
        startY: 0,
        endY: 100,
        thickness: 40
      }
    ],
    transoms: []
  },
  
  profileRequirements: [
    { profileFamily: 'FRAME', quantityType: 'FORMULA', formula: '2 * (W + H)', description: 'Frame perimeter' },
    { profileFamily: 'MULLION', quantityType: 'FORMULA', formula: 'H', description: 'Center mullion' },
    { profileFamily: 'SASH', quantityType: 'FORMULA', formula: '4 * (SW + SH)', description: '2 Sashes perimeter' },
    { profileFamily: 'BEADING', quantityType: 'FORMULA', formula: '4 * (GW + GH)', description: 'Glass beading' }
  ],
  
  hardwareRequirements: [
    { itemCategory: 'HINGE', itemName: 'Friction Stay 16"', quantityType: 'FIXED', fixedQty: 4 },
    { itemCategory: 'HANDLE', itemName: 'Casement Handle', quantityType: 'FIXED', fixedQty: 2 },
    { itemCategory: 'LOCK', itemName: 'Multi-Point Lock', quantityType: 'FIXED', fixedQty: 2 }
  ],
  
  steelRequirements: [
    { section: '25x25', location: 'FRAME_VERTICAL', formula: '2 * (H - 100)', description: 'Frame verticals' },
    { section: '25x25', location: 'FRAME_HORIZONTAL', formula: '2 * (W - 100)', description: 'Frame horizontals' },
    { section: '25x25', location: 'MULLION', formula: 'H - 100', description: 'Mullion steel' }
  ],
  
  glassCalculations: [
    { panelId: 'panel-left', widthFormula: 'SW - 50', heightFormula: 'SH - 50', description: 'Left casement glass' },
    { panelId: 'panel-right', widthFormula: 'SW - 50', heightFormula: 'SH - 50', description: 'Right casement glass' }
  ],
  
  hasMesh: false,
  
  constraints: {
    minWidth: 800,
    maxWidth: 1800,
    minHeight: 900,
    maxHeight: 2100
  },
  
  isActive: true,
  isDefault: false,
  sortOrder: 6,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// ===============================================
// COMBINATION: 2T + CASEMENT
// ===============================================
export const twoTrackCasementCombo: WindowTypeDefinition = {
  id: '2t-casement-combo',
  code: '2TCO',
  name: '2 Track + Casement',
  category: 'COMBINATION',
  description: 'Two track sliding with casement on the side',
  
  drawing: {
    defaultWidth: 2100,
    defaultHeight: 1500,
    frameThickness: 60,
    panels: [
      {
        id: 'panel-left-slide',
        type: 'SLIDING',
        position: { x: 0, y: 0, width: 35, height: 100 },
        openDirection: 'RIGHT',
        handlePosition: 'RIGHT',
        hasHandle: true,
        hasMesh: false,
        track: 1,
        label: '→'
      },
      {
        id: 'panel-right-slide',
        type: 'SLIDING',
        position: { x: 35, y: 0, width: 35, height: 100 },
        openDirection: 'LEFT',
        handlePosition: 'LEFT',
        hasHandle: true,
        hasMesh: false,
        track: 2,
        label: '←'
      },
      {
        id: 'panel-casement',
        type: 'CASEMENT',
        position: { x: 70, y: 0, width: 30, height: 100 },
        openDirection: 'OUTWARD',
        handlePosition: 'LEFT',
        hasHandle: true,
        hasMesh: false,
        label: '◢'
      }
    ],
    mullions: [
      {
        id: 'mullion-divider',
        position: 70,
        startY: 0,
        endY: 100,
        thickness: 50
      }
    ],
    transoms: []
  },
  
  profileRequirements: [
    { profileFamily: 'FRAME', quantityType: 'FORMULA', formula: '2 * (W + H)', description: 'Frame perimeter' },
    { profileFamily: 'MULLION', quantityType: 'FORMULA', formula: 'H', description: 'Divider mullion' },
    { profileFamily: 'SASH', quantityType: 'FORMULA', formula: '6 * (SW + SH)', description: '3 Sashes perimeter' },
    { profileFamily: 'INTERLOCK', quantityType: 'FORMULA', formula: '2 * H', description: 'Sliding interlock' }
  ],
  
  hardwareRequirements: [
    { itemCategory: 'ROLLER', itemName: 'Tandem Roller', quantityType: 'FIXED', fixedQty: 4 },
    { itemCategory: 'LOCK', itemName: 'Crescent Lock', quantityType: 'FIXED', fixedQty: 1 },
    { itemCategory: 'HINGE', itemName: 'Friction Stay 16"', quantityType: 'FIXED', fixedQty: 2 },
    { itemCategory: 'HANDLE', itemName: 'Casement Handle', quantityType: 'FIXED', fixedQty: 1 },
    { itemCategory: 'LOCK', itemName: 'Multi-Point Lock', quantityType: 'FIXED', fixedQty: 1 }
  ],
  
  steelRequirements: [
    { section: '25x25', location: 'FRAME_VERTICAL', formula: '2 * (H - 100)', description: 'Frame verticals' },
    { section: '25x25', location: 'FRAME_HORIZONTAL', formula: '2 * (W - 100)', description: 'Frame horizontals' }
  ],
  
  glassCalculations: [
    { panelId: 'panel-left-slide', widthFormula: 'SW - 50', heightFormula: 'SH - 50', description: 'Left slide glass' },
    { panelId: 'panel-right-slide', widthFormula: 'SW - 50', heightFormula: 'SH - 50', description: 'Right slide glass' },
    { panelId: 'panel-casement', widthFormula: 'SW - 50', heightFormula: 'SH - 50', description: 'Casement glass' }
  ],
  
  hasMesh: false,
  
  constraints: {
    minWidth: 1500,
    maxWidth: 3600,
    minHeight: 900,
    maxHeight: 2400
  },
  
  isActive: true,
  isDefault: false,
  sortOrder: 7,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// ===============================================
// VENTILATOR
// ===============================================
export const ventilator: WindowTypeDefinition = {
  id: 'ventilator',
  code: 'VT',
  name: 'Ventilator',
  category: 'VENTILATOR',
  description: 'Small top-hung ventilator window',
  
  drawing: {
    defaultWidth: 600,
    defaultHeight: 450,
    frameThickness: 50,
    panels: [
      {
        id: 'panel-vent',
        type: 'TOP_HUNG',
        position: { x: 0, y: 0, width: 100, height: 100 },
        openDirection: 'OUTWARD',
        handlePosition: 'BOTTOM',
        hasHandle: true,
        hasMesh: false,
        label: '▽'
      }
    ],
    mullions: [],
    transoms: []
  },
  
  profileRequirements: [
    { profileFamily: 'FRAME', quantityType: 'FORMULA', formula: '2 * (W + H)', description: 'Frame perimeter' },
    { profileFamily: 'SASH', quantityType: 'FORMULA', formula: '2 * (SW + SH)', description: 'Sash perimeter' }
  ],
  
  hardwareRequirements: [
    { itemCategory: 'HINGE', itemName: 'Top Hung Hinge', quantityType: 'FIXED', fixedQty: 2 },
    { itemCategory: 'HANDLE', itemName: 'Ventilator Stay', quantityType: 'FIXED', fixedQty: 1 }
  ],
  
  steelRequirements: [],
  
  glassCalculations: [
    { panelId: 'panel-vent', widthFormula: 'SW - 40', heightFormula: 'SH - 40', description: 'Ventilator glass' }
  ],
  
  hasMesh: false,
  
  constraints: {
    minWidth: 300,
    maxWidth: 900,
    minHeight: 300,
    maxHeight: 600
  },
  
  isActive: true,
  isDefault: false,
  sortOrder: 8,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// ===============================================
// SLIDING DOOR
// ===============================================
export const slidingDoor: WindowTypeDefinition = {
  id: 'sliding-door',
  code: '2TD',
  name: '2 Track Sliding Door',
  category: 'DOOR',
  description: 'Two panel sliding door',
  
  drawing: {
    defaultWidth: 1800,
    defaultHeight: 2100,
    frameThickness: 80,
    panels: [
      {
        id: 'panel-left',
        type: 'SLIDING',
        position: { x: 0, y: 0, width: 50, height: 100 },
        openDirection: 'RIGHT',
        handlePosition: 'RIGHT',
        hasHandle: true,
        hasMesh: false,
        track: 1,
        label: '→'
      },
      {
        id: 'panel-right',
        type: 'SLIDING',
        position: { x: 50, y: 0, width: 50, height: 100 },
        openDirection: 'LEFT',
        handlePosition: 'LEFT',
        hasHandle: true,
        hasMesh: false,
        track: 2,
        label: '←'
      }
    ],
    mullions: [],
    transoms: []
  },
  
  profileRequirements: [
    { profileFamily: 'FRAME', quantityType: 'FORMULA', formula: '2 * (W + H)', description: 'Door frame perimeter' },
    { profileFamily: 'SASH', quantityType: 'FORMULA', formula: '4 * (SW + SH)', description: '2 Door sashes' },
    { profileFamily: 'INTERLOCK', quantityType: 'FORMULA', formula: '2 * H', description: 'Door interlock' }
  ],
  
  hardwareRequirements: [
    { itemCategory: 'ROLLER', itemName: 'Heavy Duty Roller', quantityType: 'FIXED', fixedQty: 8 },
    { itemCategory: 'LOCK', itemName: 'Door Lock with Key', quantityType: 'FIXED', fixedQty: 1 },
    { itemCategory: 'HANDLE', itemName: 'D-Handle Set', quantityType: 'FIXED', fixedQty: 2 }
  ],
  
  steelRequirements: [
    { section: '30x30', location: 'FRAME_VERTICAL', formula: '2 * (H - 150)', description: 'Door frame verticals' },
    { section: '30x30', location: 'FRAME_HORIZONTAL', formula: '2 * (W - 150)', description: 'Door frame horizontals' },
    { section: '25x25', location: 'SASH_VERTICAL', formula: '4 * (SH - 100)', description: 'Door sash verticals' },
    { section: '25x25', location: 'SASH_HORIZONTAL', formula: '4 * (SW - 100)', description: 'Door sash horizontals' }
  ],
  
  glassCalculations: [
    { panelId: 'panel-left', widthFormula: 'SW - 80', heightFormula: 'SH - 80', description: 'Left door glass' },
    { panelId: 'panel-right', widthFormula: 'SW - 80', heightFormula: 'SH - 80', description: 'Right door glass' }
  ],
  
  hasMesh: false,
  
  constraints: {
    minWidth: 1200,
    maxWidth: 4000,
    minHeight: 1800,
    maxHeight: 2700
  },
  
  isActive: true,
  isDefault: false,
  sortOrder: 9,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// ===============================================
// EXPORT ALL TEMPLATES
// ===============================================
export const windowTemplates: WindowTypeDefinition[] = [
  twoTrackSliding,
  threeTrackSliding,
  twoTrackSlidingWithMesh,
  fixedWindow,
  casementSingle,
  casementDouble,
  twoTrackCasementCombo,
  ventilator,
  slidingDoor
];

// ===============================================
// GET TEMPLATE BY CODE
// ===============================================
export function getTemplateByCode(code: string): WindowTypeDefinition | undefined {
  return windowTemplates.find(t => t.code === code);
}

// ===============================================
// GET TEMPLATES BY CATEGORY
// ===============================================
export function getTemplatesByCategory(category: string): WindowTypeDefinition[] {
  return windowTemplates.filter(t => t.category === category);
}
