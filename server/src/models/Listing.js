import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['textbooks', 'notes', 'electronics', 'cycles', 'hostel-essentials', 'subletting', 'other'],
    },
    subject: { type: String, default: '' },
    courseCode: { type: String, default: '' },
    condition: { type: String, enum: ['new', 'like-new', 'good', 'fair'], default: 'good' },
    images: [{ type: String }],
    status: { type: String, enum: ['active', 'reserved', 'sold'], default: 'active' },
    hostelBlock: { type: String, default: '' },
    isUrgent: { type: Boolean, default: false },
    urgentUntil: { type: Date },
  },
  { timestamps: true }
);

listingSchema.index({ title: 'text', description: 'text', subject: 'text', courseCode: 'text' });

export default mongoose.model('Listing', listingSchema);
