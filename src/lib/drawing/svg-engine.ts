// ===============================================
// SVG DRAWING ENGINE - SPRINT 2
// ===============================================

import {
  WindowTypeDefinition,
  PanelDefinition,
  MullionDefinition,
  TransomDefinition,
  DrawingOptions,
  FormulaVariables
} from '../types/drawing';

// Default drawing options
export const defaultDrawingOptions: DrawingOptions = {
  showDimensions: true,
  showLabels: true,
  showHandles: true,
  showArrows: true,
  showMeshIndicator: true,
  showGlass: true,
  showFrame: true,
  scale: 1,
  frameColor: '#4A5568',
  sashColor: '#718096',
  glassColor: '#BEE3F8',
  meshColor: '#90CDF4',
  dimensionColor: '#2D3748',
  labelColor: '#1A202C'
};

// ===============================================
// WINDOW DRAWING ENGINE CLASS
// ===============================================
export class WindowDrawingEngine {
  private width: number;
  private height: number;
  private frameThickness: number;
  private options: DrawingOptions;
  private padding: number = 60; // Padding for dimensions
  
  constructor(
    width: number,
    height: number,
    frameThickness: number = 60,
    options: Partial<DrawingOptions> = {}
  ) {
    this.width = width;
    this.height = height;
    this.frameThickness = frameThickness;
    this.options = { ...defaultDrawingOptions, ...options };
  }
  
  // ===============================================
  // MAIN RENDER METHOD
  // ===============================================
  render(windowDef: WindowTypeDefinition): string {
    const viewBoxWidth = this.width + (this.padding * 2);
    const viewBoxHeight = this.height + (this.padding * 2);
    
    let svg = `<svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}"
      width="100%" 
      height="100%"
      style="max-width: 100%; max-height: 100%;"
    >`;
    
    // Add definitions (gradients, patterns)
    svg += this.renderDefs();
    
    // Background
    svg += `<rect x="0" y="0" width="${viewBoxWidth}" height="${viewBoxHeight}" fill="white"/>`;
    
    // Main group with padding offset
    svg += `<g transform="translate(${this.padding}, ${this.padding})">`;
    
    // Render frame
    if (this.options.showFrame) {
      svg += this.renderFrame();
    }
    
    // Render panels
    windowDef.drawing.panels.forEach(panel => {
      svg += this.renderPanel(panel);
    });
    
    // Render mullions
    windowDef.drawing.mullions.forEach(mullion => {
      svg += this.renderMullion(mullion);
    });
    
    // Render transoms
    windowDef.drawing.transoms.forEach(transom => {
      svg += this.renderTransom(transom);
    });
    
    svg += '</g>'; // Close main group
    
    // Render dimensions outside the main group
    if (this.options.showDimensions) {
      svg += this.renderDimensions();
    }
    
    svg += '</svg>';
    
    return svg;
  }
  
  // ===============================================
  // RENDER DEFINITIONS
  // ===============================================
  private renderDefs(): string {
    return `
      <defs>
        <!-- Glass gradient -->
        <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#E0F2FE;stop-opacity:0.8" />
          <stop offset="50%" style="stop-color:#BAE6FD;stop-opacity:0.6" />
          <stop offset="100%" style="stop-color:#7DD3FC;stop-opacity:0.8" />
        </linearGradient>
        
        <!-- Frame gradient -->
        <linearGradient id="frameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#F1F5F9" />
          <stop offset="50%" style="stop-color:#E2E8F0" />
          <stop offset="100%" style="stop-color:#CBD5E1" />
        </linearGradient>
        
        <!-- Mesh pattern -->
        <pattern id="meshPattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="${this.options.meshColor}" fill-opacity="0.3"/>
          <line x1="0" y1="0" x2="8" y2="0" stroke="#64748B" stroke-width="0.5" opacity="0.5"/>
          <line x1="0" y1="0" x2="0" y2="8" stroke="#64748B" stroke-width="0.5" opacity="0.5"/>
        </pattern>
        
        <!-- Drop shadow -->
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.2"/>
        </filter>
        
        <!-- Arrow marker -->
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="${this.options.dimensionColor}" />
        </marker>
        <marker id="arrowhead-start" markerWidth="10" markerHeight="7" refX="1" refY="3.5" orient="auto-start-reverse">
          <polygon points="10 0, 0 3.5, 10 7" fill="${this.options.dimensionColor}" />
        </marker>
      </defs>
    `;
  }
  
