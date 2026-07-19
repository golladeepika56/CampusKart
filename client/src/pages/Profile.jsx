import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Profile() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({});

  useEffect(() => {
    api.get('/transactions').then(({ data }) => setTransactions(data.transactions));
    if (user) api.get(`/reviews/user/${user.id}`).then(({ data }) => setReviews(data.reviews));
  }, [user]);

  const release = async (txId) => {
    await api.post(`/transactions/${txId}/release`);
    const { data } = await api.get('/transactions');
    setTransactions(data.transactions);
  };

  const submitReview = async (tx, revieweeId) => {
    const { rating = 5, comment = '' } = reviewForm[tx._id] || {};
    await api.post('/reviews', { transactionId: tx._id, revieweeId, rating: Number(rating), comment });
    alert('Review submitted');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl mb-1">{user?.name}</h1>
      <p className="text-campus-navy/60 text-sm mb-8">
        {user?.email} {user?.rating?.count > 0 && `· ★ ${user.rating.avg.toFixed(1)} (${user.rating.count} reviews)`}
      </p>

      <h2 className="text-xl mb-3">Your transactions</h2>
      {transactions.length === 0 ? (
        <p className="text-campus-navy/50 mb-8">No transactions yet.</p>
      ) : (
        <ul className="space-y-3 mb-8">
          {transactions.map((tx) => {
            const isBuyer = tx.buyer._id === user.id;
            const otherParty = isBuyer ? tx.seller : tx.buyer;
            return (
              <li key={tx._id} className="border border-campus-navy/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-medium">{tx.listing?.title}</p>
                    <p className="text-sm text-campus-navy/50">
                      ₹{tx.amount} · {isBuyer ? 'You bought from' : 'Sold to'} {otherParty.name} · <span className="capitalize">{tx.status}</span>
                    </p>
                  </div>
                  {isBuyer && tx.status === 'held' && (
                    <button onClick={() => release(tx._id)} className="text-sm bg-campus-navy text-campus-sand rounded-full px-4 py-1.5">
                      Confirm received
                    </button>
                  )}
                </div>
                {tx.status === 'released' && (
                  <div className="flex items-center gap-2 mt-2">
                    <select
                      onChange={(e) => setReviewForm({ ...reviewForm, [tx._id]: { ...reviewForm[tx._id], rating: e.target.value } })}
                      className="border border-campus-navy/20 rounded px-2 py-1 text-sm"
                    >
                      {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
                    </select>
                    <input
                      placeholder="Leave a comment"
                      onChange={(e) => setReviewForm({ ...reviewForm, [tx._id]: { ...reviewForm[tx._id], comment: e.target.value } })}
                      className="border border-campus-navy/20 rounded px-2 py-1 text-sm flex-1"
                    />
                    <button onClick={() => submitReview(tx, otherParty._id)} className="text-sm text-campus-moss font-medium">
                      Submit review
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <h2 className="text-xl mb-3">Reviews about you</h2>
      {reviews.length === 0 ? (
        <p className="text-campus-navy/50">No reviews yet.</p>
      ) : (
        <ul className="space-y-2">
          {reviews.map((r) => (
            <li key={r._id} className="border border-campus-navy/10 rounded-xl p-3 text-sm">
              <span className="font-medium">{r.reviewer.name}</span> — {'★'.repeat(r.rating)} {r.comment}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
