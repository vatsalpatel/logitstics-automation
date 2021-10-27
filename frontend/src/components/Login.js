import React from 'react'

import { useHistory } from 'react-router-dom'

import { withFormik } from 'formik'

import { makeStyles } from '@material-ui/core/styles';
import { Link } from '@material-ui/core'
import Container from '@material-ui/core/Container'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'

import { checkAuth, myaxios } from '../utils'

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
    }
})

function Form(props) {
    document.title = "Routing Bot | Login"
    let classes = useStyles()
    let history = useHistory()

    if (checkAuth()) {
        history.push("/dashboard")
    }

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
                            {errors.login && <span className={classes.error}>Incorrect email or password</span>}

                            <TextField label="Email" variant="outlined" className={classes.input} fullWidth
                                name="email" value={values.email} onChange={handleChange} error={Boolean(touched.email && errors.email)}
                            />
                            {touched.email && errors.email && <span className={classes.error}>{errors.email}</span>}

                            <TextField label="Password" type="password" variant="outlined" className={classes.input} fullWidth
                                name="password" value={values.password} onChange={handleChange} error={Boolean(touched.password && errors.password)}
                            />
                            {touched.password && errors.password && <span className={classes.error}>{errors.password}</span>}

                            <Button variant="contained" fullWidth className={classes.input} color="primary" type="submit">
                                {isSubmitting ? <CircularProgress color="inherit" size="1.8em" /> : "Log in"}
                            </Button>
                        </form>
                        <Link onClick={() => history.push("/signup")} className={classes.link}>Don't have an account? Sign up</Link>
                        <Link onClick={() => history.push("/reset")} className={classes.link}>Forgot Password</Link>
                    </div>
                </CardContent>
            </Card>
        </Container >
    )
}


const Login = withFormik({
    mapPropsToValues: () => ({
        email: "",
        password: "",
        login: ""
    }),
    validate: (values) => {
        let errors = {}
        if (values.email === "") {
            errors.email = "This field can't be blank"
        }
        if (values.password === "") {
            errors.password = "Thisfield can't be blank"
        }
        return errors
    },
    handleSubmit: (values, { props, setErrors, setSubmitting }) => {
        myaxios.post('auth/token/login/', values)
            .then(res => {
                setSubmitting(false)
                localStorage.setItem("user-token", res.data.auth_token)
            })
            .then(res => {
                myaxios.get('auth/users/me/')
                    .then(res => {
                        localStorage.setItem('user', JSON.stringify(res.data))
                        props.setUser(res.data)
                    })
            })
            .catch(err => {
                if (err.response) {
                    setSubmitting(false)
                    setErrors({ login: "Email and password are incorrect" })
                }
            })
    }
})(Form)

export default Login