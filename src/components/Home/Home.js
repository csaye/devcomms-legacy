import React, { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import Page from '../Page/Page.js';
import Loading from '../Loading/Loading.js';

import firebase from 'firebase/app';
import { useDocumentData } from 'react-firebase-hooks/firestore';

import './Home.css';

function Home() {
  // retrieve user data
  const uid = firebase.auth().currentUser.uid;
  const userDoc = firebase.firestore().collection('users').doc(uid);
  const [userData] = useDocumentData(userDoc);

  const { groupId, channelId } = useParams();
  const history = useHistory();

  // pulls cached group and channel data
  function pullCached() {
    if (!userData) return;
    // if no group id, pull from firebase
    if (!groupId) {
      if (userData.group) {
        history.push(`/home/${userData.group}`);
      }
    // if group id, pull channel from firebase
    } else {
      if (userData.channels[groupId]) {
        history.push(`/home/${groupId}/${userData.channels[groupId]}`);
      }
    }
  }

  // pull cached group and channel data on start
  useEffect(() => {
    pullCached();
  }, [userData, groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="Home">
      {
        userData ?
        <Page group={groupId} channel={channelId} username={userData.username} /> :
        <Loading message="Loading user..." />
      }
    </div>
  );
}

export default Home;
