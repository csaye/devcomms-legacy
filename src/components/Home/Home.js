import React, { useEffect, useState } from 'react';

import Page from '../Page/Page.js';
import Loading from '../Loading/Loading.js';

import firebase from 'firebase/app';
import { useDocumentData } from 'react-firebase-hooks/firestore';

import './Home.css';

function Home() {
  const uid = firebase.auth().currentUser.uid;
  const userDoc = firebase.firestore().collection('users').doc(uid);
  const [userData] = useDocumentData(userDoc);

  const [group, setGroup] = useState(undefined);

  // retrieves current user group id
  async function getGroup() {
    if (!userData) return;
    const groupId = userData.group;
    setGroup(groupId);
  }

  // get group when user data changes
  useEffect(() => {
    getGroup();
  }, [userData]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="Home">
      {
        group !== undefined ?
        <Page group={group} username={userData.username} /> :
        <Loading message="Loading groups..." />
      }
    </div>
  );
}

export default Home;
