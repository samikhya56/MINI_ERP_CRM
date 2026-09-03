import { PrismaClient, Role, CustomerType, CustomerStatus, MovementType, ChallanStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Only initialize a new database; never erase data on a service restart.
  if (await prisma.user.count()) {
    console.log('Database already contains data. Skipping seed.');
    return;
  }

  console.log('🌱 Starting database seed process...');

  // Clean existing data in reverse order of dependencies
  await prisma.challanItem.deleteMany();
  await prisma.salesChallan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.customerNote.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing tables.');

  // 1. Seed Demo Users for all 4 Roles
  const defaultPassword = 'Password@123';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Alice Administrator',
      email: 'admin@minierp.com',
      passwordHash,
      role: Role.Admin,
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'Sam Salesman',
      email: 'sales@minierp.com',
      passwordHash,
      role: Role.Sales,
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: 'Wanda Warehouse',
      email: 'warehouse@minierp.com',
      passwordHash,
      role: Role.Warehouse,
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Arthur Accountant',
      email: 'accounts@minierp.com',
      passwordHash,
      role: Role.Accounts,
    },
  });

  console.log('✅ Created 4 demo users across all roles (Admin, Sales, Warehouse, Accounts).');

  // 2. Seed 5 Initial Products
  const productsData = [
    {
      name: 'Heavy Duty Industrial Drill 800W',
      sku: 'SKU-TOOL-001',
      category: 'Power Tools',
      unitPrice: 149.99,
      currentStock: 50,
      minStockAlert: 10,
      location: 'Rack A-12',
    },
    {
      name: 'Stainless Steel Fastener Pack M8 (100 pcs)',
      sku: 'SKU-HDW-002',
      category: 'Hardware',
      unitPrice: 24.50,
      currentStock: 200,
      minStockAlert: 30,
      location: 'Bin B-04',
    },
    {
      name: 'Safety Goggles & Face Shield Combo',
      sku: 'SKU-SAF-003',
      category: 'Safety Equipment',
      unitPrice: 19.99,
      currentStock: 15,
      minStockAlert: 20, // Triggers alert threshold
      location: 'Shelf S-01',
    },
    {
      name: 'Pneumatic Control Valve 1/2-Inch',
      sku: 'SKU-HYD-004',
      category: 'Hydraulics & Valves',
      unitPrice: 89.00,
      currentStock: 8,
      minStockAlert: 10, // Triggers alert threshold
      location: 'Rack C-05',
    },
    {
      name: 'Heavy Duty Nitrile Work Gloves (Pair)',
      sku: 'SKU-SAF-005',
      category: 'Safety Equipment',
      unitPrice: 12.75,
      currentStock: 120,
      minStockAlert: 25,
      location: 'Bin B-08',
    },
  ];

  const createdProducts = [];
  for (const prod of productsData) {
    const p = await prisma.product.create({ data: prod });
    createdProducts.push(p);
  }
  console.log(`✅ Created ${createdProducts.length} initial products.`);

  // 3. Seed 3 Initial Customers
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const customer1 = await prisma.customer.create({
    data: {
      name: 'Rajesh Kumar',
      mobile: '+91-9876543210',
      email: 'rajesh@apexindustrial.com',
      businessName: 'Apex Industrial Solutions Ltd',
      gstNumber: '27AAACA123411Z5',
      customerType: CustomerType.Wholesale,
      address: '102 Industrial Estate, Sector 5, Mumbai, MH - 400001',
      status: CustomerStatus.Active,
      followUpDate: nextWeek,
      notes: 'Key client for quarterly bulk tool orders. Payment term: Net 30.',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Ananya Sharma',
      mobile: '+91-9123456789',
      email: 'ananya@techtraders.in',
      businessName: 'Tech Traders India Pvt Ltd',
      gstNumber: '07BCCCB567822Z9',
      customerType: CustomerType.Distributor,
      address: '45 Commercial Complex, Connaught Place, New Delhi, DL - 110001',
      status: CustomerStatus.Active,
      followUpDate: inThreeDays,
      notes: 'Regional distributor interested in safety equipment line.',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Vikram Patel',
      mobile: '+91-9988776655',
      email: 'vikram@patelhardware.com',
      businessName: 'Patel Hardware Store',
      gstNumber: null, // Optional GST
      customerType: CustomerType.Retail,
      address: '12 Station Road, Ahmedabad, GJ - 380001',
      status: CustomerStatus.Lead,
      followUpDate: now,
      notes: 'Inquired about pneumatic control valve samples.',
    },
  });

  console.log('✅ Created 3 initial customers.');

  // 4. Seed Demo Customer Notes
  await prisma.customerNote.createMany({
    data: [
      {
        customerId: customer1.id,
        note: 'Initial contract signed for FY 2026-27.',
        createdBy: salesUser.id,
      },
      {
        customerId: customer1.id,
        note: 'Dispatched catalog for new safety gloves series.',
        createdBy: salesUser.id,
      },
      {
        customerId: customer3.id,
        note: 'Phone call lead qualification - requested pricing quote.',
        createdBy: salesUser.id,
      },
    ],
  });

  // 5. Seed Initial Stock Movements
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: createdProducts[0].id,
        quantityChanged: 50,
        movementType: MovementType.IN,
        reason: 'Initial PO Stock Receive from Supplier Alpha',
        createdBy: warehouseUser.id,
      },
      {
        productId: createdProducts[2].id,
        quantityChanged: 5,
        movementType: MovementType.OUT,
        reason: 'Internal usage & safety demo kits',
        createdBy: warehouseUser.id,
      },
    ],
  });

  // 6. Seed Initial Sales Challan with Challan Items
  const challan = await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-20260901-001',
      customerId: customer1.id,
      totalQuantity: 12,
      status: ChallanStatus.Confirmed,
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: createdProducts[0].id,
            snapshotProductName: createdProducts[0].name,
            snapshotSku: createdProducts[0].sku,
            snapshotUnitPrice: createdProducts[0].unitPrice,
            quantity: 2,
          },
          {
            productId: createdProducts[1].id,
            snapshotProductName: createdProducts[1].name,
            snapshotSku: createdProducts[1].sku,
            snapshotUnitPrice: createdProducts[1].unitPrice,
            quantity: 10,
          },
        ],
      },
    },
  });

  console.log(`✅ Created demo Sales Challan (${challan.challanNumber}) with items.`);

  console.log('\n======================================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
  console.log('Demo Credentials for Login Testing (Password: Password@123):');
  console.log(`  - Admin     : ${adminUser.email}`);
  console.log(`  - Sales     : ${salesUser.email}`);
  console.log(`  - Warehouse : ${warehouseUser.email}`);
  console.log(`  - Accounts  : ${accountsUser.email}`);
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
