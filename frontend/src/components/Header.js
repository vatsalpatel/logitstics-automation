import React, { useState } from 'react'

import { Link, useHistory } from 'react-router-dom'

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DashboardIcon from '@material-ui/icons/Dashboard';
import SettingsIcon from '@material-ui/icons/Settings';
import ExitToAppSharpIcon from '@material-ui/icons/ExitToAppSharp';
import AccountBoxSharpIcon from '@material-ui/icons/AccountBoxSharp';

import { checkAuth } from '../utils'
import Logo from './Logo'



const useStyles = makeStyles({
    toolbar: {
        display: "flex",
        color: "black",
    },
    left: {
        flexGrow: 1,
        marginLeft: "2em"
    },
    link: {
        textDecoration: "none",
        color: "black",
        marginRight: "2em",
        fontFamily: "Montserrat",
    },
    button: {
        marginRight: "2em"
    }
})

function Header(props) {
    let history = useHistory()
    let classes = useStyles()

    const { user } = props

    const [anchorEl, setAnchorEl] = useState(null)
    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null)
    }

    const logout = () => {
        localStorage.clear()
        props.setUser()
        history.push("/")
    }

    return (
        <Grid container>
            <AppBar position="static" style={{ backgroundColor: "white", boxShadow: "none" }}>
                <Toolbar className={classes.toolbar}>
                    <div className={classes.left}>
                        <Link to="/" className={classes.link}><Logo /></Link>
                    </div>
                    <div className={classes.right}>
                        <Link to="/status" className={classes.link} >Status</Link>
                        <Link to="/docs" className={classes.link} >Documentation</Link>
                        <Link to="/pricing" className={classes.link} >Pricing</Link>
                        {checkAuth()
                            ? <>
                                <Button size="large" color="primary" variant="outlined" onClick={handleClick} className={classes.button} startIcon={<AccountBoxSharpIcon />}>
                                    {user.first_name} {user.last_name} <ExpandMoreIcon />
                                </Button>
                                <Menu
                                    anchorEl={anchorEl}
                                    keepMounted
                                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                                    transformOrigin={{ vertical: "top", horizontal: "center" }}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                    getContentAnchorEl={null}
                                >
                                    <MenuItem onClick={() => { handleClose(); history.push("/dashboard") }}>
                                        <DashboardIcon /> Dashboard
                                    </MenuItem>
                                    <MenuItem onClick={() => { handleClose(); history.push("/settings") }}>
                                        <SettingsIcon /> Settings
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={() => { handleClose(); logout() }}>
                                        <ExitToAppSharpIcon /> Logout
                                    </MenuItem>
                                </Menu>
                            </>
                            : <>
                                <Button variant="outlined" color="primary" size="large" className={classes.button} onClick={() => history.push("/login")}>Login</Button>
                                <Button variant="contained" color="primary" size="large" className={classes.button} onClick={() => history.push("/signup")}>Sign up</Button>
                            </>
                        }
                    </div>
                </Toolbar>
            </AppBar>
        </Grid>
    )
}

export default Header