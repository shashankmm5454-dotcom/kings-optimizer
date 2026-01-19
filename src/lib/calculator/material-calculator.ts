// ===============================================
// MATERIAL CALCULATOR ENGINE - SPRINT 2
// ===============================================

import {
  WindowTypeDefinition,
  MaterialRequirements,
  FormulaVariables,
  PanelDefinition
} from '../types/drawing';

// ===============================================
// FORMULA PARSER & EVALUATOR
// ===============================================
export class FormulaEngine {
  private variables: FormulaVariables;
  
  constructor(variables: FormulaVariables) {
    this.variables = variables;
  }
  
  // Evaluate a formula string with variables
  evaluate(formula: string): number {
    try {
      // Replace variable names with values
      let expression = formula;
      
      // Sort variables by length (longest first) to avoid partial replacements
      const sortedVars = Object.entries(this.variables)
        .sort((a, b) => b[0].length - a[0].length);
      
      for (const [varName, value] of sortedVars) {
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        expression = expression.replace(regex, value.toString());
      }
      
      // Evaluate the expression
      // Using Function constructor for safe evaluation
      const result = new Function(`return ${expression}`)();
      
      return typeof result === 'number' && !isNaN(result) ? result : 0;
    } catch (error) {
      console.error(`Formula evaluation error: ${formula}`, error);
      return 0;
    }
  }
  
  // Update variables
  setVariables(vars: Partial<FormulaVariables>): void {
    this.variables = { ...this.variables, ...vars };
  }
  
  // Get current variables
  getVariables(): FormulaVariables {
    return { ...this.variables };
  }
}

// ===============================================
// MATERIAL CALCULATOR CLASS
// ===============================================
export class MaterialCalculator {
  private windowDef: WindowTypeDefinition;
  private width: number;
  private height: number;
  private formulaEngine: FormulaEngine;
  
  constructor(
    windowDef: WindowTypeDefinition,
    width: number,
    height: number
  ) {
    this.windowDef = windowDef;
    this.width = width;
    this.height = height;
    
    // Initialize formula variables
    const variables = this.calculateBaseVariables();
    this.formulaEngine = new FormulaEngine(variables);
  }
  
  // ===============================================
  // CALCULATE BASE VARIABLES
  // ===============================================
  private calculateBaseVariables(): FormulaVariables {
    const ft = this.windowDef.drawing.frameThickness;
    const panels = this.windowDef.drawing.panels;
    
    // Count panel types
    const sashCount = panels.filter(p => p.type !== 'FIXED').length;
    const panelCount = panels.length;
    const mullionCount = this.windowDef.drawing.mullions.length;
    const transomCount = this.windowDef.drawing.transoms.length;
    
    // Calculate inner dimensions
    const innerWidth = this.width - (ft * 2);
    const innerHeight = this.height - (ft * 2);
    
    // Calculate average sash dimensions
    const avgSashWidth = panelCount > 0 ? innerWidth / panelCount : innerWidth;
    const avgSashHeight = innerHeight;
    
    // Glass dimensions (approximate)
    const glassDeduction = 50; // Default glass deduction
    const glassWidth = avgSashWidth - glassDeduction;
    const glassHeight = avgSashHeight - glassDeduction;
    
    return {
      W: this.width,
      H: this.height,
      FT: ft,
      SW: avgSashWidth,
      SH: avgSashHeight,
      GW: glassWidth,
      GH: glassHeight,
      PW: avgSashWidth,    // Panel width (same as sash for most cases)
      PH: avgSashHeight,   // Panel height
      PANEL_COUNT: panelCount,
      SASH_COUNT: sashCount,
      MULLION_COUNT: mullionCount,
      TRANSOM_COUNT: transomCount,
      INNER_W: innerWidth,
      INNER_H: innerHeight
    };
  }
  
  // ===============================================
  // CALCULATE ALL MATERIALS
  // ===============================================
  calculate(): MaterialRequirements {
    return {
      profiles: this.calculateProfiles(),
      glass: this.calculateGlass(),
      hardware: this.calculateHardware(),
      steel: this.calculateSteel(),
      mesh: this.windowDef.hasMesh ? this.calculateMesh() : undefined
    };
  }
  
  // ===============================================
  // CALCULATE PROFILES
  // ===============================================
  private calculateProfiles(): MaterialRequirements['profiles'] {
    const results: MaterialRequirements['profiles'] = [];
    
    for (const req of this.windowDef.profileRequirements) {
      let length = 0;
      let quantity = 1;
      
      if (req.quantityType === 'FORMULA' && req.formula) {
        length = this.formulaEngine.evaluate(req.formula);
      } else if (req.quantityType === 'FIXED' && req.fixedQty) {
        quantity = req.fixedQty;
      }
      
      results.push({
        family: req.profileFamily,
        code: req.profileFamily, // Will be mapped to actual profile code later
        length: Math.round(length),
        quantity,
        description: req.description
      });
    }
    
    return results;
  }
  
