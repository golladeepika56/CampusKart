import express from 'express';
import {
  getListings,
  getListingById,
  createListing,
  createBulkListings,
  updateListing,
  deleteListing,
  updateListingStatus,
} from '../controllers/listingController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/upload.js';

const router = express.Router();

router.get('/', getListings);
router.get('/:id', getListingById);
router.post('/', protect, upload.array('images', 5), createListing);
router.post('/bulk', protect, createBulkListings);
router.put('/:id', protect, upload.array('images', 5), updateListing);
router.delete('/:id', protect, deleteListing);
router.patch('/:id/status', protect, updateListingStatus);

export default router;
