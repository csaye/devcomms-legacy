import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import Background from '../Background/Background.js';
import Auth from '../Auth/Auth.js';
import Home from '../Home/Home.js';
import Unknown from '../Unknown/Unknown.js';
import Loading from '../Loading/Loading.js';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import { firebaseConfig } from '../../util/firebaseConfig.js';
import { useAuthState } from 'react-firebase-hooks/auth';

import './App.css';

// initialize firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

function App() {
  useAuthState(firebase.auth());

  const [loaded, setLoaded] = useState(false);

  const authed = firebase.auth().currentUser;

  // set loaded after auth initialization
  useEffect(() => {
    firebase.auth().onAuthStateChanged(() => {
      setLoaded(true);
    })
  }, []);

  return (
    <div className="App">
      <Background />
      {
        loaded ?
        <Router>
          <Switch>
            <Route path="/signin">
              {authed ? <Redirect to="/" /> : <Auth signUp={false} />}
            </Route>
            <Route path="/signup">
              {authed ? <Redirect to="/" /> : <Auth signUp={true} />}
            </Route>
            <Route path="/home/:groupParam/:channelParam">
              {authed ? <Home /> : <Redirect to="/signin" />}
            </Route>
            <Route path="/home/:groupParam">
              {authed ? <Home /> : <Redirect to="/signin" />}
            </Route>
            <Route path="/home">
              {authed ? <Home /> : <Redirect to="/signin" />}
            </Route>
            <Route path="/" exact>
              {authed ? <Redirect to="/home" /> : <Redirect to="/signin" />}
            </Route>
            <Route path="/">
              <Unknown />
            </Route>
          </Switch>
        </Router> :
        <Loading message="Loading auth..." />
      }
    </div>
  );
}

export default App;