  // ===============================================
  // RENDER FRAME
  // ===============================================
  private renderFrame(): string {
    const ft = this.frameThickness;
    
    return `
      <g class="frame" filter="url(#dropShadow)">
        <!-- Outer frame -->
        <rect 
          x="0" y="0" 
          width="${this.width}" height="${this.height}" 
          fill="url(#frameGradient)" 
          stroke="${this.options.frameColor}" 
          stroke-width="2"
          rx="2"
        />
        <!-- Inner cutout -->
        <rect 
          x="${ft}" y="${ft}" 
          width="${this.width - ft * 2}" height="${this.height - ft * 2}" 
          fill="white"
          stroke="${this.options.frameColor}" 
          stroke-width="1"
        />
      </g>
    `;
  }
  
  // ===============================================
  // RENDER PANEL
  // ===============================================
  private renderPanel(panel: PanelDefinition): string {
    const ft = this.frameThickness;
    const innerWidth = this.width - ft * 2;
    const innerHeight = this.height - ft * 2;
    
    // Calculate panel position and size
    const x = ft + (panel.position.x / 100) * innerWidth;
    const y = ft + (panel.position.y / 100) * innerHeight;
    const w = (panel.position.width / 100) * innerWidth;
    const h = (panel.position.height / 100) * innerHeight;
    
    let svg = `<g class="panel" data-panel-id="${panel.id}">`;
    
    // Glass
    if (this.options.showGlass) {
      const glassMargin = 15;
      svg += `
        <rect 
          x="${x + glassMargin}" y="${y + glassMargin}" 
          width="${w - glassMargin * 2}" height="${h - glassMargin * 2}" 
          fill="url(#glassGradient)"
          stroke="#94A3B8"
          stroke-width="0.5"
        />
      `;
    }
    
    // Mesh indicator
    if (panel.hasMesh && this.options.showMeshIndicator) {
      const meshMargin = 20;
      svg += `
        <rect 
          x="${x + meshMargin}" y="${y + meshMargin}" 
          width="${w - meshMargin * 2}" height="${h - meshMargin * 2}" 
          fill="url(#meshPattern)"
          stroke="none"
        />
      `;
    }
    
    // Sash frame for movable panels
    if (panel.type !== 'FIXED') {
      const sashThickness = 8;
      svg += `
        <rect 
          x="${x + 5}" y="${y + 5}" 
          width="${w - 10}" height="${h - 10}" 
          fill="none"
          stroke="${this.options.sashColor}"
          stroke-width="${sashThickness}"
          rx="1"
        />
      `;
    }
    
    // Opening direction arrow
    if (this.options.showArrows && panel.type === 'SLIDING' && panel.openDirection) {
      svg += this.renderSlidingArrow(x, y, w, h, panel.openDirection);
    }
    
    // Casement opening indicator
    if (this.options.showArrows && panel.type === 'CASEMENT') {
      svg += this.renderCasementIndicator(x, y, w, h, panel.openDirection, panel.handlePosition);
    }
    
    // Handle
    if (this.options.showHandles && panel.hasHandle && panel.handlePosition) {
      svg += this.renderHandle(x, y, w, h, panel.handlePosition, panel.type);
    }
    
    // Label
    if (this.options.showLabels && panel.label) {
      svg += `
        <text 
          x="${x + w / 2}" y="${y + h / 2}" 
          text-anchor="middle" 
          dominant-baseline="middle"
          font-family="Arial, sans-serif"
          font-size="16"
          font-weight="bold"
          fill="${this.options.labelColor}"
          opacity="0.7"
        >${panel.label}</text>
      `;
    }
    
    svg += '</g>';
    return svg;
  }
  
