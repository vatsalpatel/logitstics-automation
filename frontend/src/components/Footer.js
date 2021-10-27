import React from 'react'

import { Link } from 'react-router-dom'

import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { Link as MUILink } from '@material-ui/core/'
import { makeStyles } from '@material-ui/core/styles'

import Logo from './Logo'

const useStyles = makeStyles({
    link: {
        textDecoration: "none",
        color: "black",
        "&:hover": {
            cursor: "pointer"
        },
        fontFamily: "Montserrat",
        marginRight: "1.5em"
    }
})

function Footer(props) {
    let classes = useStyles()

    return (
        <>
            <Grid container justify="center" alignItems="center" style={{ margin: "1em 0" }}>
                <Grid item sm={4} xs={12} align="center">
                    <Typography variant="caption" >Copyright © 2021</Typography>
                </Grid>
                <Grid item sm={4} xs={12} align="center">
                    <Logo />
                </Grid>
                <Grid item sm={4} xs={12} align="center">
                    <Link className={classes.link} to="/contact" >Contact Us</Link>
                    <MUILink className={classes.link} href="https://github.com/vatsalpatel" >GitHub</MUILink>
                </Grid>
            </Grid>
        </>
    )
}

export default Footer