import React from 'react'

import { useHistory } from 'react-router-dom'

import { withFormik } from 'formik';

import { makeStyles } from '@material-ui/core/styles';
import { Link } from '@material-ui/core'
import Container from '@material-ui/core/Container'
import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

import { CountryRegionData } from 'react-country-region-selector';

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
    document.title = "Routing Bot | Signup"
    let classes = useStyles()
    let history = useHistory()
    let regions = []

    const {
        errors,
        values,
        touched,
        handleChange,
        handleSubmit,
        isSubmitting
    } = props

    if (checkAuth()) {
        history.push("/dashboard")
    }

    if (values.country) {
        regions = CountryRegionData.filter(c => c[1] === values.country)[0][2].split('|')
    }

    return (
        <Container maxWidth="sm">
            <Card variant="outlined">
                <CardContent>
                    <div className={classes.wrapper}>
                        <form onSubmit={handleSubmit}>
                            {errors.login && <span className={classes.error}>Incorrect email or password</span>}

                            <TextField label="Email" variant="outlined" className={classes.input} fullWidth
                                name="email" value={values.email} onChange={handleChange} error={Boolean(touched.password && errors.email)}
                            />
                            {touched.email && errors.email && <span className={classes.error}>{errors.email}</span>}

                            <TextField label="Password" type="password" variant="outlined" className={classes.input} fullWidth
                                name="password" value={values.password} onChange={handleChange} error={Boolean(touched.password && errors.password)}
                            />
                            {touched.password && errors.password && <span className={classes.error}>{errors.password}</span>}

                            <TextField label="First Name" variant="outlined" className={classes.input} fullWidth
                                name="first_name" value={values.first_name} onChange={handleChange} error={Boolean(touched.first_name && errors.first_name)}
                            />
                            {touched.first_name && errors.first_name && <span className={classes.error}>{errors.first_name}</span>}

                            <TextField label="Last Name" variant="outlined" className={classes.input} fullWidth
                                name="last_name" value={values.last_name} onChange={handleChange} error={Boolean(touched.last_name && errors.last_name)}
                            />
                            {touched.last_name && errors.last_name && <span className={classes.error}>{errors.last_name}</span>}

                            <TextField label="Address" variant="outlined" className={classes.input} fullWidth
                                name="line1" value={values.line1} onChange={handleChange} error={Boolean(touched.line1 && errors.line1)}
                            />
                            {touched.line1 && errors.line1 && <span className={classes.error}>{errors.line1}</span>}

                            <TextField label="City" variant="outlined" className={classes.input} fullWidth
                                name="city" value={values.city} onChange={handleChange} error={Boolean(touched.city && errors.city)}
                            />
                            {touched.city && errors.city && <span className={classes.error}>{errors.city}</span>}

                            <FormControl variant="outlined" fullWidth>
                                <InputLabel>Country</InputLabel>
                                <Select
                                    native
                                    name="country"
                                    value={values.country}
                                    onChange={handleChange}
                                    className={classes.input}
                                    error={Boolean(touched.country && errors.country)}
                                >
                                    <option value="" label="" />
                                    {
                                        CountryRegionData.map(c => <option value={c[1]} key={c[1]}>{c[0]}</option>)
                                    }
                                </Select>
                            </FormControl>
                            {touched.country && errors.country && <span className={classes.error}>{errors.country}</span>}

                            <FormControl variant="outlined" fullWidth>
                                <InputLabel>State/Region</InputLabel>
                                <Select
                                    native
                                    name="state"
                                    value={values.state}
                                    onChange={handleChange}
                                    className={classes.input}
                                    disabled={!Boolean(values.country)}
                                    error={Boolean(touched.state && errors.state)}
                                >
                                    <option value="" label="" />
                                    {
                                        regions
                                            ? regions.map(r => <option value={r.split('~')[0]} key={r}>{r.split('~')[0]}</option>)
                                            : <></>
                                    }
                                </Select>
                            </FormControl>
                            {touched.state && errors.state && <span className={classes.error}>{errors.state}</span>}

                            <TextField label="Postal Code" variant="outlined" className={classes.input} fullWidth
                                name="postal" value={values.postal} onChange={handleChange} error={Boolean(touched.postal && errors.postal)}
                            />
                            {touched.postal && errors.postal && <span className={classes.error}>{errors.postal}</span>}

                            <Button variant="contained" fullWidth className={classes.input} color="primary" type="submit">
                                {isSubmitting ? <CircularProgress color="inherit" size="1.8em" /> : "Sign up"}
                            </Button>
                        </form>
                        <Link onClick={() => history.push("/login")} className={classes.link}>Already have an account? Login</Link>
                    </div>
                </CardContent>
            </Card>
        </Container>
    )
}

const Signup = withFormik({
    mapPropsToValues: () => ({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        line1: "",
        city: "",
        state: "",
        country: "",
        postal: ""
    }),
    validate: (values) => {
        let errors = {}
        if (values.email === "") {
            errors.email = "This field can't be blank"
        }
        if (values.password === "") {
            errors.password = "This field can't be blank"
        }
        if (values.first_name === "") {
            errors.first_name = "This field can't be blank"
        }
        if (values.last_name === "") {
            errors.last_name = "This field can't be blank"
        }
        if (values.line1 === "") {
            errors.line1 = "This field can't be blank"
        }
        if (values.city === "") {
            errors.city = "This field can't be blank"
        }
        if (values.state === "") {
            errors.state = "Select a State/Region"
        }
        if (values.country === "") {
            errors.country = "Select a Country"
        }
        if (values.postal === "") {
            errors.postal = "This field can't be blank"
        }
        return errors
    },
    handleSubmit: (values, { props, setSubmitting, setErrors }) => {
        myaxios.post('auth/users/', {
            email: values.email,
            username: values.email,
            password: values.password,
            first_name: values.first_name,
            last_name: values.last_name,
            address: {
                line1: values.line1,
                city: values.city,
                state: values.state,
                country: values.country,
                postal_code: values.postal
            }
        })
            .then(res => {
                setSubmitting(false)
                myaxios.post('auth/token/login/', { email: values.email, password: values.password })
                    .then(res => {
                        localStorage.setItem("user-token", res.data.auth_token)
                        myaxios.post('customer/', {
                            email: values.email,
                            address: {
                                line1: values.line1,
                                city: values.city,
                                state: values.state,
                                country: values.country,
                                postal_code: values.postal
                            }
                        })
                            .then(
                                myaxios.get('auth/users/me/')
                                    .then(res => {
                                        localStorage.setItem('user', JSON.stringify(res.data))
                                        props.setUser(res.data)
                                    })
                                    .catch(err => console.log(err))
                            )
                            .catch(err => console.log(err))
                    })
                    .then(res => {
                        myaxios.post('resend/', { email: values.email })
                            .catch(err => console.log(err))
                    })
                    .catch(err => console.log(err))
            })
            .catch(err => {
                console.log(err)
                if (err.response) {
                    setErrors(err.response.data)
                }
            })
    }
})(Form)

export default Signup