  // ===============================================
  // RENDER SLIDING ARROW
  // ===============================================
  private renderSlidingArrow(x: number, y: number, w: number, h: number, direction: string): string {
    const centerY = y + h / 2;
    const arrowLength = Math.min(w * 0.4, 60);
    const centerX = x + w / 2;
    
    let arrowPath = '';
    
    if (direction === 'LEFT') {
      const startX = centerX + arrowLength / 2;
      const endX = centerX - arrowLength / 2;
      arrowPath = `
        <line 
          x1="${startX}" y1="${centerY}" 
          x2="${endX}" y2="${centerY}" 
          stroke="#475569" 
          stroke-width="2"
          marker-end="url(#arrowhead-start)"
        />
      `;
    } else if (direction === 'RIGHT') {
      const startX = centerX - arrowLength / 2;
      const endX = centerX + arrowLength / 2;
      arrowPath = `
        <line 
          x1="${startX}" y1="${centerY}" 
          x2="${endX}" y2="${centerY}" 
          stroke="#475569" 
          stroke-width="2"
          marker-end="url(#arrowhead)"
        />
      `;
    }
    
    return arrowPath;
  }
  
  // ===============================================
  // RENDER CASEMENT INDICATOR
  // ===============================================
  private renderCasementIndicator(
    x: number, y: number, w: number, h: number, 
    direction?: string, handlePos?: string
  ): string {
    // Draw triangle to show opening direction
    const margin = 20;
    let trianglePath = '';
    
    if (handlePos === 'LEFT') {
      // Opens from right (hinge on left)
      trianglePath = `
        <path 
          d="M ${x + margin} ${y + margin} L ${x + w - margin} ${y + h / 2} L ${x + margin} ${y + h - margin} Z"
          fill="none"
          stroke="#475569"
          stroke-width="1"
          stroke-dasharray="4,2"
          opacity="0.5"
        />
      `;
    } else if (handlePos === 'RIGHT') {
      // Opens from left (hinge on right)
      trianglePath = `
        <path 
          d="M ${x + w - margin} ${y + margin} L ${x + margin} ${y + h / 2} L ${x + w - margin} ${y + h - margin} Z"
          fill="none"
          stroke="#475569"
          stroke-width="1"
          stroke-dasharray="4,2"
          opacity="0.5"
        />
      `;
    }
    
    return trianglePath;
  }
  
  // ===============================================
  // RENDER HANDLE
  // ===============================================
  private renderHandle(
    x: number, y: number, w: number, h: number, 
    position: string, panelType: string
  ): string {
    let handleX = x + w / 2;
    let handleY = y + h / 2;
    
    // Position handle based on panel type and position
    if (panelType === 'SLIDING') {
      // Sliding handles are typically in the middle vertically
      if (position === 'LEFT') {
        handleX = x + 25;
      } else if (position === 'RIGHT') {
        handleX = x + w - 25;
      }
    } else if (panelType === 'CASEMENT') {
      // Casement handles are opposite to hinge
      if (position === 'LEFT') {
        handleX = x + 20;
      } else if (position === 'RIGHT') {
        handleX = x + w - 20;
      }
    }
    
    return `
      <g class="handle" transform="translate(${handleX}, ${handleY})">
        <!-- Handle base -->
        <rect x="-6" y="-20" width="12" height="40" rx="2" fill="#64748B" stroke="#475569" stroke-width="1"/>
        <!-- Handle grip -->
        <rect x="-4" y="-15" width="8" height="8" rx="1" fill="#94A3B8"/>
        <rect x="-4" y="7" width="8" height="8" rx="1" fill="#94A3B8"/>
      </g>
    `;
  }
  
  // ===============================================
  // RENDER MULLION
  // ===============================================
  private renderMullion(mullion: MullionDefinition): string {
    const ft = this.frameThickness;
    const innerWidth = this.width - ft * 2;
    const innerHeight = this.height - ft * 2;
    
    const x = ft + (mullion.position / 100) * innerWidth;
    const startY = ft + (mullion.startY / 100) * innerHeight;
    const endY = ft + (mullion.endY / 100) * innerHeight;
    const thickness = mullion.thickness || 40;
    
    return `
      <g class="mullion" data-mullion-id="${mullion.id}">
        <rect 
          x="${x - thickness / 2}" y="${startY}" 
          width="${thickness}" height="${endY - startY}" 
          fill="url(#frameGradient)"
          stroke="${this.options.frameColor}"
          stroke-width="1"
        />
      </g>
    `;
  }
  
