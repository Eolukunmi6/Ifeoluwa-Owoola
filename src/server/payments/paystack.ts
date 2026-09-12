import axios from 'axios';

export async function initializePaystack(bookingId: string, email: string, amount: number, currency: string): Promise<string> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("PAYSTACK_SECRET_KEY is missing from environment variables.");

  const response = await axios.post(
    'https://api.paystack.co/transaction/initialize',
    {
      email,
      amount: Math.round(amount * 100), // convert to kobo
      currency: currency === 'NGN' ? 'NGN' : currency,
      metadata: {
        bookingId
      },
      callback_url: `${process.env.APP_URL}/payment/success?booking_id=${bookingId}&provider=paystack`,
      // Paystack doesn't have a direct 'cancel_url', but they will return to the site if they cancel the popup. 
      // For standard hosted checkout, the cancel action simply closes the page.
    },
    {
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.data.authorization_url;
}
