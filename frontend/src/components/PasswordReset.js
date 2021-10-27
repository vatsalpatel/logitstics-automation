import React, { useEffect } from 'react'

import { useLocation, useHistory, Link } from 'react-router-dom'

import { withFormik } from 'formik'

import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

import { myaxios } from '../utils'

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

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


const Form = (props) => {
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
                                {
                                    values.done
                                        ? <><br/><Link to="/login">Proceed to login.</Link></>
                                        : <></>
                                }
                            </div>

                            {errors.token && <span className={classes.error}>Incorrect email or password</span>}

                            <TextField label="Password" type="password" variant="outlined" className={classes.input} fullWidth disabled={Boolean(values.done)}
                                name="new_password" value={values.new_password} onChange={handleChange} error={Boolean(touched.new_password && errors.new_password && !Boolean(values.done))}
                            />
                            {touched.new_password && errors.new_password && !Boolean(values.done) && <span className={classes.error}>{errors.new_password}</span>}

                            <TextField label="Re-enter Password" type="password" variant="outlined" className={classes.input} fullWidth disabled={Boolean(values.done)}
                                name="password2" value={values.password2} onChange={handleChange} error={Boolean(touched.password2 && errors.password2 && !Boolean(values.done))}
                            />
                            {touched.password2 && errors.password2 && !Boolean(values.done) && <span className={classes.error}>{errors.password2}</span>}

                            <Button variant="contained" fullWidth className={classes.input} color="primary" type="submit" disabled={Boolean(values.done)}>
                                {isSubmitting ? <CircularProgress color="inherit" size="1.8em" /> : "Reset Password"}
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </Container >
    )
}

const FormikForm = withFormik({
    mapPropsToValues: () => {
        return {
            new_password: "",
            password2: "",
            done: ""
        }
    },
    validate: (values) => {
        let errors = {}
        if (values.new_password === "") {
            errors.new_password = "This field can't be blank"
        }
        if (values.password2 === "") {
            errors.password2 = "This field can't be blank"
        }
        if (values.new_password !== values.password2) {
            errors.password2 = "Passwords do not match"
        }
        return errors
    },
    handleSubmit: (values, { props, setSubmitting, setErrors, setValues }) => {
        myaxios.post('auth/users/reset_password_confirm/', {
            uid: props.uid,
            token: props.token,
            new_password: values.new_password
        })
            .then(res => {
                setSubmitting(false)
                setValues({ done: "Your password has been reset", new_password: "", password2: "" })
            })
            .catch(err => {
                console.log(err)
                setSubmitting(false)
                if (err.response) {
                    if (err.response.data.new_password) {
                        setErrors(err.response.data)
                    } else {
                        setErrors({ token: "Invalid URl, Please try again" })
                    }
                }
            })
    }
})(Form)

function PasswordReset(props) {
    let query = useQuery()
    let history = useHistory()
    let uid = query.get('one')
    let token = query.get('two')

    useEffect(() => {
        if (!uid || !token) {
            history.push("/")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Container>
            <FormikForm uid={uid} token={token} />
        </Container>
    )
}

export default PasswordReset;