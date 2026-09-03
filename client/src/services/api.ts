import type {
  Customer,
  CustomerNote,
  Product,
  StockMovement,
  SalesChallan,
  User,
  Pagination,
} from '../types';

// Vite proxies this path during local development. In production, set
// VITE_API_BASE_URL to the public URL of the deployed backend.
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Prisma serializes Decimal columns as strings in JSON responses. Keep the
// browser model consistent so price formatting and calculations are safe.
const normalizeProduct = (product: Product): Product => ({
  ...product,
  unitPrice: Number(product.unitPrice) || 0,
});

const getAuthHeaders = () => {
  const token = localStorage.getItem('erp_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Initial Mock Datasets for offline fallback
let mockUsers: User[] = [
  { id: 'usr-1', name: 'Alice Administrator', email: 'admin@minierp.com', role: 'Admin' },
  { id: 'usr-2', name: 'Sam Salesman', email: 'sales@minierp.com', role: 'Sales' },
  { id: 'usr-3', name: 'Wanda Warehouse', email: 'warehouse@minierp.com', role: 'Warehouse' },
  { id: 'usr-4', name: 'Arthur Accountant', email: 'accounts@minierp.com', role: 'Accounts' },
];

let mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Rajesh Kumar',
    mobile: '+91-9876543210',
    email: 'rajesh@apexindustrial.com',
    businessName: 'Apex Industrial Solutions Ltd',
    gstNumber: '27AAACA123411Z5',
    customerType: 'Wholesale',
    address: '102 Industrial Estate, Sector 5, Mumbai, MH',
    status: 'Active',
    followUpDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    notes: 'Key client for quarterly bulk tool orders. Payment term: Net 30.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customerNotes: [
      {
        id: 'cn-1',
        customerId: 'cust-1',
        note: 'Contract signed for FY 2026-27.',
        createdBy: 'usr-2',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        creator: { id: 'usr-2', name: 'Sam Salesman', email: 'sales@minierp.com', role: 'Sales' },
      },
    ],
  },
  {
    id: 'cust-2',
    name: 'Ananya Sharma',
    mobile: '+91-9123456789',
    email: 'ananya@techtraders.in',
    businessName: 'Tech Traders India Pvt Ltd',
    gstNumber: '07BCCCB567822Z9',
    customerType: 'Distributor',
    address: '45 Commercial Complex, Connaught Place, New Delhi',
    status: 'Active',
    followUpDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    notes: 'Regional distributor interested in safety equipment line.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customerNotes: [],
  },
  {
    id: 'cust-3',
    name: 'Vikram Patel',
    mobile: '+91-9988776655',
    email: 'vikram@patelhardware.com',
    businessName: 'Patel Hardware Store',
    gstNumber: null,
    customerType: 'Retail',
    address: '12 Station Road, Ahmedabad, GJ',
    status: 'Lead',
    followUpDate: new Date().toISOString(),
    notes: 'Inquired about pneumatic control valve samples.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customerNotes: [],
  },
];

let mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Heavy Duty Industrial Drill 800W',
    sku: 'SKU-TOOL-001',
    category: 'Power Tools',
    unitPrice: 149.99,
    currentStock: 50,
    minStockAlert: 10,
    location: 'Rack A-12',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Stainless Steel Fastener Pack M8',
    sku: 'SKU-HDW-002',
    category: 'Hardware',
    unitPrice: 24.5,
    currentStock: 200,
    minStockAlert: 30,
    location: 'Bin B-04',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Safety Goggles & Shield Combo',
    sku: 'SKU-SAF-003',
    category: 'Safety Equipment',
    unitPrice: 19.99,
    currentStock: 15,
    minStockAlert: 20, // Low stock trigger
    location: 'Shelf S-01',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    name: 'Pneumatic Control Valve 1/2-Inch',
    sku: 'SKU-HYD-004',
    category: 'Hydraulics & Valves',
    unitPrice: 89.0,
    currentStock: 8,
    minStockAlert: 10, // Low stock trigger
    location: 'Rack C-05',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    name: 'Heavy Duty Nitrile Work Gloves',
    sku: 'SKU-SAF-005',
    category: 'Safety Equipment',
    unitPrice: 12.75,
    currentStock: 120,
    minStockAlert: 25,
    location: 'Bin B-08',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let mockStockMovements: StockMovement[] = [
  {
    id: 'sm-1',
    productId: 'prod-1',
    quantityChanged: 50,
    movementType: 'IN',
    reason: 'Initial PO Stock Receive from Supplier Alpha',
    createdBy: 'usr-3',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    creator: { id: 'usr-3', name: 'Wanda Warehouse', email: 'warehouse@minierp.com', role: 'Warehouse' },
  },
  {
    id: 'sm-2',
    productId: 'prod-3',
    quantityChanged: 5,
    movementType: 'OUT',
    reason: 'Internal usage & safety demo kits',
    createdBy: 'usr-3',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    creator: { id: 'usr-3', name: 'Wanda Warehouse', email: 'warehouse@minierp.com', role: 'Warehouse' },
  },
];

