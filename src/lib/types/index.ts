// ==========================================
// KINGS OPTIMIZER - TYPE DEFINITIONS
// ==========================================

export interface Tenant {
  id: string;
  company_name: string;
  brand_name: string | null;
  phone: string | null;
  email: string;
  gst: string | null;
  address: string | null;
  footer_text: string | null;
  logo_url: string | null;
  theme_color: string;
  plan: 'TRIAL' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'PAST_DUE' | 'EXPIRED' | 'SUSPENDED';
  max_quotes: number;
  starts_at: string;
  ends_at: string;
  created_at: string;
}

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string | null;
  role: 'OWNER' | 'ADMIN' | 'USER' | 'VIEWER';
  is_active: boolean;
}

export interface Project {
  id: string;
  tenant_id: string;
  quote_no: string;
  site_name: string;
  customer_name: string | null;
  phone: string | null;
  address: string | null;
  brand: string;
  profit_pct: number;
  glass_option: string;
  glass_thickness: string;
  mesh_option: string;
  status: 'DRAFT' | 'QUOTED' | 'CONFIRMED' | 'PRODUCTION' | 'COMPLETED' | 'CANCELLED';
  total_sqft: number;
  total_amount: number;
  per_sqft: number;
  discount_pct: number;
  discount_flat: number;
  gst_pct: number;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Window {
  id: string;
  project_id: string;
  flat_no: string | null;
  sl_no: number;
  opening_type: string;
  width: number;
  height: number;
  sw: number | null;
  sh: number | null;
  mw: number | null;
  mh: number | null;
  qty: number;
  sqft: number;
  rate: number | null;
  amount: number | null;
  glass_type: string | null;
  mesh_type: string | null;
  remarks: string | null;
  sort_order: number;
}

export interface Profile {
  id: string;
  brand: string;
  window_type: string;
  family: string;
  code: string;
  profile_name: string | null;
  weight_per_meter: number;
  rate_per_kg: number;
  rate_per_meter: number;
  formula: string | null;
  multiplier: string | null;
}

export interface CuttingPiece {
  length: number;
  qty: number;
  window_id: string;
  flat: string;
  sl: number;
  profile_code: string;
  family: string;
}

export interface CuttingPattern {
  stock_length: number;
  profile_code: string;
  pieces: CuttingPiece[];
  waste_mm: number;
  waste_pct: number;
  total_used: number;
}

export interface OptimizerResult {
  engine: 'UPVC' | 'GLASS' | 'STEEL' | 'HARDWARE';
  patterns: CuttingPattern[];
  summary: {
    total_stock: number;
    total_pieces: number;
    total_waste_mm: number;
    total_waste_pct: number;
    total_cost: number;
  };
  by_profile: Record<string, {
    stock_count: number;
    total_length: number;
    cost: number;
  }>;
  computed_at: string;
}

export interface HardwareItem {
  item_name: string;
  sku: string | null;
  category: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface HardwareResult {
  items: HardwareItem[];
  by_category: Record<string, HardwareItem[]>;
  total_cost: number;
}