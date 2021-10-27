import React, { useEffect, useState } from 'react'

import { useLocation, useHistory, Link } from 'react-router-dom'

import { myaxios } from '../utils'

import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'

import { makeStyles } from '@material-ui/core/styles';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const useStyles = makeStyles({
    link: {
        '&:hover': {
            cursor: "pointer",
            textDecoration: "underline",
        },
        textDecoration: "none",
        margin: "0.5em 0"
    }
})

const Activate = (props) => {
    let query = useQuery()
    let history = useHistory()
    const classes = useStyles()

    useEffect(() => {
        let uid = query.get('one')
        let token = query.get('two')
        if (uid && token) {
            myaxios.post('auth/users/activation/', {
                uid: query.get('one'),
                token: query.get('two')
            })
                .then(res => {
                    setLoading(false)
                    setDone(true)
                    myaxios.get('auth/users/me/')
                        .then(res => {
                            localStorage.setItem('user', JSON.stringify(res.data))
                            props.setUser(res.data)
                            history.push("/dashboard")
                        })
                })
                .catch(err => {
                    setLoading(false)
                    console.log(err)
                })
        } else {
            history.push("/")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const [loading, setLoading] = useState(true)
    const [done, setDone] = useState(false)

    return (
        <Container>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "5em" }}>
                {loading
                    ? <>"We are activating your account" <CircularProgress size="1em" /></>
                    : done
                        ? <Typography>Your account has been activated. Proceed to <Link to="/login" className={classes.link} >Login</Link></Typography>
                        : <Typography>Activation Failed. Try sending new activation link.</Typography>

                }
            </div>
        </Container>
    )
}

export default Activate;