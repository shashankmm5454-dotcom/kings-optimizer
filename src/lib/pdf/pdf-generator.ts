// ===============================================
// PDF GENERATION UTILITIES - SPRINT 2
// ===============================================

/**
 * NOTE: This module provides PDF generation interfaces.
 * In production, you would use @react-pdf/renderer or similar.
 * For now, this provides the structure and can generate HTML-based PDFs.
 */

import { WindowTypeDefinition, MaterialRequirements } from '../types/drawing';

// ===============================================
// PDF INTERFACES
// ===============================================

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  gst?: string;
  website?: string;
}

export interface QuoteWindow {
  sl: number;
  location: string;
  typeCode: string;
  typeName: string;
  width: number;
  height: number;
  qty: number;
  sqft: number;
  rate: number;
  amount: number;
  drawing?: string; // SVG string
}

export interface QuotePricing {
  subtotal: number;
  discount: number;
  discountAmount: number;
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  perSqft: number;
}

export interface QuotationData {
  quoteNo: string;
  date: string;
  validUntil: string;
  
  // Client
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail?: string;
  projectName?: string;
  
  // Company
  company: CompanyInfo;
  
  // Items
  windows: QuoteWindow[];
  
  // Pricing
  pricing: QuotePricing;
  
  // Options
  brand: string;
  glassType: string;
  glassThickness: string;
  color: string;
  
  // Terms
  terms: string[];
  notes?: string;
}

export interface CuttingListData {
  quoteNo: string;
  date: string;
  clientName: string;
  type: 'PROFILE' | 'GLASS' | 'STEEL';
  
  items: {
    sl: number;
    windowRef: string;
    description: string;
    size: string;
    qty: number;
    stockLength?: number;
    cuts?: number;
    waste?: number;
  }[];
  
  summary: {
    totalItems: number;
    totalLength?: number;
    totalArea?: number;
    totalWeight?: number;
    wastePercentage?: number;
  };
}

// ===============================================
// HTML TEMPLATE GENERATORS
// ===============================================

