import React, { useState } from 'react'

import { useHistory } from 'react-router-dom'

import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';

import Contact from './Contact'

const useStyles = makeStyles({
    grid: {
        margin: "4em 0",
    },
    thick: {
        fontWeight: "bolder",
        margin: "2em 0",
        color: "#151719"
    },
    btn: {
        margin: "1.5em 0"
    },
    circle: {
        backgroundColor: "#1065EF",
        borderRadius: "50%",
        display: "inline-block",
        padding: "1em"
    },
    features: {
        padding: "1em",
        margin: "0 3em"
    },
    text: {
        margin: "1em 0",
    },
    textTitle: {
        margin: "1em 0",
        fontWeight: "bold"
    },
    panel: {
        width: "100%"
    },
    center: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "2em",
    }
})


function Home(props) {
    document.title = "Routing Bot"
    const classes = useStyles()
    let history = useHistory()

    const [panel, setPanel] = useState("p1")
    const openPanel = (pid) => {
        setPanel(pid)
    }

    return (
        <Container>
            <Grid container className={classes.grid}>

                <Grid item xs={12} lg={6}>
                    <Typography variant="h3" className={classes.thick}>Route Management,<br /> Made simple</Typography>
                    <Typography variant="subtitle1" className={classes.text}>Delegate the laborious task of planning routes for vehicles.<br /> Automate it simple and elegantly</Typography>
                    <Button variant="contained" color="primary" size="large" className={classes.btn} onClick={() => history.push("/signup")}>Get Started</Button>
                </Grid>

                <Grid item xs={12} lg={6}>
                    <img src="main-image.jpg" alt="Primary" width="600px" />
                </Grid>
            </Grid>

            <Divider />

            <Grid container className={classes.grid}>

                <Grid item xs={12} className={classes.center}>
                    <Typography variant="h4" className={classes.textTitle}>Grow your Business</Typography>
                </Grid>

                <Grid item align="center" xs={11} md={5} lg={3} className={classes.features}>
                    <i className={classes.circle}>
                        <img src="route.svg" alt="Route" width="50px" />
                    </i>
                    <Typography variant="h5" className={classes.textTitle}> Optimized Routes </Typography>
                    <Typography variant="subtitle1" > Automate the tedious and boring process of choosing routes and delivery locations for your vehicles. </Typography>
                </Grid>

                <Grid item align="center" xs={11} md={5} lg={3} className={classes.features}>
                    <i className={classes.circle}>
                        <img src="vehicle.svg" alt="Vehicle" width="50px" />
                    </i>
                    <Typography variant="h5" className={classes.textTitle}> Maximize Efficiency </Typography>
                    <Typography variant="subtitle1"> Get the best routes and maximize efficiency of your fleet of vehicles, reducing fuel cost and delivery time. </Typography>
                </Grid>

                <Grid item align="center" xs={11} md={5} lg={3} className={classes.features}>
                    <i className={classes.circle}>
                        <img src="package.svg" alt="Package" width="50px" />
                    </i>
                    <Typography variant="h5" className={classes.textTitle}> Capacity Based </Typography>
                    <Typography variant="subtitle1"> Specify different capacities for each of your vehicles and get the best route for every one of your vehicle. </Typography>
                </Grid>

            </Grid>

            <Divider />

            <Grid container className={classes.grid}>

                <Typography variant="h5" style={{ marginBottom: "1em" }}>Frequently Asked Questions</Typography>

                <ExpansionPanel square expanded={panel === "p1"} onChange={() => openPanel("p1")} className={classes.panel} >
                    <ExpansionPanelSummary>
                        <Typography variant="h6">Do you offer a trial?</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Typography variant="subtitle1">Currently, we don't offer a trial period directly. If you wish to try out our API. Reach out to us and we will be glad to allow you access for a short time.</Typography>
                    </ExpansionPanelDetails>
                </ExpansionPanel>

                <ExpansionPanel square expanded={panel === "p2"} onChange={() => openPanel("p2")} className={classes.panel} >
                    <ExpansionPanelSummary>
                        <Typography variant="h6">What data do you store?</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Typography variant="subtitle1">We store your email address and your name. We also store the timestamps of when you made a request to our API.</Typography>
                    </ExpansionPanelDetails>
                </ExpansionPanel>

                <ExpansionPanel square expanded={panel === "p3"} onChange={() => openPanel("p3")} className={classes.panel} >
                    <ExpansionPanelSummary>
                        <Typography variant="h6">How do I reach out to you?</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Typography variant="subtitle1">Please fill out the contact form linked to in the footer. We will get back to you as soon as possible.</Typography>
                    </ExpansionPanelDetails>
                </ExpansionPanel>

                <ExpansionPanel square expanded={panel === "p4"} onChange={() => openPanel("p4")} className={classes.panel} >
                    <ExpansionPanelSummary>
                        <Typography variant="h6">How do I cancel my Subscription?</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Typography variant="subtitle1">Please contact us using the form below if you wish to cancel your Subscription.</Typography>
                    </ExpansionPanelDetails>
                </ExpansionPanel>

            </Grid>

            <Divider />

            <Grid container className={classes.grid} >
                <Grid item xs={12}>
                    <Typography variant="h5" className={classes.titleText}>Contact Us</Typography>
                </Grid>
                <Contact />
            </Grid>
        </Container>
    )
}

export default Home