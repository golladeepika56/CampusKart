import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

// Loads the Razorpay checkout script once, on demand
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const paymentDisabled = import.meta.env.VITE_PAYMENT_DISABLED === 'true';

  useEffect(() => {
    api.get(`/listings/${id}`).then(({ data }) => setListing(data.listing)).finally(() => setLoading(false));
  }, [id]);

  const isOwner = user && listing && String(listing.seller._id) === String(user.id);

  const handleChat = async () => {
    const { data } = await api.post('/chats', { listingId: listing._id, otherUserId: listing.seller._id });
    navigate(`/chats/${data.chat._id}`);
  };

  const handleBuy = async () => {
    setBusy(true);
    try {
      const paymentDisabled = import.meta.env.VITE_PAYMENT_DISABLED === 'true';
      const { data } = await api.post('/transactions', { listingId: listing._id });

      if (paymentDisabled) {
        await api.post('/transactions/verify', {
          transactionId: data.transaction._id,
          razorpay_order_id: data.razorpayOrder.id,
          razorpay_payment_id: 'mock_payment_id',
          razorpay_signature: 'mock_signature',
        });
        navigate('/profile');
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Payment gateway failed to load. Check your connection and try again.');
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        order_id: data.razorpayOrder.id,
        name: 'CampusKart',
        description: listing.title,
        handler: async (response) => {
          await api.post('/transactions/verify', {
            transactionId: data.transaction._id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          navigate('/profile');
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#1B2A4A' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not start payment');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="text-center mt-12">Loading...</p>;
  if (!listing) return <p className="text-center mt-12">Listing not found.</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      <div className="rounded-2xl overflow-hidden bg-campus-navy/5 aspect-square">
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-campus-navy/30">No image</div>
        )}
      </div>

      <div>
        {listing.isUrgent && (
          <span className="inline-block bg-campus-gold text-campus-navy text-xs font-semibold px-3 py-1 rounded-full mb-3">
            Leaving campus — grab it fast
          </span>
        )}
        <h1 className="text-3xl mb-2">{listing.title}</h1>
        <p className="font-display text-3xl font-semibold text-campus-navy mb-4">₹{listing.price}</p>
        <p className="text-campus-navy/70 mb-4 whitespace-pre-line">{listing.description}</p>

        <dl className="text-sm text-campus-navy/60 grid grid-cols-2 gap-y-1 mb-6">
          <dt>Condition</dt><dd className="capitalize">{listing.condition}</dd>
          <dt>Category</dt><dd className="capitalize">{listing.category.replace('-', ' ')}</dd>
          {listing.hostelBlock && (<><dt>Pickup block</dt><dd>{listing.hostelBlock}</dd></>)}
          <dt>Seller</dt><dd>{listing.seller.name} {listing.seller.rating?.count > 0 && `★ ${listing.seller.rating.avg.toFixed(1)}`}</dd>
        </dl>

        {!isOwner && listing.status === 'active' && (
          <div className="flex gap-3">
            <button onClick={handleChat} className="flex-1 border border-campus-navy rounded-full py-2.5 font-medium hover:bg-campus-navy/5 transition">
              Message seller
            </button>
            <button onClick={handleBuy} disabled={busy} className="flex-1 bg-campus-navy text-campus-sand rounded-full py-2.5 font-medium hover:bg-campus-navy/90 transition disabled:opacity-50">
              {busy ? 'Starting...' : paymentDisabled ? 'Reserve' : 'Buy now'}
            </button>
          </div>
        )}
        {listing.status !== 'active' && <p className="text-campus-navy/50 italic">This item is {listing.status}.</p>}
      </div>
    </div>
  );
}
