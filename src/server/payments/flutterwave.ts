import axios from 'axios';

export async function initializeFlutterwave(bookingId: string, email: string, amount: number, currency: string, name: string): Promise<string> {
  const secret = process.env.FLW_SECRET_KEY;
  if (!secret) throw new Error("FLW_SECRET_KEY is missing from environment variables.");

  const response = await axios.post(
    'https://api.flutterwave.com/v3/payments',
    {
      tx_ref: bookingId, // Use bookingId as tx_ref so we can identify it in webhook
      amount: amount.toString(),
      currency,
      redirect_url: `${process.env.APP_URL}/payment/success?booking_id=${bookingId}&provider=flutterwave`,
      customer: {
        email,
        name: name || 'Customer'
      },
      customizations: {
        title: "Auralearn Lesson Booking",
        description: "Payment for tutoring session"
      }
    },
    {
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (response.data.status !== 'success') {
    throw new Error(response.data.message || 'Failed to initialize Flutterwave');
  }

  return response.data.data.link;
}
