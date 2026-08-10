import { Router } from 'express';
import { createLead, markScheduled, updateStatus, listLeads } from '../controllers/leadController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = Router();

router.post('/', createLead);
router.patch('/:id/scheduled', markScheduled);
router.get('/', adminAuth, listLeads);
router.patch('/:id/status', adminAuth, updateStatus);

export default router;
