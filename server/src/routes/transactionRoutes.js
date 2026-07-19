import express from 'express';
import {
  createTransaction,
  verifyPayment,
  releaseTransaction,
  getMyTransactions,
} from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getMyTransactions);
router.post('/', protect, createTransaction);
router.post('/verify', protect, verifyPayment);
router.post('/:id/release', protect, releaseTransaction);

export default router;
