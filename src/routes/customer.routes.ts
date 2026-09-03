import { Router } from 'express';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  addCustomerNote,
} from '../controllers/customer.controller';
import { Role } from '@prisma/client';
import { authenticateToken, requireRoles } from '../middleware/auth';

const router = Router();

// Protect all CRM Customer routes with authentication middleware
router.use(authenticateToken);

// Customer CRM Endpoints
router.post('/', requireRoles([Role.Admin, Role.Sales]), createCustomer);
router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.put('/:id', requireRoles([Role.Admin, Role.Sales]), updateCustomer);
router.post('/:id/notes', requireRoles([Role.Admin, Role.Sales]), addCustomerNote);

export default router;