  // ===============================================
  // CALCULATE GLASS
  // ===============================================
  private calculateGlass(): MaterialRequirements['glass'] {
    const results: MaterialRequirements['glass'] = [];
    const ft = this.windowDef.drawing.frameThickness;
    const innerWidth = this.width - (ft * 2);
    const innerHeight = this.height - (ft * 2);
    
    for (const glassCalc of this.windowDef.glassCalculations) {
      // Find the panel
      const panel = this.windowDef.drawing.panels.find(p => p.id === glassCalc.panelId);
      
      if (panel) {
        // Calculate panel dimensions
        const panelWidth = (panel.position.width / 100) * innerWidth;
        const panelHeight = (panel.position.height / 100) * innerHeight;
        
        // Update formula variables for this panel
        this.formulaEngine.setVariables({
          PW: panelWidth,
          PH: panelHeight,
          SW: panelWidth,
          SH: panelHeight
        });
        
        const glassWidth = this.formulaEngine.evaluate(glassCalc.widthFormula);
        const glassHeight = this.formulaEngine.evaluate(glassCalc.heightFormula);
        const area = (glassWidth * glassHeight) / 1000000; // Convert to sqm
        
        results.push({
          panelId: glassCalc.panelId,
          width: Math.round(glassWidth),
          height: Math.round(glassHeight),
          area: Math.round(area * 1000) / 1000, // Round to 3 decimal places
          description: glassCalc.description
        });
      }
    }
    
    return results;
  }
  
  // ===============================================
  // CALCULATE HARDWARE
  // ===============================================
  private calculateHardware(): MaterialRequirements['hardware'] {
    const results: MaterialRequirements['hardware'] = [];
    const panels = this.windowDef.drawing.panels;
    
    for (const req of this.windowDef.hardwareRequirements) {
      let quantity = 0;
      
      switch (req.quantityType) {
        case 'FIXED':
          quantity = req.fixedQty || 0;
          break;
          
        case 'PER_SASH':
          const sashCount = panels.filter(p => p.type !== 'FIXED').length;
          quantity = sashCount * (req.multiplier || 1);
          break;
          
        case 'PER_PANEL':
          quantity = panels.length * (req.multiplier || 1);
          break;
          
        case 'FORMULA':
          if (req.formula) {
            quantity = this.formulaEngine.evaluate(req.formula);
          }
          break;
      }
      
      if (quantity > 0) {
        results.push({
          name: req.itemName,
          quantity: Math.ceil(quantity),
          unit: 'PCS',
          description: `${req.itemCategory}: ${req.itemName}`
        });
      }
    }
    
    return results;
  }
  
  // ===============================================
  // CALCULATE STEEL
  // ===============================================
  private calculateSteel(): MaterialRequirements['steel'] {
    const results: MaterialRequirements['steel'] = [];
    
    // Weight per meter for different sections (kg/m)
    const sectionWeights: Record<string, number> = {
      '20x20': 1.2,
      '25x25': 1.5,
      '30x30': 2.0,
      '25x40': 1.9,
      '20x40': 1.7
    };
    
    for (const req of this.windowDef.steelRequirements) {
      const length = this.formulaEngine.evaluate(req.formula);
      const weightPerMeter = sectionWeights[req.section] || 1.5;
      const weight = (length / 1000) * weightPerMeter;
      
      results.push({
        section: req.section,
        length: Math.round(length),
        quantity: 1,
        weight: Math.round(weight * 100) / 100,
        description: req.description
      });
    }
    
    return results;
  }
  
  // ===============================================
  // CALCULATE MESH
  // ===============================================
  private calculateMesh(): MaterialRequirements['mesh'] {
    if (!this.windowDef.meshCalculation) {
      return { width: 0, height: 0, area: 0 };
    }
    
    const width = this.formulaEngine.evaluate(this.windowDef.meshCalculation.widthFormula);
    const height = this.formulaEngine.evaluate(this.windowDef.meshCalculation.heightFormula);
    const area = (width * height) / 1000000;
    
    return {
      width: Math.round(width),
      height: Math.round(height),
      area: Math.round(area * 1000) / 1000
    };
  }
  
  // ===============================================
  // GET SUMMARY
  // ===============================================
  getSummary(): {
    totalProfileLength: number;
    totalGlassArea: number;
    totalSteelWeight: number;
    hardwareCount: number;
    meshArea: number;
  } {
    const materials = this.calculate();
    
    return {
      totalProfileLength: materials.profiles.reduce((sum, p) => sum + p.length * p.quantity, 0),
      totalGlassArea: materials.glass.reduce((sum, g) => sum + g.area, 0),
      totalSteelWeight: materials.steel.reduce((sum, s) => sum + s.weight * s.quantity, 0),
      hardwareCount: materials.hardware.reduce((sum, h) => sum + h.quantity, 0),
      meshArea: materials.mesh?.area || 0
    };
  }
}

// ===============================================
// FACTORY FUNCTION
// ===============================================
export function calculateMaterials(
  windowDef: WindowTypeDefinition,
  width: number,
  height: number
): MaterialRequirements {
  const calculator = new MaterialCalculator(windowDef, width, height);
  return calculator.calculate();
}

// ===============================================
// QUICK SUMMARY FUNCTION
// ===============================================
export function getMaterialSummary(
  windowDef: WindowTypeDefinition,
  width: number,
  height: number
): ReturnType<MaterialCalculator['getSummary']> {
  const calculator = new MaterialCalculator(windowDef, width, height);
  return calculator.getSummary();
}
