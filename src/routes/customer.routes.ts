import { Router } from 'express';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  addCustomerNote,
} from '../controllers/customer.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protect all CRM Customer routes with authentication middleware
router.use(authenticateToken);

// Customer CRM Endpoints
router.post('/', createCustomer);
router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);
router.post('/:id/notes', addCustomerNote);

export default router;