export function generateQuotationHTML(data: QuotationData): string {
  const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Quotation - ${data.quoteNo}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      font-size: 11px; 
      line-height: 1.4;
      color: #333;
    }
    .page { 
      width: 210mm; 
      min-height: 297mm; 
      padding: 15mm; 
      margin: 0 auto;
      background: white;
    }
    
    /* Header */
    .header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .company-name { 
      font-size: 24px; 
      font-weight: bold; 
      color: #1e40af;
    }
    .company-details { 
      font-size: 10px; 
      color: #666;
      margin-top: 5px;
    }
    .quote-info { 
      text-align: right; 
    }
    .quote-number { 
      font-size: 18px; 
      font-weight: bold; 
      color: #1e40af;
    }
    
    /* Client Section */
    .section { 
      margin-bottom: 20px; 
    }
    .section-title { 
      font-weight: bold; 
      color: #1e40af; 
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 5px;
      margin-bottom: 10px;
    }
    .info-grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 20px; 
    }
    .info-row { 
      display: flex; 
      margin-bottom: 5px; 
    }
    .info-label { 
      width: 100px; 
      color: #666; 
    }
    .info-value { 
      font-weight: 500; 
    }
    
    /* Table */
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-bottom: 20px;
    }
    th { 
      background: #1e40af; 
      color: white; 
      padding: 10px 8px; 
      text-align: left;
      font-weight: 500;
    }
    td { 
      padding: 8px; 
      border-bottom: 1px solid #e5e7eb; 
    }
    tr:hover td { 
      background: #f8fafc; 
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    
    /* Pricing Summary */
    .pricing-table { 
      width: 300px; 
      margin-left: auto; 
    }
    .pricing-table td { 
      padding: 5px 10px; 
    }
    .pricing-total { 
      font-size: 14px; 
      font-weight: bold; 
      background: #dbeafe; 
    }
    
    /* Terms */
    .terms { 
      background: #f8fafc; 
      padding: 15px; 
      border-radius: 5px;
      margin-top: 20px;
    }
    .terms-title { 
      font-weight: bold; 
      margin-bottom: 10px;
      color: #1e40af;
    }
    .terms ol { 
      margin-left: 20px; 
    }
    .terms li { 
      margin-bottom: 5px; 
    }
    
    /* Footer */
    .footer { 
      margin-top: 30px; 
      display: flex; 
      justify-content: space-between;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .signature { 
      text-align: center; 
      width: 200px;
    }
    .signature-line { 
      border-top: 1px solid #333; 
      margin-top: 50px;
      padding-top: 5px;
    }
    
    /* Drawing thumbnail */
    .window-drawing {
      width: 60px;
      height: 50px;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }
    
    @media print {
      .page { 
        margin: 0; 
        padding: 10mm;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="company-name">${data.company.name}</div>
        <div class="company-details">
          ${data.company.address}<br>
          Phone: ${data.company.phone} | Email: ${data.company.email}
          ${data.company.gst ? `<br>GST: ${data.company.gst}` : ''}
        </div>
      </div>
      <div class="quote-info">
        <div class="quote-number">QUOTATION</div>
        <div style="margin-top: 5px;">
          <strong>Quote No:</strong> ${data.quoteNo}<br>
          <strong>Date:</strong> ${data.date}<br>
          <strong>Valid Until:</strong> ${data.validUntil}
        </div>
      </div>
    </div>
    
    <!-- Client & Project Info -->
    <div class="section">
      <div class="info-grid">
        <div>
          <div class="section-title">Bill To</div>
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">${data.clientName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Address:</span>
            <span class="info-value">${data.clientAddress}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone:</span>
            <span class="info-value">${data.clientPhone}</span>
          </div>
          ${data.clientEmail ? `
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">${data.clientEmail}</span>
          </div>` : ''}
        </div>
        <div>
          <div class="section-title">Project Details</div>
          <div class="info-row">
            <span class="info-label">Project:</span>
            <span class="info-value">${data.projectName || data.clientName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Brand:</span>
            <span class="info-value">${data.brand}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Glass:</span>
            <span class="info-value">${data.glassType} ${data.glassThickness}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Color:</span>
            <span class="info-value">${data.color}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Items Table -->
    <div class="section">
      <div class="section-title">Window Schedule</div>
      <table>
        <thead>
          <tr>
            <th style="width: 30px;">SL</th>
            <th>Location</th>
            <th>Type</th>
            <th class="text-center">Size (mm)</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Sqft</th>
            <th class="text-right">Rate</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${data.windows.map(w => `
          <tr>
            <td>${w.sl}</td>
            <td>${w.location}</td>
            <td>${w.typeCode} - ${w.typeName}</td>
            <td class="text-center">${w.width} × ${w.height}</td>
            <td class="text-center">${w.qty}</td>
            <td class="text-right">${w.sqft.toFixed(2)}</td>
            <td class="text-right">${formatCurrency(w.rate)}</td>
            <td class="text-right">${formatCurrency(w.amount)}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <!-- Pricing Summary -->
    <table class="pricing-table">
      <tr>
        <td>Subtotal:</td>
        <td class="text-right">${formatCurrency(data.pricing.subtotal)}</td>
      </tr>
      ${data.pricing.discount > 0 ? `
      <tr>
        <td>Discount (${data.pricing.discount}%):</td>
        <td class="text-right">- ${formatCurrency(data.pricing.discountAmount)}</td>
      </tr>
      ` : ''}
      <tr>
        <td>Taxable Amount:</td>
        <td class="text-right">${formatCurrency(data.pricing.taxableAmount)}</td>
      </tr>
      <tr>
        <td>GST (${data.pricing.gstRate}%):</td>
        <td class="text-right">${formatCurrency(data.pricing.gstAmount)}</td>
      </tr>
      <tr class="pricing-total">
        <td><strong>Total:</strong></td>
        <td class="text-right"><strong>${formatCurrency(data.pricing.total)}</strong></td>
      </tr>
      <tr>
        <td colspan="2" class="text-right" style="font-size: 10px; color: #666;">
          Rate: ${formatCurrency(data.pricing.perSqft)}/sqft
        </td>
      </tr>
    </table>
    
    <!-- Terms & Conditions -->
    <div class="terms">
      <div class="terms-title">Terms & Conditions</div>
      <ol>
        ${data.terms.map(term => `<li>${term}</li>`).join('')}
      </ol>
      ${data.notes ? `<p style="margin-top: 10px;"><strong>Note:</strong> ${data.notes}</p>` : ''}
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="signature">
        <div class="signature-line">Customer Signature</div>
      </div>
      <div class="signature">
        <div class="signature-line">For ${data.company.name}</div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateCuttingListHTML(data: CuttingListData): string {
  const typeLabels = {
    PROFILE: 'Profile Cutting List',
    GLASS: 'Glass Cutting List',
    STEEL: 'Steel Cutting List'
  };
  
  const unitLabels = {
    PROFILE: 'mm',
    GLASS: 'mm × mm',
    STEEL: 'mm'
  };
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${typeLabels[data.type]} - ${data.quoteNo}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Consolas', 'Monaco', monospace; 
      font-size: 11px; 
      line-height: 1.4;
    }
    .page { 
      width: 210mm; 
      min-height: 297mm; 
      padding: 10mm; 
      margin: 0 auto;
      background: white;
    }
    
    .header { 
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
    }
    .title { 
      font-size: 18px; 
      font-weight: bold; 
    }
    .subtitle { 
      font-size: 12px; 
      color: #666; 
    }
    
    .info-bar {
      background: #f3f4f6;
      padding: 8px 12px;
      margin-bottom: 15px;
      display: flex;
      gap: 30px;
    }
    .info-item {
      display: flex;
      gap: 8px;
    }
    .info-label { color: #666; }
    .info-value { font-weight: bold; }
    
    table { 
      width: 100%; 
      border-collapse: collapse; 
    }
    th { 
      background: #1f2937; 
      color: white; 
      padding: 8px; 
      text-align: left;
      font-weight: normal;
    }
    td { 
      padding: 6px 8px; 
      border-bottom: 1px solid #e5e7eb; 
    }
    tr:nth-child(even) { background: #f9fafb; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    
    .summary {
      margin-top: 20px;
      background: #dbeafe;
      padding: 15px;
      border-radius: 5px;
    }
    .summary-title {
      font-weight: bold;
      margin-bottom: 10px;
      color: #1e40af;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    .summary-item {
      text-align: center;
    }
    .summary-value {
      font-size: 18px;
      font-weight: bold;
      color: #1e40af;
    }
    .summary-label {
      font-size: 10px;
      color: #666;
    }
    
    @media print {
      .page { margin: 0; padding: 5mm; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <div class="title">${typeLabels[data.type]}</div>
        <div class="subtitle">Generated for production</div>
      </div>
      <div style="text-align: right;">
        <div><strong>Quote:</strong> ${data.quoteNo}</div>
        <div><strong>Date:</strong> ${data.date}</div>
      </div>
    </div>
    
    <div class="info-bar">
      <div class="info-item">
        <span class="info-label">Client:</span>
        <span class="info-value">${data.clientName}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Total Items:</span>
        <span class="info-value">${data.summary.totalItems}</span>
      </div>
      ${data.summary.totalLength ? `
      <div class="info-item">
        <span class="info-label">Total Length:</span>
        <span class="info-value">${(data.summary.totalLength / 1000).toFixed(2)} m</span>
      </div>` : ''}
      ${data.summary.wastePercentage !== undefined ? `
      <div class="info-item">
        <span class="info-label">Waste:</span>
        <span class="info-value">${data.summary.wastePercentage.toFixed(1)}%</span>
      </div>` : ''}
    </div>
    
    <table>
      <thead>
        <tr>
          <th style="width: 40px;">SL</th>
          <th>Window Ref</th>
          <th>Description</th>
          <th class="text-center">Size (${unitLabels[data.type]})</th>
          <th class="text-center">Qty</th>
          ${data.type === 'PROFILE' ? `
          <th class="text-center">Stock (mm)</th>
          <th class="text-center">Cuts</th>
          <th class="text-right">Waste</th>
          ` : ''}
        </tr>
      </thead>
      <tbody>
        ${data.items.map(item => `
        <tr>
          <td>${item.sl}</td>
          <td>${item.windowRef}</td>
          <td>${item.description}</td>
          <td class="text-center">${item.size}</td>
          <td class="text-center">${item.qty}</td>
          ${data.type === 'PROFILE' ? `
          <td class="text-center">${item.stockLength || '-'}</td>
          <td class="text-center">${item.cuts || '-'}</td>
          <td class="text-right">${item.waste ? item.waste + ' mm' : '-'}</td>
          ` : ''}
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="summary">
      <div class="summary-title">Summary</div>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-value">${data.summary.totalItems}</div>
          <div class="summary-label">Total Items</div>
        </div>
        ${data.summary.totalLength ? `
        <div class="summary-item">
          <div class="summary-value">${(data.summary.totalLength / 1000).toFixed(2)}</div>
          <div class="summary-label">Total Length (m)</div>
        </div>` : ''}
        ${data.summary.totalArea ? `
        <div class="summary-item">
          <div class="summary-value">${data.summary.totalArea.toFixed(2)}</div>
          <div class="summary-label">Total Area (sqm)</div>
        </div>` : ''}
        ${data.summary.totalWeight ? `
        <div class="summary-item">
          <div class="summary-value">${data.summary.totalWeight.toFixed(2)}</div>
          <div class="summary-label">Total Weight (kg)</div>
        </div>` : ''}
        ${data.summary.wastePercentage !== undefined ? `
        <div class="summary-item">
          <div class="summary-value">${data.summary.wastePercentage.toFixed(1)}%</div>
          <div class="summary-label">Waste Percentage</div>
        </div>` : ''}
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ===============================================
// PDF GENERATION (Browser-based)
// ===============================================

export async function generatePDFFromHTML(html: string, filename: string): Promise<Blob> {
  // In a browser environment, we can use window.print() or a library like html2pdf.js
  // For now, we'll return the HTML as a blob that can be printed
  
  const blob = new Blob([html], { type: 'text/html' });
  return blob;
}

export function downloadPDF(html: string, filename: string): void {
  // Create a new window with the HTML content for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

export function downloadHTML(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
