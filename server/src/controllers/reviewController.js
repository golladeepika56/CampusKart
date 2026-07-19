import Review from '../models/Review.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { createNotification } from '../utils/createNotification.js';

// POST /api/reviews
export const createReview = async (req, res, next) => {
  try {
    const { transactionId, revieweeId, rating, comment } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.status !== 'released') {
      return res.status(400).json({ message: 'Can only review completed transactions' });
    }

    const isParticipant = [String(transaction.buyer), String(transaction.seller)].includes(String(req.user._id));
    if (!isParticipant) return res.status(403).json({ message: 'Not a participant in this transaction' });

    const existing = await Review.findOne({ transaction: transactionId, reviewer: req.user._id });
    if (existing) return res.status(409).json({ message: 'You already reviewed this transaction' });

    const review = await Review.create({
      transaction: transactionId,
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating,
      comment,
    });

    // Recalculate reviewee's average rating
    const reviews = await Review.find({ reviewee: revieweeId });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(revieweeId, { rating: { avg, count: reviews.length } });

    await createNotification({
      userId: revieweeId,
      type: 'review',
      payload: { message: `You received a ${rating}-star review.`, reviewId: review._id },
    });

    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
};

// GET /api/reviews/user/:id
export const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.id })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
};
