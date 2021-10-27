import React, { useState, useEffect } from 'react';

import { useHistory } from 'react-router-dom'

import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';

import PaymentForm from './PaymentForm';
import { checkAuth, myaxios } from '../utils'

const plans = [
    {
        key: 0,
        name: "Starter",
        price: "$9.99",
    },
    {
        key: 1,
        name: "Business",
        price: "$24.99",
    }
]

const Form = props => {
    if (checkAuth() && props.productSelected) {
        return (
            <PaymentForm productSelected={props.productSelected} user={props.user} />
        )
    } else {
        return (
            <></>
        )
    }
}

function Pricing(props) {

    const [plan, setPlan] = useState(null)

    let history = useHistory()

    const choosePlan = (key) => {
        if (checkAuth()) {
            setPlan(key)
        } else {
            history.push('/login')
        }
    }

    useEffect(() => {
        if (props.user) {
            if (props.user.plan) {
                if (props.user.plan === "STARTER" && props.user.invoice_status !== "paid") {
                    setPlan(0)
                    localStorage.setItem('latestInvoiceId', props.user.invoice_id)
                    localStorage.setItem('latestInvoicePaymentIntentStatus', 'requires_payment_method')
                }
                if (props.user.plan === "BUSINESS" && props.user.invoice_status !== "paid") {
                    setPlan(1)
                    localStorage.setItem('latestInvoiceId', props.user.invoice_id)
                    localStorage.setItem('latestInvoicePaymentIntentStatus', 'requires_payment_method')
                }
            }
        } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        myaxios.get('auth/users/me/')
            .then(res => {
                localStorage.setItem('user', JSON.stringify(res.data))
                props.setUser(res.data)
                if (res.data.invoice_status && res.data.invoice_status !== "paid") {
                    localStorage.setItem('latestInvoiceId', res.data.invoice_id)
                }
            }) // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Container maxWidth="md">
            <Grid align="center" style={{ margin: "2em 0" }}>
                <Typography variant="h5">
                    {
                        checkAuth()
                            ? props.user.plan === "BUSINESS"
                                ? "You are already subscribed to BUSINESS Plan."
                                : props.user.plan === "STARTER"
                                    ? "You are on plan STARTER. You can Upgrade to BUSINESS Plan."
                                    : <></>
                            : null
                    }
                </Typography>
            </Grid>
            <Grid container spacing={4} justify="center">
                <Grid xs={12} md={4} item align="center">
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h4">Starter</Typography>
                        </CardContent>
                        <Divider />
                        <CardContent>
                            <Typography>25 locations per call</Typography>
                            <Typography>25 calls per day</Typography>
                        </CardContent>
                        <CardActions style={{ display: "flex", justifyContent: "center", margin: "1em 0" }}>
                            <Button color="primary" variant="outlined" disabled={Boolean(props.user.plan)} onClick={() => choosePlan(0)}> {plan === 0 ? "Selected" : "Select"}</Button>
                        </CardActions>
                    </Card>
                </Grid>
                <Grid xs={12} md={4} item align="center">
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h4">Business</Typography>
                        </CardContent>
                        <Divider />
                        <CardContent>
                            <Typography>50 locations per call</Typography>
                            <Typography>50 calls per day</Typography>
                        </CardContent>
                        <CardActions style={{ display: "flex", justifyContent: "center", margin: "1em 0" }}>
                            <Button color="primary" variant="contained" disabled={Boolean(props.user.plan === "BUSINESS" || props.user.invoice_status === "open")} onClick={() => choosePlan(1)}>{plan === 1 ? "Selected" : "Select"}</Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>
            {
                props.user.plan === "BUSINESS" && props.user.invoice_status === "paid"
                    ? <></>
                    : <Form productSelected={plans[plan]} user={props.user} setUser={props.setUser} />
            }
        </Container>
    )
}

export default Pricing