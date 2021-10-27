import React, { useState } from 'react'

import { withFormik } from 'formik'

import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import { myaxios } from '../utils'

import { loadStripe } from '@stripe/stripe-js';
import {
    CardElement,
    Elements,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);


const useStyles = makeStyles({
    input: {
        margin: "1em 0"
    },
    error: {
        color: "red"
    },
    title: {
        margin: "1em 0"
    },
    card: {
        margin: "2em 0"
    }
})

function Form(props) {

    const classes = useStyles()

    const {
        values,
        errors,
        touched,
        handleSubmit,
        handleChange,
        isSubmitting
    } = props

    return (
        <>
            <form onSubmit={handleSubmit}>
                <TextField variant="outlined" label="Current Password" fullWidth type="password" className={classes.input}
                    name="current_password" value={values.current_password} onChange={handleChange} error={errors.current_password && touched.current_password}
                />
                {errors.current_password && touched.current_password && <div className={classes.error}>{errors.current_password}</div>}

                <TextField variant="outlined" label="New Password" fullWidth type="password" className={classes.input}
                    name="new_password" value={values.new_password} onChange={handleChange} error={errors.new_password && touched.new_password}
                />
                {errors.new_password && touched.new_password && <div className={classes.error}>{errors.new_password}</div>}

                <TextField variant="outlined" label="Repeat New Password" fullWidth type="password" className={classes.input}
                    name="re_new_password" value={values.re_new_password} onChange={handleChange} error={errors.re_new_password && touched.re_new_password}
                />
                {errors.re_new_password && touched.re_new_password && <div className={classes.error}>{errors.re_new_password}</div>}

                <Button variant="contained" fullWidth className={classes.input} color="primary" type="submit">
                    {isSubmitting ? <CircularProgress color="inherit" size="1.8em" /> : "Change Password"}
                </Button>

            </form>
        </>
    )
}

const ChangePassword = withFormik({
    mapPropsToValues: () => ({
        current_password: "",
        new_password: "",
        re_new_password: "",
    }),
    validate: (values, props) => {
        const errors = {}

        if (!values.current_password) {
            errors.current_password = "Required"
        }
        if (!values.new_password) {
            errors.new_password = "Required"
        }
        if (!values.re_new_password) {
            errors.re_new_password = "Required"
        }
        if (values.new_password !== values.re_new_password) {
            errors.re_new_password = "Passwords do not match"
        }

        return errors
    },
    handleSubmit: (values, { setSubmitting, setErrors, props }) => {
        myaxios.post('auth/users/set_password/', values)
            .then(res => {
                props.setMsg("Password Changed!")
                setSubmitting(false)
            })
            .catch(err => {
                setErrors(err.response.data)
                setSubmitting(false)
            })
    }
})(Form)

const CardForm = (props) => {
    const stripe = useStripe();
    const elements = useElements();
    const [subscribing, setSubscribing] = useState(false);
    let [errorToDisplay, setErrorToDisplay] = useState('');

    const classes = useStyles()

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

        // Use your card Element with other Stripe.js APIs
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            // console.log('[createPaymentMethod error]', error);
            setSubscribing(false);
            setErrorToDisplay(error && error.message);
        } else {
            // console.log('[PaymentMethod]', paymentMethod);
            const paymentMethodId = paymentMethod.id;
            console.log(paymentMethodId)
            myaxios.post('update-payment/', {
                paymentMethodId: paymentMethodId
            })
                .then(res => {
                    props.setMsg("Card Changed")
                    setSubscribing(false)
                })
                .catch(err => {
                    console.log(err)
                    setSubscribing(false)
                })
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Container maxWidth="sm">
                <Typography className={classes.text} style={{ margin: "1em 0" }}>Enter New Card</Typography>
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
                <div className={classes.error} style={{ margin: "2em 0" }}>
                    <Typography>{errorToDisplay}</Typography>
                </div>
                <div className={classes.title} style={{ margin: "2em 0" }}>
                    <Container maxWidth="xs">
                        <Button variant="contained" color="primary" type="submit" size="large" fullWidth >
                            {subscribing ? <CircularProgress color="inherit" size="1.8em" /> : "Change Card"}
                        </Button>
                    </Container>
                </div>
            </Container>
        </form>
    )
}

function StripeWrapper(props) {
    return (
        <Elements stripe={stripePromise}>
            <CardForm {...props} />
        </Elements>
    )
}

function Settings(props) {
    let classes = useStyles()
    const [msg, setMsg] = useState("")
    const handleClose = () => setMsg("")

    function Alert(props) {
        return <MuiAlert elevation={6} variant="filled" {...props} />;
    }

    return (
        <>
            <Container maxWidth="sm">
                <Typography variant="h5" className={classes.title}>Change Passowrd</Typography>
                <Card variant="outlined" className={classes.card}>
                    <Container maxWidth="xs">
                        <ChangePassword setMsg={setMsg} />
                    </Container>
                </Card>
                <Typography variant="h5" className={classes.title}>Change Billing Method</Typography>
                <Card variant="outlined" className={classes.card}>
                    <Container maxWidth="sm">
                        <StripeWrapper setMsg={setMsg} />
                    </Container>
                </Card>
            </Container>
            <Snackbar open={msg} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={handleClose} severity="success">
                    {msg}
                </Alert>
            </Snackbar>
        </>
    )
}

export default Settings