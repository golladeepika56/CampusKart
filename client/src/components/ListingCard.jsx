import { Link } from 'react-router-dom';

export default function ListingCard({ listing }) {
  const isUrgentActive = listing.isUrgent && (!listing.urgentUntil || new Date(listing.urgentUntil) > new Date());

  return (
    <Link
      to={`/listings/${listing._id}`}
      className="group block rounded-2xl overflow-hidden border border-campus-navy/10 bg-white hover:shadow-lg hover:-translate-y-0.5 transition"
    >
      <div className="aspect-[4/3] bg-campus-navy/5 relative overflow-hidden">
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-campus-navy/30 text-sm">No image</div>
        )}
        {isUrgentActive && (
          <span className="absolute top-2 left-2 bg-campus-gold text-campus-navy text-xs font-semibold px-2 py-1 rounded-full">
            Leaving campus
          </span>
        )}
        {listing.status !== 'active' && (
          <span className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-semibold uppercase tracking-wide">
            {listing.status}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm truncate">{listing.title}</h3>
        <p className="font-display text-lg font-semibold text-campus-navy">₹{listing.price}</p>
        <p className="text-xs text-campus-navy/50 mt-1">
          {listing.hostelBlock ? `Block ${listing.hostelBlock} · ` : ''}{listing.condition}
        </p>
      </div>
    </Link>
  );
}
