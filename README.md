# CampusKart

A hyperlocal secondhand marketplace for college students — buy and sell within your own campus, with campus-email verification, real-time chat, escrow-style payments, and ratings.

## Stack
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io, JWT auth, Razorpay, local image storage, Nodemailer
- **Frontend**: React (Vite), Tailwind CSS, Zustand, React Router, Socket.io-client

## Project structure
```
campuskart/
├── server/     # Express API + Socket.io
└── client/     # React frontend
```

## Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env
# Fill in .env: MongoDB URI, JWT secret, campus email domain,
# SMTP credentials, Razorpay keys, etc.
npm run dev
```
Server runs on `http://localhost:5000`.

If `MONGO_URI` is empty or cannot connect to Atlas, the server will try a local MongoDB instance at `mongodb://127.0.0.1:27017/campuskart`, and only then fall back to an in-memory MongoDB instance. For persistent storage, provide a working Atlas connection string or run a local MongoDB server.

If Atlas `mongodb+srv://` lookup fails on your network, use Atlas’ standard (non-SRV) connection string instead or configure `MONGO_DNS_SERVERS` in `server/.env` to point at public DNS servers such as `8.8.8.8,1.1.1.1`.

If Atlas `mongodb+srv://` lookup fails on your network, use Atlas' standard (non-SRV) connection string from the Atlas UI instead.

### 2. Frontend
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
App runs on `http://localhost:5173`.

## Required third-party accounts (all have free tiers)
| Service | Used for | Get keys at |
|---|---|---|
| MongoDB Atlas | Database | https://www.mongodb.com/cloud/atlas |
| Cloudinary | Image uploads | https://cloudinary.com |
| Razorpay | Payments (test mode) | https://dashboard.razorpay.com/signup |
| Gmail (App Password) | OTP + notification emails | Enable 2FA, then generate an App Password |

## Key flows implemented
- **Register/login**: only emails matching `ALLOWED_EMAIL_DOMAIN` in `.env` can sign up; OTP emailed and must be verified before login works.
- **Listings**: CRUD with image upload (local server storage), category/subject/course-code tagging, hostel-block filter, "leaving campus" urgency flag with countdown.
- **Chat**: Socket.io-based real-time messaging, persisted to MongoDB, with typing indicator support.
- **Payments**: Razorpay Checkout on the frontend → order creation/signature verification on the backend → funds held ("escrow-style") until buyer clicks "Confirm received," which marks the listing sold. (Actual payout to seller's bank account would need Razorpay Route/payout APIs with KYC — noted as a stretch goal, out of scope for a student demo.)
- **Reviews**: only for completed (`released`) transactions, one review per participant per transaction, updates the reviewee's running average rating.
- **Notifications**: created in MongoDB and pushed live via Socket.io if the recipient is online.
- **Admin**: `isAdmin` flag on User; `/admin` route shows basic counts and lets an admin soft-remove a listing.

## To make an admin user
There's no signup flow for admins by design. After registering normally, flip the flag directly in MongoDB:
```js
db.users.updateOne({ email: "you@yourcollege.edu.in" }, { $set: { isAdmin: true } })
```

## Notes for extending this further
- Add pagination controls in the Browse UI (API already supports `page`/`limit`).
- Add a "forgot password" flow (currently out of scope).
- Wrap the Razorpay payout step for real seller payouts if you want a production-grade escrow.
- Add image lazy-loading / skeleton loaders for a more polished feel.
