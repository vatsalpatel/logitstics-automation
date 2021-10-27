import React, { useEffect, useState } from 'react'

import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress'
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import { green, red } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';

import { myaxios } from '../utils'


const useStyles = makeStyles({
    running: {
        color: green[500]
    },
    down: {
        color: red[500]
    },
    headerCard: {
        borderColor: "orange",
        marginBottom: "2em"
    }
})


function Status(props) {
    document.title = "Routing Bot | Status"
    let classes = useStyles()
    const [status, setStatus] = useState('Loading...')

    useEffect(() => {
        myaxios.post(process.env.REACT_APP_API_URL, {
            api_key: "status"
        })
            .then(() => setStatus("Running..."))
            .catch(() => setStatus("Down..."))
    }, [])

    return (
        <>
            <Container maxWidth="sm">
                {status === "Down..."
                    ? <Card variant="outlined" className={classes.headerCard}>
                        <CardContent>
                            <Typography color="error" align="center">
                                There is an outage. We are investigating the issue and we will be back as soon as possible. Please check back later.
                    </Typography>
                        </CardContent>
                    </Card>
                    : <></>
                }
            </Container>
            <Container maxWidth="xs">
                <Card variant="outlined">
                    <CardContent>
                        <Grid container align="center" justify="center">
                            <Grid item xs={6}>
                                <Typography variant="h6">API Status</Typography>
                                <Typography variant="h5" className={status === "Running..." ? classes.running : status === "Down..." ? classes.down : null} >{status}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                {status === "Loading..."
                                    ? <CircularProgress style={{ paddingTop: "0.5em" }} />
                                    : status === "Running..."
                                        ? <CheckIcon className={classes.running} style={{ paddingTop: "0.5em" }} fontSize="large" />
                                        : <CloseIcon className={classes.down} style={{ paddingTop: "0.5em" }} fontSize="large" />}
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Container>
        </>
    )
}

export default Status