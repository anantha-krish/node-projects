/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51J7doaSIrf4hhOM7vQasq7NgqmnJnMzcEt630GD5wxlLqwWymBEKwFt5hSqIGX3vWqTarn6r0e5tZkyo6Lre0o5y007HgSofrz'
);
exports.bookTour = async (tourId) => {
  try {
    const session = await axios({
      method: 'GET',
      url: `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`,
    });

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
