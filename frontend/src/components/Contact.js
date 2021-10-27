import React, { useState } from 'react'

import { withFormik } from 'formik'

import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'

import ReCAPTCHA from "react-google-recaptcha"

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
    },
})


const Form = props => {
    let classes = useStyles()

    const [captchaSolved, setCaptchaSolved] = useState(false)
    const captchaPassed = (value) => {
        setCaptchaSolved(true)
    }
    const captchaExpired = () => {
        setCaptchaSolved(false)
    }

    const {
        errors,
        values,
        touched,
        handleChange,
        handleSubmit,
        isSubmitting,
        setErrors
    } = props

    const formSubmit = (e) => {
        e.preventDefault()
        if (captchaSolved) {
            handleSubmit()
        } else {
            setErrors({ 'captcha': "Please solve the captcha" })
        }
    }

    return (
        <Container maxWidth="sm">
            <Card variant="outlined">
                <CardContent>
                    <div className={classes.wrapper}>
                        <form onSubmit={formSubmit}>

                            <div className={classes.center}>
                                <Typography className={classes.success}>{values.done}</Typography>
                            </div>

                            <TextField label="Full Name" variant="outlined" className={classes.input} fullWidth disabled={Boolean(values.done)}
                                name="full_name" value={values.full_name} onChange={handleChange} error={Boolean(touched.full_name && errors.full_name)}
                            />
                            {touched.full_name && errors.full_name && <span className={classes.error}>{errors.full_name}</span>}

                            <TextField label="Email" variant="outlined" className={classes.input} fullWidth type="email" disabled={Boolean(values.done)}
                                name="email" value={values.email} onChange={handleChange} error={Boolean(touched.email && errors.email)}
                            />
                            {touched.email && errors.email && <span className={classes.error}>{errors.email}</span>}

                            <TextField label="Subject" variant="outlined" className={classes.input} fullWidth disabled={Boolean(values.done)}
                                name="subject" value={values.subject} onChange={handleChange} error={Boolean(touched.subject && errors.subject)}
                            />
                            {touched.subject && errors.subject && <span className={classes.error}>{errors.subject}</span>}

                            <TextField label="Message" variant="outlined" className={classes.input} fullWidth rowsMax={5} multiline rows={5} disabled={Boolean(values.done)}
                                name="message" value={values.message} onChange={handleChange} error={Boolean(touched.message && errors.message)}
                            />
                            {touched.message && errors.message && <span className={classes.error}>{errors.message}</span>}

                            <div className={classes.center}>
                            {errors.captcha && <span className={classes.error}>{errors.captcha}</span>}
                            </div>

                            <div className={classes.center} >
                                <ReCAPTCHA
                                    sitekey="6LfIdqsZAAAAAKYPb7zfn5bQcpu6AmoGbD1sWIYP"
                                    onChange={captchaPassed}
                                    onExpired={captchaExpired}
                                />
                            </div>
                            
                            <Button variant="contained" fullWidth className={classes.input} color="primary" type="submit" disabled={Boolean(values.done)}>
                                {isSubmitting ? <CircularProgress color="inherit" size="1.8em" /> : "Submit"}
                            </Button>

                        </form>
                    </div>
                </CardContent>
            </Card>
        </Container>
    )

}

const Contact = withFormik({
    mapPropsToValues: () => ({
        email: "",
        subject: "",
        message: "",
        full_name: "",
        done: ""
    }),
    validate: values => {
        let errors = {}
        if (values.full_name === "") {
            errors.full_name = "This field is required."
        }
        if (values.email === "") {
            errors.email = "This field is required."
        }
        if (values.subject === "") {
            errors.email = "This field is required."
        }
        if (values.message === "") {
            errors.email = "This field is required."
        }
        return errors
    },
    handleSubmit: (values, { props, resetForm, setValues, setErrors, setSubmitting }) => {
        myaxios.post('contact/', values)
            .then(res => {
                setSubmitting(false)
                resetForm(true)
                setValues({ done: "We have recorded your response, we will be in touch soon." })
            })
            .catch(err => {
                console.log(err)
                setSubmitting(false)
                if (err.response) {
                    setErrors(err.response.data)
                }
            })
    }
})(Form)

export default Contact