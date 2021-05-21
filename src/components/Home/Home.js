import React, { useEffect, useState } from 'react';

import Page from '../Page/Page.js';
import Groups from '../Groups/Groups.js';
import Loading from '../Loading/Loading.js';

import firebase from 'firebase/app';
import { useDocument } from 'react-firebase-hooks/firestore';

import './Home.css';

function Home() {
  const uid = firebase.auth().currentUser.uid;
  const userRef = firebase.firestore().collection('users').doc(uid);
  const [userDoc] = useDocument(userRef);

  const [group, setGroup] = useState(undefined);

  // retrieves current user group
  async function getGroup() {
    if (!userDoc) return;
    // if user doc exists
    if (userDoc.exists) {
      // set current group
      const docData = userDoc.data();
      setGroup(docData.currentGroup);
    // if no user document
    } else {
      // create user document
      await userRef.set({
        currentGroup: '',
        groups: []
      });
    }
  }

  // get group when user data changes
  useEffect(() => {
    getGroup();
  }, [userDoc]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <Loading />
      }
    </div>
  );
}

export default Home;
