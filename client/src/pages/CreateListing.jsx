import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CATEGORIES = ['textbooks', 'notes', 'electronics', 'cycles', 'hostel-essentials', 'subletting', 'other'];

export default function CreateListing() {
  const [form, setForm] = useState({
    title: '', description: '', price: '', category: 'textbooks',
    subject: '', courseCode: '', condition: 'good', hostelBlock: '', isUrgent: false,
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append('images', img));

      const { data } = await api.post('/listings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/listings/${data.listing._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-3xl mb-6">List an item</h1>
      {error && <p className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="title" placeholder="Title (e.g. Data Structures textbook, 3rd edition)" required onChange={handleChange}
          className="w-full border border-campus-navy/20 rounded-lg px-4 py-2.5" />
        <textarea name="description" placeholder="Description" required rows={4} onChange={handleChange}
          className="w-full border border-campus-navy/20 rounded-lg px-4 py-2.5" />

        <div className="grid grid-cols-2 gap-2">
          <input name="price" type="number" min="0" placeholder="Price (₹)" required onChange={handleChange}
            className="border border-campus-navy/20 rounded-lg px-4 py-2.5" />
          <select name="condition" onChange={handleChange} className="border border-campus-navy/20 rounded-lg px-4 py-2.5">
            <option value="new">New</option>
            <option value="like-new">Like new</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>
        </div>

        <select name="category" onChange={handleChange} className="w-full border border-campus-navy/20 rounded-lg px-4 py-2.5">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('-', ' ')}</option>)}
        </select>

        {form.category === 'textbooks' || form.category === 'notes' ? (
          <div className="grid grid-cols-2 gap-2">
            <input name="subject" placeholder="Subject" onChange={handleChange} className="border border-campus-navy/20 rounded-lg px-4 py-2.5" />
            <input name="courseCode" placeholder="Course code" onChange={handleChange} className="border border-campus-navy/20 rounded-lg px-4 py-2.5" />
          </div>
        ) : null}

        <input name="hostelBlock" placeholder="Hostel / block (for pickup)" onChange={handleChange}
          className="w-full border border-campus-navy/20 rounded-lg px-4 py-2.5" />

        <label className="flex items-center gap-2 text-sm text-campus-navy/70">
          <input type="checkbox" name="isUrgent" onChange={handleChange} />
          Mark as "Leaving campus" urgent sale
        </label>

        <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))}
          className="w-full text-sm" />

        <button disabled={loading} className="w-full bg-campus-navy text-campus-sand rounded-lg py-2.5 font-medium hover:bg-campus-navy/90 transition disabled:opacity-50">
          {loading ? 'Publishing...' : 'Publish listing'}
        </button>
      </form>
    </div>
  );
}
