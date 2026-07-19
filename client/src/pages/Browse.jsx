import { useEffect, useState } from 'react';
import api from '../services/api';
import ListingCard from '../components/ListingCard';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'textbooks', label: 'Textbooks' },
  { value: 'notes', label: 'Notes' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'cycles', label: 'Cycles' },
  { value: 'hostel-essentials', label: 'Hostel essentials' },
  { value: 'subletting', label: 'Subletting' },
];

export default function Browse() {
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({ category: '', q: '', hostelBlock: '' });
  const [loading, setLoading] = useState(true);

  const fetchListings = async (overrideFilters = filters) => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(overrideFilters).filter(([, v]) => v));
      const { data } = await api.get('/listings', { params });
      setListings(data.listings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl">Browse listings</h1>
          <p className="text-campus-navy/60 text-sm mt-1">Everything for sale on campus right now.</p>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); fetchListings(); }}
          className="flex flex-wrap gap-2"
        >
          <input
            placeholder="Search textbooks, cycles..."
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            className="border border-campus-navy/20 rounded-full px-4 py-2 text-sm w-56"
          />
          <input
            placeholder="Block"
            value={filters.hostelBlock}
            onChange={(e) => setFilters({ ...filters, hostelBlock: e.target.value })}
            className="border border-campus-navy/20 rounded-full px-4 py-2 text-sm w-24"
          />
          <button className="bg-campus-navy text-campus-sand rounded-full px-5 py-2 text-sm font-medium">Search</button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => {
              const nextFilters = { ...filters, category: c.value };
              setFilters(nextFilters);
              fetchListings(nextFilters);
            }}
            className={`px-4 py-1.5 rounded-full text-sm border transition ${
              filters.category === c.value
                ? 'bg-campus-navy text-campus-sand border-campus-navy'
                : 'border-campus-navy/20 text-campus-navy/70 hover:border-campus-navy/50'
            }`}
          >
            {c.label}
          </button>
        ))}
        <button type="button" onClick={() => fetchListings()} className="text-sm text-campus-moss underline ml-1">Apply</button>
      </div>

      {loading ? (
        <p className="text-campus-navy/50">Loading listings...</p>
      ) : listings.length === 0 ? (
        <p className="text-campus-navy/50">No listings match your filters yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((l) => <ListingCard key={l._id} listing={l} />)}
        </div>
      )}
    </div>
  );
}
