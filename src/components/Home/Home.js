import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import Page from '../Page/Page.js';
import Loading from '../Loading/Loading.js';

import firebase from 'firebase/app';
import { useDocumentData } from 'react-firebase-hooks/firestore';

import './Home.css';

function Home() {
  const [groupId, setGroupId] = useState(undefined);
  const [channelId, setChannelId] = useState(undefined);

  // retrieve user data
  const uid = firebase.auth().currentUser.uid;
  const userDoc = firebase.firestore().collection('users').doc(uid);
  const [userData] = useDocumentData(userDoc);

  const groupsRef = firebase.firestore().collection('groups');
  const groupDocs = groupsRef.where('members', 'array-contains', uid);

  const { groupParam, channelParam } = useParams();
  const history = useHistory();

  // attempts to get group id when parameter changes
  async function getGroup() {
    // if group parameter given
    if (groupParam) {
      // if invalid parameter, go home
      const groups = await groupDocs.get();
      if (!groups.docs.some(group => group.id === groupParam)) {
        history.push('/home');
      // if valid parameter, set group id
      } else setGroupId(groupParam);
    // if no group parameter given
    } else {
      // get group cache
      const groupCache = userData ? userData.group :
      (await userDoc.get()).data().group;
      // set undefined and return if no cache
      if (!groupCache) {
        setGroupId(undefined);
        return;
      }
      // if invalid cache, clear it
      const groups = await groupDocs.get();
      if (!groups.docs.some(group => group.id === groupCache)) {
        await userDoc.update({ group: '' });
        setGroupId(undefined);
      // if valid cache, set group id
      } else {
        setGroupId(groupCache);
        history.push(`/home/${groupCache}`);
      }
    }
  }

  // get group id when group param changes
  useEffect(() => {
    getGroup();
  }, [groupParam]); // eslint-disable-line react-hooks/exhaustive-deps

  // gets cached channel when group id changes
  async function getChannel() {
    // if no group id, clear channel and return
    if (!groupId) {
      setChannelId(undefined);
      return;
    }
    // if channel param already set, return
    if (channelParam) return;
    // if group id given, get channel cache
    const channelCache = userData ? userData.channels[groupId] :
    (await userDoc.get()).data().channels[groupId];
    // if channel cached, select cache
    if (channelCache) history.push(`/home/${groupId}/${channelCache}`);
    // if channel not cached, set to no channel
    else setChannelId('');
  }

  // check for channel cache when group id changes
  useEffect(() => {
    getChannel();
  }, [groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  // change channel id when param changes
  useEffect(() => {
    if (channelParam) setChannelId(channelParam);
  }, [channelParam]);

  return (
    <div className="Home">
      {
        userData ?
        <Page
          group={groupId}
          setGroup={setGroupId}
          channel={channelId}
          userData={userData}
        /> :
        <Loading message="Loading user..." />
      }
    </div>
  );
}

export default Home;
