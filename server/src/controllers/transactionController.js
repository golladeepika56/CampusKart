import crypto from 'crypto';
import razorpay from '../config/razorpay.js';
import Transaction from '../models/Transaction.js';
import Listing from '../models/Listing.js';
import { createNotification } from '../utils/createNotification.js';

// POST /api/transactions — buyer initiates payment (creates Razorpay order)
export const createTransaction = async (req, res, next) => {
  try {
    const { listingId } = req.body;
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.status !== 'active') return res.status(400).json({ message: 'Listing is not available' });
    if (String(listing.seller) === String(req.user._id)) {
      return res.status(400).json({ message: "You can't buy your own listing" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(listing.price * 100), // paise
      currency: 'INR',
      receipt: `listing_${listing._id}`,
    });

    const transaction = await Transaction.create({
      listing: listing._id,
      buyer: req.user._id,
      seller: listing.seller,
      amount: listing.price,
      status: 'pending',
      razorpayOrderId: order.id,
    });

    listing.status = 'reserved';
    await listing.save();

    res.status(201).json({
      transaction,
      razorpayOrder: order,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/transactions/verify — called from client after Razorpay checkout succeeds
export const verifyPayment = async (req, res, next) => {
  try {
    const { transactionId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const paymentDisabled = process.env.PAYMENT_DISABLED === 'true' || !process.env.RAZORPAY_KEY_SECRET;

    if (!paymentDisabled) {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Payment verification failed' });
      }
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    transaction.status = 'held'; // escrow-style hold until buyer confirms pickup
    transaction.razorpayPaymentId = razorpay_payment_id;
    await transaction.save();

    await createNotification({
      userId: transaction.seller,
      type: 'payment',
      payload: { message: 'Payment received and held — item marked reserved.', transactionId: transaction._id },
    });

    res.json({ transaction });
  } catch (err) {
    next(err);
  }
};

// POST /api/transactions/:id/release — buyer confirms they received the item
export const releaseTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (String(transaction.buyer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the buyer can release payment' });
    }
    if (transaction.status !== 'held') {
      return res.status(400).json({ message: 'Transaction is not in a releasable state' });
    }

    // NOTE: Actual payout to the seller's bank account requires Razorpay Route/
    // payout APIs and KYC-linked accounts — out of scope for a student project demo.
    // Here we just mark it released; in production wire this to a payout call.
    transaction.status = 'released';
    await transaction.save();

    const listing = await Listing.findById(transaction.listing);
    if (listing) {
      listing.status = 'sold';
      await listing.save();
    }

    await createNotification({
      userId: transaction.seller,
      type: 'sold',
      payload: { message: 'Buyer confirmed receipt — sale complete!', transactionId: transaction._id },
    });

    res.json({ transaction });
  } catch (err) {
    next(err);
  }
};

// GET /api/transactions — user's transaction history (as buyer or seller)
export const getMyTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }],
    })
      .populate('listing', 'title images price')
      .populate('buyer', 'name')
      .populate('seller', 'name')
      .sort({ createdAt: -1 });
    res.json({ transactions });
  } catch (err) {
    next(err);
  }
};
