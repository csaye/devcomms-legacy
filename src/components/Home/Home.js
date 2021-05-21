import React, { useEffect, useState } from 'react';

import Page from '../Page/Page.js';
import Groups from '../Groups/Groups.js';

import firebase from 'firebase/app';
import { useDocumentData } from 'react-firebase-hooks/firestore';

import './Home.css';

function Home() {
  const uid = firebase.auth().currentUser.uid;
  const userRef = firebase.firestore().collection('users').doc(uid);
  const [userData] = useDocumentData(userRef);

  const [group, setGroup] = useState(undefined);

  function getGroup() {
    // if no user data
    if (!userData) {
      // create document
      userRef.set({
        currentGroup: '',
        groups: []
      });
    // if user data, set current group
    } else {
      setGroup(userData.currentGroup);
    }
  }

  // get group when user data changes
  useEffect(() => {
    getGroup();
  }, [userData]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="Home">
      {
        group !== undefined ?
        <>
          {
            group ?
            <Page group={group} /> :
            <Groups />
          }
        </> :
        <p>Loading...</p>
      }
    </div>
  );
}

export default Home;
