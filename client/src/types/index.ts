export type Role = 'Admin' | 'Sales' | 'Warehouse' | 'Accounts';
export type CustomerType = 'Retail' | 'Wholesale' | 'Distributor';
export type CustomerStatus = 'Lead' | 'Active' | 'Inactive';
export type MovementType = 'IN' | 'OUT';
export type ChallanStatus = 'Draft' | 'Confirmed' | 'Cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  note: string;
  createdBy: string;
  createdAt: string;
  creator?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  customerNotes?: CustomerNote[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  quantityChanged: number;
  movementType: MovementType;
  reason: string;
  createdBy: string;
  createdAt: string;
  creator?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export interface ChallanItem {
  id?: string;
  challanId?: string;
  productId: string;
  snapshotProductName: string;
  snapshotSku: string;
  snapshotUnitPrice: number;
  quantity: number;
  product?: Product;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  totalQuantity: number;
  status: ChallanStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  items?: ChallanItem[];
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}
