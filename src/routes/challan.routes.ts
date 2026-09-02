import { Router } from 'express';
import {
  createChallan,
  getChallans,
  getChallanById,
  updateChallanStatus,
} from '../controllers/challan.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protect all sales challan routes with authentication middleware
router.use(authenticateToken);

router.post('/', createChallan);
router.get('/', getChallans);
router.get('/:id', getChallanById);
router.patch('/:id/status', updateChallanStatus);

export default router;
