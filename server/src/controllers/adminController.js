import Listing from '../models/Listing.js';
import User from '../models/User.js';

// GET /api/admin/reports — simple overview for moderation
export const getReports = async (req, res, next) => {
  try {
    const [totalUsers, totalListings, activeListings, soldListings] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Listing.countDocuments({ status: 'active' }),
      Listing.countDocuments({ status: 'sold' }),
    ]);
    res.json({ totalUsers, totalListings, activeListings, soldListings });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/listings/:id/moderate — remove/flag a listing
export const moderateListing = async (req, res, next) => {
  try {
    const { action } = req.body; // 'remove' | 'restore'
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    if (action === 'remove') {
      listing.status = 'sold'; // soft-remove from active browse without deleting history
    } else if (action === 'restore') {
      listing.status = 'active';
    }
    await listing.save();
    res.json({ listing });
  } catch (err) {
    next(err);
  }
};
