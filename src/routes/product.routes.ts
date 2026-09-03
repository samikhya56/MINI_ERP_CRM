import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  getProductStockMovements,
} from '../controllers/product.controller';
import { Role } from '@prisma/client';
import { authenticateToken, requireRoles } from '../middleware/auth';

const router = Router();

// Protect all product/inventory routes with authentication middleware
router.use(authenticateToken);

router.post('/', requireRoles([Role.Admin, Role.Warehouse]), createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', requireRoles([Role.Admin, Role.Warehouse]), updateProduct);
router.get('/:id/movements', getProductStockMovements);

export default router;