  // ===============================================
  // RENDER TRANSOM
  // ===============================================
  private renderTransom(transom: TransomDefinition): string {
    const ft = this.frameThickness;
    const innerWidth = this.width - ft * 2;
    const innerHeight = this.height - ft * 2;
    
    const y = ft + (transom.position / 100) * innerHeight;
    const startX = ft + (transom.startX / 100) * innerWidth;
    const endX = ft + (transom.endX / 100) * innerWidth;
    const thickness = transom.thickness || 40;
    
    return `
      <g class="transom" data-transom-id="${transom.id}">
        <rect 
          x="${startX}" y="${y - thickness / 2}" 
          width="${endX - startX}" height="${thickness}" 
          fill="url(#frameGradient)"
          stroke="${this.options.frameColor}"
          stroke-width="1"
        />
      </g>
    `;
  }
  
  // ===============================================
  // RENDER DIMENSIONS
  // ===============================================
  private renderDimensions(): string {
    const p = this.padding;
    
    // Format dimension text
    const formatDim = (mm: number) => {
      if (mm >= 1000) {
        return `${(mm / 1000).toFixed(2)}m`;
      }
      return `${mm}mm`;
    };
    
    return `
      <g class="dimensions">
        <!-- Width dimension (top) -->
        <g transform="translate(${p}, ${p - 25})">
          <line x1="0" y1="15" x2="0" y2="25" stroke="${this.options.dimensionColor}" stroke-width="1"/>
          <line x1="${this.width}" y1="15" x2="${this.width}" y2="25" stroke="${this.options.dimensionColor}" stroke-width="1"/>
          <line x1="0" y1="20" x2="${this.width}" y2="20" stroke="${this.options.dimensionColor}" stroke-width="1" 
            marker-start="url(#arrowhead-start)" marker-end="url(#arrowhead)"/>
          <text x="${this.width / 2}" y="10" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${this.options.dimensionColor}">
            ${formatDim(this.width)}
          </text>
        </g>
        
        <!-- Height dimension (right) -->
        <g transform="translate(${p + this.width + 25}, ${p})">
          <line x1="-15" y1="0" x2="-5" y2="0" stroke="${this.options.dimensionColor}" stroke-width="1"/>
          <line x1="-15" y1="${this.height}" x2="-5" y2="${this.height}" stroke="${this.options.dimensionColor}" stroke-width="1"/>
          <line x1="-10" y1="0" x2="-10" y2="${this.height}" stroke="${this.options.dimensionColor}" stroke-width="1"
            marker-start="url(#arrowhead-start)" marker-end="url(#arrowhead)"/>
          <text x="5" y="${this.height / 2}" text-anchor="start" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${this.options.dimensionColor}" transform="rotate(90, 5, ${this.height / 2})">
            ${formatDim(this.height)}
          </text>
        </g>
      </g>
    `;
  }
  
  // ===============================================
  // UTILITY METHODS
  // ===============================================
  setDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }
  
  setOptions(options: Partial<DrawingOptions>): void {
    this.options = { ...this.options, ...options };
  }
  
  // Generate thumbnail (smaller, simpler version)
  renderThumbnail(windowDef: WindowTypeDefinition, size: number = 100): string {
    const originalOptions = { ...this.options };
    const scale = size / Math.max(this.width, this.height);
    
    this.options = {
      ...this.options,
      showDimensions: false,
      showLabels: false,
      showHandles: false,
      scale
    };
    
    const thumbWidth = this.width * scale;
    const thumbHeight = this.height * scale;
    
    let svg = `<svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 ${thumbWidth + 10} ${thumbHeight + 10}"
      width="${size}" 
      height="${size}"
    >`;
    
    svg += this.renderDefs();
    svg += `<g transform="translate(5, 5) scale(${scale})">`;
    
    if (this.options.showFrame) {
      svg += this.renderFrame();
    }
    
    windowDef.drawing.panels.forEach(panel => {
      svg += this.renderPanel(panel);
    });
    
    windowDef.drawing.mullions.forEach(mullion => {
      svg += this.renderMullion(mullion);
    });
    
    windowDef.drawing.transoms.forEach(transom => {
      svg += this.renderTransom(transom);
    });
    
    svg += '</g></svg>';
    
    this.options = originalOptions;
    
    return svg;
  }
}

// ===============================================
// EXPORT FACTORY FUNCTION
// ===============================================
export function createWindowDrawing(
  width: number,
  height: number,
  windowDef: WindowTypeDefinition,
  options?: Partial<DrawingOptions>
): string {
  const engine = new WindowDrawingEngine(
    width,
    height,
    windowDef.drawing.frameThickness,
    options
  );
  return engine.render(windowDef);
}
