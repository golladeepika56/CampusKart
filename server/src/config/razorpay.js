import Razorpay from 'razorpay';

const paymentDisabled =
  process.env.PAYMENT_DISABLED === 'true' ||
  !process.env.RAZORPAY_KEY_ID ||
  !process.env.RAZORPAY_KEY_SECRET;

const razorpay = paymentDisabled
  ? {
      orders: {
        create: async ({ amount, currency, receipt }) => ({
          id: `mock_order_${Date.now()}`,
          amount,
          currency,
          receipt,
        }),
      },
    }
  : new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

export default razorpay;
