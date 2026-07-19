import Listing from '../models/Listing.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/listings
export const getListings = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, hostelBlock, isUrgent, q, status = 'active', page = 1, limit = 20 } = req.query;

    const filter = { status };
    if (category) filter.category = category;
    if (hostelBlock) filter.hostelBlock = new RegExp(`^${escapeRegex(hostelBlock.trim())}$`, 'i');
    if (isUrgent) filter.isUrgent = isUrgent === 'true';
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (q) filter.$text = { $search: q };

    const skip = (Number(page) - 1) * Number(limit);

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('seller', 'name avatar rating hostelBlock')
        .sort({ isUrgent: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Listing.countDocuments(filter),
    ]);

    res.json({ listings, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

// GET /api/listings/:id
export const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('seller', 'name avatar rating hostelBlock year branch');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json({ listing });
  } catch (err) {
    next(err);
  }
};

// POST /api/listings
export const createListing = async (req, res, next) => {
  try {
    const { title, description, price, category, subject, courseCode, condition, hostelBlock, isUrgent, urgentUntil } = req.body;

    const images = (req.files || []).map((f) => `${req.protocol}://${req.get('host')}/uploads/${f.filename}`);

    const listing = await Listing.create({
      seller: req.user._id,
      title,
      description,
      price,
      category,
      subject,
      courseCode,
      condition,
      hostelBlock: hostelBlock || req.user.hostelBlock,
      isUrgent: isUrgent === 'true' || isUrgent === true,
      urgentUntil: urgentUntil || undefined,
      images,
    });

    res.status(201).json({ listing });
  } catch (err) {
    next(err);
  }
};

// POST /api/listings/bulk  ("Leaving Campus" mode — multiple items in one go)
export const createBulkListings = async (req, res, next) => {
  try {
    const { items } = req.body; // array of listing objects (no images via this endpoint)
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items must be a non-empty array' });
    }

    const docs = items.map((item) => ({
      ...item,
      seller: req.user._id,
      hostelBlock: item.hostelBlock || req.user.hostelBlock,
      isUrgent: true,
      urgentUntil: item.urgentUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // default 7 days
    }));

    const created = await Listing.insertMany(docs);
    res.status(201).json({ listings: created });
  } catch (err) {
    next(err);
  }
};

// PUT /api/listings/:id
export const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (String(listing.seller) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only edit your own listings' });
    }

    const updatable = ['title', 'description', 'price', 'category', 'subject', 'courseCode', 'condition', 'hostelBlock', 'isUrgent', 'urgentUntil'];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) listing[field] = req.body[field];
    });

    if (req.files && req.files.length > 0) {
      listing.images = req.files.map((f) => `${req.protocol}://${req.get('host')}/uploads/${f.filename}`);
    }

    await listing.save();
    res.json({ listing });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/listings/:id
export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (String(listing.seller) !== String(req.user._id) && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You can only delete your own listings' });
    }
    await listing.deleteOne();
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/listings/:id/status
export const updateListingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'reserved', 'sold'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (String(listing.seller) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the seller can change listing status' });
    }
    listing.status = status;
    await listing.save();
    res.json({ listing });
  } catch (err) {
    next(err);
  }
};