let mockChallans: SalesChallan[] = [
  {
    id: 'ch-1',
    challanNumber: 'CH-20260901-0001',
    customerId: 'cust-1',
    totalQuantity: 12,
    status: 'Confirmed',
    createdById: 'usr-2',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    customer: mockCustomers[0],
    createdBy: { id: 'usr-2', name: 'Sam Salesman', email: 'sales@minierp.com', role: 'Sales' },
    items: [
      {
        productId: 'prod-1',
        snapshotProductName: 'Heavy Duty Industrial Drill 800W',
        snapshotSku: 'SKU-TOOL-001',
        snapshotUnitPrice: 149.99,
        quantity: 2,
      },
      {
        productId: 'prod-2',
        snapshotProductName: 'Stainless Steel Fastener Pack M8',
        snapshotSku: 'SKU-HDW-002',
        snapshotUnitPrice: 24.5,
        quantity: 10,
      },
    ],
  },
];

// API Service Methods
export const api = {
  // Authentication
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return data.data;
      }
    } catch {
      console.warn('Backend server offline. Using fallback authentication mode.');
    }

    // Fallback Mock Login
    const matchedUser = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || {
      id: 'usr-demo',
      name: email.split('@')[0].toUpperCase(),
      email,
      role: 'Admin' as const,
    };

    return {
      token: `demo-token-${Date.now()}`,
      user: matchedUser,
    };
  },

  // Customer Management
  getCustomers: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', String(params.page));
      if (params?.limit) query.append('limit', String(params.limit));
      if (params?.search) query.append('search', params.search);
      if (params?.status) query.append('status', params.status);

      const res = await fetch(`${API_BASE}/customers?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { data: data.data as Customer[], pagination: data.pagination as Pagination };
      }
    } catch {
      // Fallback
    }

    let filtered = [...mockCustomers];
    if (params?.status) {
      filtered = filtered.filter((c) => c.status === params.status);
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.businessName.toLowerCase().includes(s) ||
          c.mobile.includes(s)
      );
    }

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const totalCount = filtered.length;

    return {
      data: filtered.slice((page - 1) * limit, page * limit),
      pagination: { page, limit, totalCount, totalPages: Math.ceil(totalCount / limit) },
    };
  },

  getCustomerById: async (id: string): Promise<Customer> => {
    try {
      const res = await fetch(`${API_BASE}/customers/${id}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok && data.success) return data.data;
    } catch {
      // Fallback
    }
    const customer = mockCustomers.find((c) => c.id === id);
    if (!customer) throw new Error('Customer not found');
    return customer;
  },

  createCustomer: async (customerData: Partial<Customer>): Promise<Customer> => {
    try {
      const res = await fetch(`${API_BASE}/customers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(customerData),
      });
      const data = await res.json();
      if (res.ok && data.success) return data.data;
    } catch {
      // Fallback
    }

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: customerData.name || 'New Customer',
      mobile: customerData.mobile || '',
      email: customerData.email || '',
      businessName: customerData.businessName || '',
      gstNumber: customerData.gstNumber || null,
      customerType: customerData.customerType || 'Retail',
      address: customerData.address || '',
      status: customerData.status || 'Lead',
      followUpDate: customerData.followUpDate || null,
      notes: customerData.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerNotes: [],
    };
    mockCustomers.unshift(newCustomer);
    return newCustomer;
  },

  updateCustomer: async (id: string, updates: Partial<Customer>): Promise<Customer> => {
    try {
      const res = await fetch(`${API_BASE}/customers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok && data.success) return data.data;
    } catch {
      // Fallback
    }

    const index = mockCustomers.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Customer not found');
    mockCustomers[index] = { ...mockCustomers[index], ...updates, updatedAt: new Date().toISOString() };
    return mockCustomers[index];
  },

  addCustomerNote: async (customerId: string, note: string): Promise<CustomerNote> => {
    try {
      const res = await fetch(`${API_BASE}/customers/${customerId}/notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ note }),
      });
      const data = await res.json();
      if (res.ok && data.success) return data.data;
    } catch {
      // Fallback
    }

    const userRaw = localStorage.getItem('erp_user');
    const currentUser: User = userRaw ? JSON.parse(userRaw) : { id: 'usr-1', name: 'Demo User', email: 'demo@minierp.com', role: 'Sales' };

    const newNote: CustomerNote = {
      id: `cn-${Date.now()}`,
      customerId,
      note,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      creator: { id: currentUser.id, name: currentUser.name, email: currentUser.email, role: currentUser.role },
    };

    const targetCustomer = mockCustomers.find((c) => c.id === customerId);
    if (targetCustomer) {
      if (!targetCustomer.customerNotes) targetCustomer.customerNotes = [];
      targetCustomer.customerNotes.unshift(newNote);
    }
    return newNote;
  },

  // Product & Inventory Management
  getProducts: async (params?: { page?: number; limit?: number; search?: string; lowStockOnly?: boolean }) => {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', String(params.page));
      if (params?.limit) query.append('limit', String(params.limit));
      if (params?.search) query.append('search', params.search);
      if (params?.lowStockOnly) query.append('lowStockOnly', 'true');

      const res = await fetch(`${API_BASE}/products?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return {
          data: (data.data as Product[]).map(normalizeProduct),
          pagination: data.pagination as Pagination,
        };
      }
    } catch {
      // Fallback
    }

    let filtered = [...mockProducts];
    if (params?.lowStockOnly) {
      filtered = filtered.filter((p) => p.currentStock <= p.minStockAlert);
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.sku.toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s)
      );
    }

    const page = params?.page || 1;
    const limit = params?.limit || 10;

    return {
      data: filtered.slice((page - 1) * limit, page * limit),
      pagination: { page, limit, totalCount: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
    };
  },

  createProduct: async (productData: Partial<Product>): Promise<Product> => {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (res.ok && data.success) return normalizeProduct(data.data as Product);
      if (!res.ok && data.error) throw new Error(data.error);
    } catch (err) {
      if (err instanceof Error && err.message.includes('SKU')) throw err;
    }

    const exists = mockProducts.some((p) => p.sku.toLowerCase() === (productData.sku || '').toLowerCase());
    if (exists) throw new Error(`Product with SKU '${productData.sku}' already exists`);

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: productData.name || '',
      sku: productData.sku || '',
      category: productData.category || 'General',
      unitPrice: productData.unitPrice || 0,
      currentStock: productData.currentStock || 0,
      minStockAlert: productData.minStockAlert || 0,
      location: productData.location || 'Warehouse',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockProducts.unshift(newProd);
    return newProd;
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok && data.success) return data.data;
    } catch {
      // Fallback
    }

    const idx = mockProducts.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    mockProducts[idx] = { ...mockProducts[idx], ...updates, updatedAt: new Date().toISOString() };
    return mockProducts[idx];
  },

  getProductMovements: async (id: string): Promise<StockMovement[]> => {
    try {
      const res = await fetch(`${API_BASE}/products/${id}/movements`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok && data.success) return data.data;
    } catch {
      // Fallback
    }
    return mockStockMovements.filter((m) => m.productId === id);
  },

  // Sales Challan Lifecycle
  getChallans: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', String(params.page));
      if (params?.limit) query.append('limit', String(params.limit));
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);

      const res = await fetch(`${API_BASE}/challans?${query.toString()}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok && data.success) return { data: data.data as SalesChallan[], pagination: data.pagination as Pagination };
    } catch {
      // Fallback
    }

    let filtered = [...mockChallans];
    if (params?.status) filtered = filtered.filter((c) => c.status === params.status);
    const page = params?.page || 1;
    const limit = params?.limit || 10;

    return {
      data: filtered.slice((page - 1) * limit, page * limit),
      pagination: { page, limit, totalCount: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
    };
  },

  createChallan: async (challanData: { customerId: string; status?: string; items: { productId: string; quantity: number }[] }): Promise<SalesChallan> => {
    try {
      const res = await fetch(`${API_BASE}/challans`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(challanData),
      });
      const data = await res.json();
      if (res.ok && data.success) return data.data;
      if (!res.ok && data.error) throw new Error(data.error);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Insufficient stock')) throw err;
    }

    // Mock stock validation & transaction
    const customer = mockCustomers.find((c) => c.id === challanData.customerId);
    const userRaw = localStorage.getItem('erp_user');
    const currentUser: User = userRaw ? JSON.parse(userRaw) : mockUsers[0];

    const mappedItems = challanData.items.map((item) => {
      const p = mockProducts.find((prod) => prod.id === item.productId);
      if (!p) throw new Error(`Product not found: ${item.productId}`);
      if (challanData.status === 'Confirmed' && p.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${p.name}`);
      }
      return {
        productId: p.id,
        snapshotProductName: p.name,
        snapshotSku: p.sku,
        snapshotUnitPrice: p.unitPrice,
        quantity: item.quantity,
      };
    });

    if (challanData.status === 'Confirmed') {
      mappedItems.forEach((item) => {
        const p = mockProducts.find((prod) => prod.id === item.productId)!;
        p.currentStock -= item.quantity;
        mockStockMovements.unshift({
          id: `sm-${Date.now()}`,
          productId: p.id,
          quantityChanged: item.quantity,
          movementType: 'OUT',
          reason: `Sales Challan #CH-20260902-000${mockChallans.length + 1}`,
          createdBy: currentUser.id,
          createdAt: new Date().toISOString(),
          creator: { id: currentUser.id, name: currentUser.name, email: currentUser.email, role: currentUser.role },
        });
      });
    }

    const totalQuantity = mappedItems.reduce((acc, curr) => acc + curr.quantity, 0);

    const newChallan: SalesChallan = {
      id: `ch-${Date.now()}`,
      challanNumber: `CH-20260902-${String(mockChallans.length + 1).padStart(4, '0')}`,
      customerId: challanData.customerId,
      totalQuantity,
      status: (challanData.status as any) || 'Draft',
      createdById: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer,
      items: mappedItems,
      createdBy: { id: currentUser.id, name: currentUser.name, email: currentUser.email, role: currentUser.role },
    };

    mockChallans.unshift(newChallan);
    return newChallan;
  },

  updateChallanStatus: async (id: string, status: string): Promise<SalesChallan> => {
    try {
      const res = await fetch(`${API_BASE}/challans/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok && data.success) return data.data;
      if (!res.ok && data.error) throw new Error(data.error);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Insufficient stock')) throw err;
    }

    const challan = mockChallans.find((c) => c.id === id);
    if (!challan) throw new Error('Sales Challan not found');

    const userRaw = localStorage.getItem('erp_user');
    const currentUser: User = userRaw ? JSON.parse(userRaw) : mockUsers[0];

    // Transaction emulation
    if (status === 'Confirmed' && challan.status !== 'Confirmed') {
      challan.items?.forEach((item) => {
        const p = mockProducts.find((prod) => prod.id === item.productId);
        if (p && p.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${item.snapshotProductName || p.name}`);
        }
        if (p) {
          p.currentStock -= item.quantity;
          mockStockMovements.unshift({
            id: `sm-${Date.now()}`,
            productId: p.id,
            quantityChanged: item.quantity,
            movementType: 'OUT',
            reason: `Sales Challan #${challan.challanNumber}`,
            createdBy: currentUser.id,
            createdAt: new Date().toISOString(),
            creator: { id: currentUser.id, name: currentUser.name, email: currentUser.email, role: currentUser.role },
          });
        }
      });
    } else if (status === 'Cancelled' && challan.status === 'Confirmed') {
      challan.items?.forEach((item) => {
        const p = mockProducts.find((prod) => prod.id === item.productId);
        if (p) {
          p.currentStock += item.quantity;
          mockStockMovements.unshift({
            id: `sm-${Date.now()}`,
            productId: p.id,
            quantityChanged: item.quantity,
            movementType: 'IN',
            reason: `Cancelled Challan #${challan.challanNumber}`,
            createdBy: currentUser.id,
            createdAt: new Date().toISOString(),
            creator: { id: currentUser.id, name: currentUser.name, email: currentUser.email, role: currentUser.role },
          });
        }
      });
    }

    challan.status = status as any;
    challan.updatedAt = new Date().toISOString();
    return challan;
  },
};
