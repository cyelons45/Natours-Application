import axios from 'axios';
import {showAlert} from './alerts';
const stripe = Stripe('pk_test_lvFdzScST1O5Jf4gqhdR2HLX00FWlvJgBW');
export const payment = async (tourId) => {
  try {
    const session = await axios.get(
      `http://127.0.0.1:4000/api/v1/booking/checkout-session/${tourId}`
    );
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
    // location.reload(true);
    // window.setTimeout((res),1000)
  } catch (err) {
    showAlert('error', 'Error Checking out! Try again');
  }
  document.getElementById('book-tour').textContent = 'BOOK TOUR NOW';
};
