import React, { useState, useEffect } from 'react';
import './App.css';

import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'

import { createMuiTheme, ThemeProvider, makeStyles } from '@material-ui/core/styles'

import { checkAuth, myaxios } from './utils'
import Home from './components/Home'
import Header from './components/Header'
import Signup from './components/Signup'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'
import Activate from './components/Activate'
import PasswordReset from './components/PasswordReset'
import PasswordResetRequest from './components/PasswordResetRequest'
import Documentation from './components/Documentation'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Pricing from './components/Pricing'
import Status from './components/Status';


const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#1065EF"
    }
  },
  typography: {
    fontFamily: "Montserrat"
  }
})

const useStyles = makeStyles({
  app: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  top: {
    flexGrow: 1,
  },
})


function PrivateRoute({ children, ...rest }) {
  let isAuth = checkAuth()
  return (
    <Route {...rest} render={() => isAuth ? children : <Redirect to='/' />} />
  )
}

function App() {

  let classes = useStyles()

  const [user, setUser] = useState({})

  useEffect(() => {
    if (checkAuth()) {
      let tmp = localStorage.getItem('user')
      if (tmp) {
        setUser(JSON.parse(localStorage.getItem('user')))
      } else {
        myaxios.get('auth/users/me/')
          .then(res => {
            localStorage.setItem('user', JSON.stringify(res.data))
            setUser(res.data)
          })
      }
    }
  }, [])

  return (
    <div className={classes.app}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <div className={classes.top}>
            <Header user={user} setUser={setUser} />
            <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/login">
                <Login setUser={setUser} />
              </Route>
              <Route exact path="/signup">
                <Signup setUser={setUser} />
              </Route>
              <Route exact path="/activate">
                <Activate setUser={setUser} />
              </Route>
              <Route exact path="/password" component={PasswordReset} />
              <Route exact path="/reset" component={PasswordResetRequest} />
              <Route exact path="/contact" component={Contact} />
              <Route exact path="/docs" component={Documentation} />
              <Route exact path="/status" component={Status} />
              <Route exact path="/pricing">
                <Pricing user={user} setUser={setUser} />
              </Route>
              <PrivateRoute exact path="/dashboard">
                <Dashboard user={user} setUser={setUser} />
              </PrivateRoute>
              <PrivateRoute exact path="/settings">
                <Settings user={user} setUser={setUser} />
              </PrivateRoute>
            </Switch>
          </div>
          <Footer />
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
