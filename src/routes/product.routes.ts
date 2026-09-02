import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  getProductStockMovements,
} from '../controllers/product.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protect all product/inventory routes with authentication middleware
router.use(authenticateToken);

router.post('/', createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.get('/:id/movements', getProductStockMovements);

export default router;
