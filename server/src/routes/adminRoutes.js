import express from 'express';
import { getReports, moderateListing } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/reports', protect, adminOnly, getReports);
router.patch('/listings/:id/moderate', protect, adminOnly, moderateListing);

export default router;
