import React, { useState, useEffect } from 'react'

import { myaxios } from '../utils'

import { useHistory } from 'react-router-dom'

import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Link from '@material-ui/core/Link'
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';

import ArchiveIcon from '@material-ui/icons/Archive';


const useStyles = makeStyles({
    input: {
        margin: "1em 0"
    },
    block: {
        margin: "1em 0"
    },
    card: {
        padding: "2.5em",
        margin: "1em 0"
    },
    warning: {
        border: "1px solid red",
        padding: "1em 0"
    }
})

function Dashboard(props) {
    document.title = "Routing Bot | Dashboard"
    const [show, setShow] = useState(false)
    const [msg, setMsg] = useState("")

    let classes = useStyles()
    let history = useHistory()
    let {
        user,
    } = props

    const handleClose = () => {
        setShow(false)
        setMsg("")
    }

    const copy = () => {
        navigator.clipboard.writeText(user.key)
        setShow(true)
        setMsg("Api Key Copied")
    }

    const resendMail = () => {
        myaxios.post('resend/', { email: user.email })
            .then(res => {
                setShow(true)
                setMsg(`Verification Mail has been sent to ${user.email}`)
            })
            .catch(err => console.log(err))
    }

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

    const KeyFound = () => {
        return (
            <>
                <TextField value={user.key} variant="filled" disabled={true} fullWidth className={classes.input} label="Your API Key" />
                <div className={classes.div}>
                    <Button startIcon={<ArchiveIcon />} size="large" color="primary" variant="outlined" onClick={copy} >Copy</Button>
                </div>

            </>
        )
    }

    const KeyNotFound = props => {
        return (
            <>
                <Typography>Please check your email to verify your account.</Typography>
                <Link onClick={resendMail}>Resend Verification Mail</Link>
            </>
        )
    }

    function Alert(props) {
        return <MuiAlert elevation={6} variant="filled" {...props} />;
    }

    let chargeDate = new Date(user.sub_end)
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    return (
        <>
            {
                user.plan && user.invoice_status !== "paid"
                    ? (
                        <Container maxWidth="lg" className={classes.warning}>
                            <Grid container justify="space-evenly" alignItems="center">
                                <Typography>Your subscription isn't active due to failed payment. Please complete your payment to activate it.</Typography>
                                <Button variant="contained" color="primary" size="large" onClick={() => history.push('pricing')}>Complete Payment</Button>
                            </Grid>
                        </Container>
                    )
                    : <></>
            }
            <Container maxWidth="sm">
                <Grid container direction="column">
                    {
                        user.plan
                            ? (<Grid item>
                                <Card variant="outlined" className={classes.card}>
                                    <CardContent>
                                        <div className={classes.block}>
                                            <Typography variant="subtitle2">Current Plan: </Typography>
                                            <Typography variant="h4">{user.plan}</Typography>
                                        </div>
                                        <div className={classes.block}>
                                            <Typography variant="subtitle2">Charge Amount: </Typography>
                                            <Typography variant="h4">
                                                {user.plan === "STARTER" ? "$9.99" : user.plan === "BUSINESS" ? "$24.99" : ""}
                                            </Typography>
                                        </div>
                                        <div className={classes.block}>
                                            <Typography variant="subtitle2">Next Charge: </Typography>
                                            <Typography variant="h4">{`${chargeDate.getDate()} ${monthNames[chargeDate.getMonth()]}`}</Typography>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Grid>)
                            : <></>
                    }
                    <Grid item>
                        <Card variant="outlined" className={classes.card}>
                            <CardContent>
                                {
                                    user.key ?
                                        <KeyFound /> :
                                        <KeyNotFound />
                                }
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
            <Snackbar open={show} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={handleClose} severity="success">
                    {msg}
                </Alert>
            </Snackbar>
        </>
    )
}

export default Dashboard