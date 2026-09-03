import { Router, Request, Response } from 'express';
import { prisma } from '../config/db';
import authRoutes from './auth.routes';
import customerRoutes from './customer.routes';
import productRoutes from './product.routes';
import challanRoutes from './challan.routes';

const router = Router();

// API root information endpoint
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'Mini ERP/CRM API',
    version: 'v1',
    health: '/api/v1/health',
  });
});

// Health & System Status Endpoint
router.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      database: 'CONNECTED',
      service: 'Mini ERP/CRM API',
    });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      database: 'DISCONNECTED',
      error: error instanceof Error ? error.message : 'Unknown DB error',
    });
  }
});

// API Routes
router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/challans', challanRoutes);

export default router;
