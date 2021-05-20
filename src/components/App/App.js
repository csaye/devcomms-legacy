import React, { useEffect, useState } from 'react';

import Page from '../Page/Page.js';
import SignIn from '../SignIn/SignIn.js';
import Groups from '../Groups/Groups.js';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import { firebaseConfig } from '../../util/firebaseConfig.js';
import { useAuthState } from 'react-firebase-hooks/auth';

import './App.css';

firebase.initializeApp(firebaseConfig);

function App() {
  useAuthState(firebase.auth());

  const currentUser = firebase.auth().currentUser;

  const [group, setGroup] = useState(undefined);

  async function getGroup() {
    const uid = currentUser.uid;
    const userRef = firebase.firestore().collection('users').doc(uid);
    await userRef.get().then(doc => {
      if (doc.exists) {
        const docData = doc.data();
        setGroup(docData.currentGroup);
      } else {
        userRef.set({
          currentGroup: ''
        });
        setGroup('');
      }
    });
  }

  useEffect(() => {
    if (currentUser) getGroup();
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="App">
      {
        currentUser ?
        <>
          {
            group === undefined ?
            <p>Loading...</p> :
            <>
              {
                group ?
                <Page group={group} /> :
                <Groups />
              }
            </>
          }
        </> :
        <SignIn />
      }
    </div>
  );
}

export default App;
