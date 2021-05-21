import React, { useEffect, useState } from 'react';

import SignIn from '../SignIn/SignIn.js';
import Home from '../Home/Home.js';
import Loading from '../Loading/Loading.js';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import { firebaseConfig } from '../../util/firebaseConfig.js';
import { useAuthState } from 'react-firebase-hooks/auth';

import './App.css';

// initialize firebase
firebase.initializeApp(firebaseConfig);

function App() {
  useAuthState(firebase.auth());

  const [loaded, setLoaded] = useState(false);

  const currentUser = firebase.auth().currentUser;

  // set loaded after auth initialization
  useEffect(() => {
    firebase.auth().onAuthStateChanged(() => {
      setLoaded(true);
    })
  }, []);

  return (
    <div className="App">
      {
        loaded ?
        <>
          {
            currentUser ?
            <Home /> :
            <SignIn />
          }
        </> :
        <Loading />
      }
    </div>
  );
}

export default App;
