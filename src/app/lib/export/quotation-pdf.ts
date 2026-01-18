// ==========================================
// QUOTATION PDF GENERATOR
// Using jsPDF (client-side, no server needed)
// ==========================================

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Project, Window } from '../types'

// Company Info (should come from tenant settings)
const COMPANY = {
  name: 'KINGS WINDOWS AND DOORS',
  tagline: 'uPVC Windows & Doors',
  address: [
    'NO.50/8, THIMMARAYAPPA ESTATE,',
    'BOMMASANDRA INDL AREA HOSUR MAIN ROAD,',
    'BANGALORE 560099',
  ],
  phone: '9108823247',
  gst: '29ABAFK5051G1ZF',
  email: 'kingswindowsanddoors17@gmail.com',
}

const TERMS = [
  'All quoted rates are valid for 15 days from the date of quotation.',
  'Changes in sizes/specifications after confirmation will be subject to revised pricing.',
  'Civil work, MS grills and Paint Works should be done Before Installation.',
  'GST is extra as applicable at the time of billing.',
  'Delivery period will be confirmed after receipt of advance and site readiness.',
]

export async function generateQuotationPDF(
  project: Project,
  windows: Window[]
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15

  // Theme colors
  const DARK_BG = '#0a0f1f'
  const ACCENT = '#6f5bff'
  const TEXT = '#ffffff'
  const TEXT_SOFT = '#9ba3cc'

  // ==========================================
  // COVER PAGE
  // ==========================================

  // Background
  doc.setFillColor(DARK_BG)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // Company Logo/Header
  doc.setFontSize(28)
  doc.setTextColor(TEXT)
  doc.setFont('helvetica', 'bold')
  doc.text(COMPANY.name, pageWidth / 2, 40, { align: 'center' })

  doc.setFontSize(12)
  doc.setTextColor(TEXT_SOFT)
  doc.setFont('helvetica', 'normal')
  doc.text(COMPANY.tagline, pageWidth / 2, 50, { align: 'center' })

  // Decorative line
  doc.setDrawColor(ACCENT)
  doc.setLineWidth(1)
  doc.line(margin, 60, pageWidth - margin, 60)

  // Quote Info Box
  const boxY = 80
  doc.setFillColor('#111827')
  doc.roundedRect(margin, boxY, pageWidth - margin * 2, 60, 5, 5, 'F')

  doc.setFontSize(10)
  doc.setTextColor(TEXT_SOFT)
  doc.text('QUOTATION', margin + 10, boxY + 12)
  
  doc.setFontSize(20)
  doc.setTextColor(TEXT)
  doc.setFont('helvetica', 'bold')
  doc.text(project.quote_no, margin + 10, boxY + 28)

  doc.setFontSize(10)
  doc.setTextColor(TEXT_SOFT)
  doc.setFont('helvetica', 'normal')
  doc.text('DATE', margin + 10, boxY + 42)
  doc.setTextColor(TEXT)
  doc.text(new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }), margin + 10, boxY + 52)

  // Site Info
  doc.setTextColor(TEXT_SOFT)
  doc.text('SITE', pageWidth / 2, boxY + 12)
  doc.setFontSize(14)
  doc.setTextColor(TEXT)
  doc.setFont('helvetica', 'bold')
  doc.text(project.site_name, pageWidth / 2, boxY + 28)
  
  if (project.customer_name) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(project.customer_name, pageWidth / 2, boxY + 40)
  }

  // Summary Cards
  const summaryY = 160
  const cardWidth = (pageWidth - margin * 2 - 20) / 3

  // Total Amount Card
  doc.setFillColor('#1a1f2e')
  doc.roundedRect(margin, summaryY, cardWidth, 45, 3, 3, 'F')
  doc.setFontSize(10)
  doc.setTextColor(TEXT_SOFT)
  doc.text('TOTAL AMOUNT', margin + 8, summaryY + 15)
  doc.setFontSize(18)
  doc.setTextColor('#3be482')
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency(project.total_amount || 0), margin + 8, summaryY + 32)

  // Sqft Card
  doc.setFillColor('#1a1f2e')
  doc.roundedRect(margin + cardWidth + 10, summaryY, cardWidth, 45, 3, 3, 'F')
  doc.setFontSize(10)
  doc.setTextColor(TEXT_SOFT)
  doc.setFont('helvetica', 'normal')
  doc.text('TOTAL SQFT', margin + cardWidth + 18, summaryY + 15)
  doc.setFontSize(18)
  doc.setTextColor(TEXT)
  doc.setFont('helvetica', 'bold')
  doc.text(`${(project.total_sqft || 0).toFixed(2)}`, margin + cardWidth + 18, summaryY + 32)

  // Per Sqft Card
  doc.setFillColor('#1a1f2e')
  doc.roundedRect(margin + (cardWidth + 10) * 2, summaryY, cardWidth, 45, 3, 3, 'F')
  doc.setFontSize(10)
  doc.setTextColor(TEXT_SOFT)
  doc.setFont('helvetica', 'normal')
  doc.text('PER SQFT', margin + (cardWidth + 10) * 2 + 8, summaryY + 15)
  doc.setFontSize(18)
  doc.setTextColor(TEXT)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency(project.per_sqft || 0), margin + (cardWidth + 10) * 2 + 8, summaryY + 32)

  // Contact Info
  const contactY = 230
  doc.setFontSize(10)
  doc.setTextColor(TEXT_SOFT)
  doc.text('Contact Us', margin, contactY)
  doc.setTextColor(TEXT)
  doc.setFont('helvetica', 'normal')
  doc.text(COMPANY.address.join(', '), margin, contactY + 10)
  doc.text(`Phone: ${COMPANY.phone}  |  Email: ${COMPANY.email}`, margin, contactY + 20)
  doc.text(`GST: ${COMPANY.gst}`, margin, contactY + 30)

  // ==========================================
  // WINDOW LIST PAGE
  // ==========================================
  doc.addPage()

  // Background
  doc.setFillColor(DARK_BG)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // Header
  doc.setFontSize(16)
  doc.setTextColor(TEXT)
  doc.setFont('helvetica', 'bold')
  doc.text('WINDOW SCHEDULE', margin, 25)

  doc.setFontSize(10)
  doc.setTextColor(TEXT_SOFT)
  doc.setFont('helvetica', 'normal')
  doc.text(`${project.quote_no} · ${project.site_name}`, margin, 35)

  // Window Table
  const tableData = windows.map((w, i) => [
    (i + 1).toString(),
    w.flat_no || '-',
    w.opening_type,
    `${w.width}`,
    `${w.height}`,
    `${w.qty}`,
    (w.sqft || 0).toFixed(2),
    formatCurrency(w.amount || 0),
  ])

  autoTable(doc, {
    startY: 45,
    head: [['#', 'Flat', 'Type', 'Width', 'Height', 'Qty', 'Sqft', 'Amount']],
    body: tableData,
    theme: 'plain',
    styles: {
      fillColor: '#111827',
      textColor: TEXT,
      fontSize: 9,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: '#1e2538',
      textColor: TEXT_SOFT,
      fontSize: 8,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: '#0d1424',
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 20 },
      2: { cellWidth: 30 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 15 },
      6: { cellWidth: 20 },
      7: { cellWidth: 30 },
    },
    margin: { left: margin, right: margin },
  })

  // Totals row
  const finalY = (doc as any).lastAutoTable.finalY + 10
  doc.setFillColor('#1a1f2e')
  doc.roundedRect(margin, finalY, pageWidth - margin * 2, 20, 3, 3, 'F')
  
  doc.setFontSize(10)
  doc.setTextColor(TEXT_SOFT)
  doc.text('SUBTOTAL', margin + 8, finalY + 13)
  doc.setTextColor('#3be482')
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency(project.total_amount || 0), pageWidth - margin - 8, finalY + 13, { align: 'right' })

  // ==========================================
  // TERMS & CONDITIONS PAGE
  // ==========================================
  doc.addPage()

  // Background
  doc.setFillColor(DARK_BG)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // Header
  doc.setFontSize(16)
  doc.setTextColor(TEXT)
  doc.setFont('helvetica', 'bold')
  doc.text('TERMS & CONDITIONS', margin, 25)

  // Terms List
  let yPos = 45
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  TERMS.forEach((term, i) => {
    doc.setTextColor(ACCENT)
    doc.text(`${i + 1}.`, margin, yPos)
    doc.setTextColor(TEXT)
    
    // Word wrap
    const lines = doc.splitTextToSize(term, pageWidth - margin * 2 - 15)
    doc.text(lines, margin + 10, yPos)
    yPos += lines.length * 6 + 8
  })

  // Payment Info
  yPos += 20
  doc.setFillColor('#111827')
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 40, 5, 5, 'F')
  
  doc.setFontSize(11)
  doc.setTextColor(TEXT)
  doc.setFont('helvetica', 'bold')
  doc.text('PAYMENT TERMS', margin + 10, yPos + 15)
  
  doc.setFontSize(10)
  doc.setTextColor(TEXT_SOFT)
  doc.setFont('helvetica', 'normal')
  doc.text('50% advance with order confirmation', margin + 10, yPos + 28)
  doc.text('Balance payment before delivery/installation', margin + 10, yPos + 36)

  // Signature Section
  yPos += 60
  doc.setFontSize(10)
  doc.setTextColor(TEXT_SOFT)
  doc.text('For ' + COMPANY.name, margin, yPos)
  
  doc.setDrawColor('#333')
  doc.line(margin, yPos + 30, margin + 60, yPos + 30)
  doc.text('Authorized Signature', margin, yPos + 38)

  // Footer on all pages
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(TEXT_SOFT)
    doc.text(
      `Page ${i} of ${totalPages}  |  Generated on ${new Date().toLocaleString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  return doc
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}