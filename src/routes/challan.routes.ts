import { Router } from 'express';
import {
  createChallan,
  getChallans,
  getChallanById,
  updateChallanStatus,
} from '../controllers/challan.controller';
import { Role } from '@prisma/client';
import { authenticateToken, requireRoles } from '../middleware/auth';

const router = Router();

// Protect all sales challan routes with authentication middleware
router.use(authenticateToken);

router.post('/', requireRoles([Role.Admin, Role.Sales]), createChallan);
router.get('/', getChallans);
router.get('/:id', getChallanById);
router.patch('/:id/status', requireRoles([Role.Admin, Role.Sales]), updateChallanStatus);

export default router;
