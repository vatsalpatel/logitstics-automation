import React, { useState } from 'react';

import { Redirect } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles'
import { Typography, Container, CircularProgress, Button } from '@material-ui/core';

import { myaxios } from '../utils';

import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);


const useStyles = makeStyles({
  title: {
    display: "flex",
    flexDirection: "column",
    margin: "2em 0"
  },
  wrapper: {
    margin: "3em",
  },
  text: {
    margin: "0.3em 0"
  },
  error: {
    color: "red",
    margin: "0.3em 0"
  }
})


const CheckoutForm = ({ productSelected, user }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [subscribing, setSubscribing] = useState(false);
  const [accountInformation, setAccountInformation] = useState(null);
  let [errorToDisplay, setErrorToDisplay] = useState('');

  let customer = {
    id: user.cus_id,
  }

  function handlePaymentThatRequiresCustomerAction({
    subscription,
    invoice,
    priceId,
    paymentMethodId,
    isRetry,
  }) {
    if (subscription && subscription.status === 'active') {
      // subscription is active, no customer actions required.
      return { subscription, priceId, paymentMethodId };
    }

    // If it's a first payment attempt, the payment intent is on the subscription latest invoice.
    // If it's a retry, the payment intent will be on the invoice itself.
    let paymentIntent = invoice
      ? invoice.data.payment_intent
      : subscription.latest_invoice.payment_intent;

    if (
      paymentIntent.status === 'requires_action' ||
      (isRetry === true && paymentIntent.status === 'requires_payment_method')
    ) {
      return stripe
        .confirmCardPayment(paymentIntent.client_secret, {
          payment_method: paymentMethodId,
        })
        .then((result) => {
          if (result.error) {
            // start code flow to handle updating the payment details
            // Display error message in your UI.
            // The card was declined (i.e. insufficient funds, card has expired, etc)
            throw result;
          } else {
            if (result.paymentIntent.status === 'succeeded') {
              // There's a risk of the customer closing the window before callback
              // execution. To handle this case, set up a webhook endpoint and
              // listen to invoice.payment_succeeded. This webhook endpoint
              // returns an Invoice.
              return {
                priceId: priceId,
                subscription: subscription,
                invoice: invoice,
                paymentMethodId: paymentMethodId,
              };
            }
          }
        });
    } else {
      // No customer action needed
      return { subscription, priceId, paymentMethodId };
    }
  }

  function handleRequiresPaymentMethod({
    subscription,
    paymentMethodId,
    priceId,
  }) {
    if (subscription.status === 'active') {
      // subscription is active, no customer actions required.
      return { subscription, priceId, paymentMethodId };
    } else if (
      subscription.latest_invoice.payment_intent.status ===
      'requires_payment_method'
    ) {
      // Using localStorage to store the state of the retry here
      // (feel free to replace with what you prefer)
      // Store the latest invoice ID and status
      localStorage.setItem('latestInvoiceId', subscription.latest_invoice.id);
      localStorage.setItem(
        'latestInvoicePaymentIntentStatus',
        subscription.latest_invoice.payment_intent.status
      );
      throw new Error('Your card was declined.');
    } else {
      return { subscription, priceId, paymentMethodId };
    }
  }

  function retryInvoiceWithNewPaymentMethod({ paymentMethodId, invoiceId }) {
    const priceId = productSelected.name.toUpperCase();
    return (
      myaxios.post('/retry-invoice/', {
        customerId: customer.id,
        paymentMethodId: paymentMethodId,
        invoiceId: invoiceId,
      })
        // If the card is declined, display an error to the user.
        .then((result) => {
          if (result.data.error) {
            // The card had an error when trying to attach it to a customer.
            throw result.data.error;
          }
          return result;
        })
        // Normalize the result to contain the object returned by Stripe.
        // Add the addional details we need.
        .then((result) => {
          return {
            // Use the Stripe 'object' property on the
            // returned result to understand what object is returned.
            invoice: result,
            paymentMethodId: paymentMethodId,
            priceId: priceId,
            isRetry: true,
          };
        })
        // Some payment methods require a customer to be on session
        // to complete the payment process. Check the status of the
        // payment intent to handle these actions.
        .then(handlePaymentThatRequiresCustomerAction)
        // No more actions required. Provision your service for the user.
        // Calling custom Success method to avoid DOM Error from React-Router
        .then(retrySuccess)
        .catch((error) => {
          // An error has happened. Display the failure to the user here.
          setSubscribing(false);
          const { error: err = false } = error
          if (Object.keys(err).length) {
            const { message = "" } = err
            setErrorToDisplay(message);
          } else {
            setErrorToDisplay(error.split(':')[1]);
          }
        })
    );
  }

  function retrySuccess(result) {
    // Retry Payment was successful
    localStorage.removeItem('latestInvoiceId')
    localStorage.removeItem('latestInvoicePaymentIntentStatus')
    setTimeout(() => {
      setSubscribing(false)
      window.location = "/dashboard"
    }, 3000)
  }

  function onSubscriptionComplete(result) {
    // Payment was successful. Provision access to your service.
    // Remove invoice from localstorage because payment is now complete.
    // clearCache();
    if (result && !result.subscription) {
      const subscription = { id: result.invoice.subscription };
      result.subscription = subscription;
      // localStorage.clear();
      localStorage.removeItem('latestInvoiceId')
      localStorage.removeItem('latestInvoicePaymentIntentStatus')
    }

    setAccountInformation(result);
    // Change your UI to show a success message to your customer.
    // onSubscriptionSampleDemoComplete(result);
    // Call your backend to grant access to your service based on
    // the product your customer subscribed to.
    // Get the product by using result.subscription.price.product
  }

  function createSubscription({ paymentMethodId }) {
    const priceId = productSelected.name.toUpperCase();
    return (
      myaxios.post('subscription/', {
        customerId: customer.id,
        paymentMethodId: paymentMethodId,
        priceId: priceId,
      })
        // If the card is declined, display an error to the user.
        .then((result) => {
          if (result.data.error) {
            // The card had an error when trying to attach it to a customer
            throw result.data.error;
          }
          return result;
        })
        // Normalize the result to contain the object returned
        // by Stripe. Add the addional details we need.
        .then((result) => {
          return {
            // Use the Stripe 'object' property on the
            // returned result to understand what object is returned.
            subscription: result.data,
            paymentMethodId: paymentMethodId,
            priceId: productSelected.name,
          };
        })
        // Some payment methods require a customer to do additional
        // authentication with their financial institution.
        // Eg: 2FA for cards.
        .then(handlePaymentThatRequiresCustomerAction)
        // If attaching this card to a Customer object succeeds,
        // but attempts to charge the customer fail. You will
        // get a requires_payment_method error.
        .then(handleRequiresPaymentMethod)
        // No more actions required. Provision your service for the user.
        .then(onSubscriptionComplete)
        .catch((error) => {
          // An error has happened. Display the failure to the user here.
          // We utilize the HTML element we created.
          setSubscribing(false);
          const { error: err = false } = error
          if (Object.keys(err).length) {
            const { message = "" } = err
            setErrorToDisplay(message);
          } else {
            setErrorToDisplay(error.split(':')[1]);
          }
        })
    );
  }

  function upgradeSubscription({ paymentMethodId }) {
    const priceId = productSelected.name.toUpperCase();
    return (
      myaxios.post('upgrade-subscription/', {
        customerId: customer.id,
        paymentMethodId: paymentMethodId,
        priceId: priceId,
      })
        // If the card is declined, display an error to the user.
        .then((result) => {
          if (result.data.error) {
            // The card had an error when trying to attach it to a customer
            throw result.data.error;
          }
          return result;
        })
        // Normalize the result to contain the object returned
        // by Stripe. Add the addional details we need.
        .then((result) => {
          return {
            // Use the Stripe 'object' property on the
            // returned result to understand what object is returned.
            subscription: result.data,
            paymentMethodId: paymentMethodId,
            priceId: productSelected.name,
          };
        })
        // Some payment methods require a customer to do additional
        // authentication with their financial institution.
        // Eg: 2FA for cards.
        .then(handlePaymentThatRequiresCustomerAction)
        // If attaching this card to a Customer object succeeds,
        // but attempts to charge the customer fail. You will
        // get a requires_payment_method error.
        .then(handleRequiresPaymentMethod)
        // No more actions required. Provision your service for the user.
        // Calling custom Success method to avoid DOM Error from React-Router
        .then(retrySuccess)
        .catch((error) => {
          // An error has happened. Display the failure to the user here.
          // We utilize the HTML element we created.
          setSubscribing(false);
          const { error: err = false } = error
          if (Object.keys(err).length) {
            const { message = "" } = err
            setErrorToDisplay(message);
          } else {
            setErrorToDisplay(error.split(':')[1]);
          }
        })
    );
  }

  const handleSubmit = async (event) => {
    // Block native form submission.
    event.preventDefault();

    setSubscribing(true);

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const cardElement = elements.getElement(CardElement);

    // If a previous payment was attempted, get the lastest invoice
    const latestInvoicePaymentIntentStatus = localStorage.getItem(
      'latestInvoicePaymentIntentStatus'
    );

    // Use your card Element with other Stripe.js APIs
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      setSubscribing(false);
      setErrorToDisplay(error && error.message);
    } else {
      const paymentMethodId = paymentMethod.id;
      if (latestInvoicePaymentIntentStatus === 'requires_payment_method') {
        // Update the payment method and retry invoice payment
        const invoiceId = localStorage.getItem('latestInvoiceId');
        retryInvoiceWithNewPaymentMethod({
          paymentMethodId: paymentMethodId,
          invoiceId: invoiceId,
        });
      } else {
        if (user.plan === "STARTER") {
          // Upgrade Subscription
          upgradeSubscription({
            paymentMethodId: paymentMethodId,
          });
        } else {
          // Create the subscription
          createSubscription({
            paymentMethodId: paymentMethodId,
          });
        }
      }
    }
  };

  const classes = useStyles()
  const date = new Date().getDate()
  let append = ""
  if ([1, 11, 21].includes(date)) {
    append = "st"
  } else if ([2, 12, 22].includes(date)) {
    append = "nd"
  } else if ([3, 13, 23].includes(date)) {
    append = "rd"
  } else {
    append = "th"
  }

  if (accountInformation) {
    return (
      <Redirect
        to={{
          pathname: '/dashboard',
          state: { accountInformation: accountInformation },
        }}
      />
    );
  } else {
    return (
      <div className={classes.wrapper}>
        <form onSubmit={handleSubmit}>
          <Container maxWidth="xs">
            <div className={classes.title}>
              <Typography className={classes.text}>Subscribing to: {productSelected.name} Plan</Typography>
              <Typography className={classes.text}>Monthly Charge: {productSelected.price}</Typography>
              {
                user.plan === 'STARTER' && productSelected === 1
                  ? <Typography className={classes.text}>You will be charged $20.00 difference instantly.</Typography>
                  : <></>
              }
              <Typography className={classes.text}>You will be billed on {date}<sup>{append}</sup> of every month</Typography>
            </div>
            <Typography className={classes.text} style={{ margin: "1em 0" }}>Card</Typography>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#32325d',
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                    '::placeholder': {
                      color: '#a0aec0',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
            <div className={classes.error} style={{ margin: "1em 0" }}>
              <Typography>{errorToDisplay}</Typography>
            </div>
            <div className={classes.title} style={{ margin: "1em 0" }}>
              <Button variant="contained" color="primary" type="submit" size="large">{subscribing ? <CircularProgress color="inherit" size="1.8em" /> : "Activate"}</Button>
            </div>
          </Container>
        </form>
      </div>
    );
  }
}


const PaymentForm = (props) => (
  <Elements stripe={stripePromise}>
    <CheckoutForm {...props} />
  </Elements>
)

export default PaymentForm