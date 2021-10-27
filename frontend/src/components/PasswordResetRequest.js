import React from 'react'

import { withFormik } from 'formik'

import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

import { myaxios } from '../utils'

const useStyles = makeStyles({
    input: {
        margin: "1em 0"
    },
    wrapper: {
        display: "flex",
        alignItems: "center",
        flexDirection: "column"
    },
    link: {
        '&:hover': {
            cursor: "pointer",
            textDecoration: "none",
        },
        margin: "0.5em 0"
    },
    error: {
        color: "red"
    },
    center: {
        display: "flex",
        justifyContent: "center"
    },
    success: {
        color: "green"
    }
})

function Form(props) {
    document.title = "Routing Bot"
    let classes = useStyles()

    const {
        errors,
        values,
        touched,
        handleChange,
        handleSubmit,
        isSubmitting
    } = props

    return (
        <Container maxWidth="xs">
            <Card variant="outlined">
                <CardContent>
                    <div className={classes.wrapper}>
                        <form onSubmit={handleSubmit}>
                            <div className={classes.center}>
                                <Typography className={classes.success}>{values.done}</Typography>
                            </div>

                            <TextField label="Email" variant="outlined" className={classes.input} fullWidth={true} disabled={Boolean(values.done)}
                                name="email" value={values.email} onChange={handleChange} error={Boolean(touched.email && errors.email && !Boolean(values.done))}
                            />
                            {touched.email && errors.email && !Boolean(values.done) && <span className={classes.error}>{errors.email}</span>}

                            <Button variant="contained" fullWidth className={classes.input} color="primary" type="submit" disabled={Boolean(values.done)}>
                                {isSubmitting ? <CircularProgress color="inherit" size="1.8em" /> : "Send Reset Link"}
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </Container >
    )
}


const PasswordResetRequest = withFormik({
    mapPropsToValues: () => ({
        email: "",
        done: ""
    }),
    validate: (values) => {
        let errors = {}
        if (values.email === "") {
            errors.email = "This field can't be blank"
        }
        return errors
    },
    handleSubmit: (values, { props, setErrors, setSubmitting, setValues }) => {
        myaxios.post('auth/users/reset_password/', { email: values.email })
            .then(res => {
                console.log(res)
                setSubmitting(false)
                setValues({ done: "We have sent you a password reset link!", email: "" })
            })
            .catch(err => {
                if (err.response) {
                    setErrors({ "email": "Please enter a valid email address" })
                    setSubmitting(false)
                }
            })
    }
})(Form)

export default PasswordResetRequest