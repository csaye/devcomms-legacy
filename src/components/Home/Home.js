import React, { useEffect, useState } from 'react';

import Page from '../Page/Page.js';
import Groups from '../Groups/Groups.js';
import Loading from '../Loading/Loading.js';

import firebase from 'firebase/app';
import { useDocumentData } from 'react-firebase-hooks/firestore';

import './Home.css';

function Home() {
  const uid = firebase.auth().currentUser.uid;
  const userRef = firebase.firestore().collection('users').doc(uid);
  const [userData] = useDocumentData(userRef);

  const [groupId, setGroupId] = useState(undefined);
  const [groupName, setGroupName] = useState(undefined);

  // retrieves current user group id and name
  async function getGroup() {
    if (!userData) return;
    const gId = userData.currentGroup;
    setGroupId(gId);
    if (!gId) return;
    // retrieve group name from doc at group id
    await firebase.firestore().collection('groups').doc(gId).get().then(doc => {
      const docData = doc.data();
      const gName = docData.name;
      setGroupName(gName);
    })
  }

  // get group when user data changes
  useEffect(() => {
    getGroup();
  }, [userData]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="Home">
      {
        groupId !== undefined ?
        <>
          {
            groupId ?
            <Page groupId={groupId} groupName={groupName} username={userData.username} /> :
            <Groups username={userData.username} />
          }
        </> :
        <Loading />
      }
    </div>
  );
}

export default Home;
