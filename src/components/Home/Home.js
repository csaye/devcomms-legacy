import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import Page from '../Page/Page.js';
import Loading from '../Loading/Loading.js';

import firebase from 'firebase/app';
import { useDocumentData, useCollection } from 'react-firebase-hooks/firestore';

import './Home.css';

function Home() {
  const [groupId, setGroupId] = useState(undefined);
  const [channelId, setChannelId] = useState(undefined);

  // retrieve user data
  const uid = firebase.auth().currentUser.uid;
  const userDoc = firebase.firestore().collection('users').doc(uid);
  const [userData] = useDocumentData(userDoc);

  const groupsRef = firebase.firestore().collection('groups');
  const groupsQuery = groupsRef.where('members', 'array-contains', uid);
  const [groupsCollection] = useCollection(groupsQuery);

  const channelsRef = groupsRef.doc(groupId ?? 'null').collection('channels');
  const [channelsCollection] = useCollection(channelsRef);

  const { groupParam, channelParam } = useParams();
  const history = useHistory();

  // attempts to get group id when parameter changes
  async function getGroup() {
    // if group parameter given
    if (groupParam) {
      // if preverified, return
      if (groupParam === groupId) return;
      // if invalid parameter, go home
      const groups = groupsCollection ?? await groupsQuery.get();
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
      const groups = groupsCollection ?? await groupsQuery.get();
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

  // retrieves cached channel
  async function getChannel() {
    // if no group id, clear channel and return
    if (!groupId) {
      setChannelId(undefined);
      return;
    }
    // if group id given, get channel cache
    const channelCache = userData ? userData.channels[groupId] :
    (await userDoc.get()).data().channels[groupId];
    // if channel cached, select cache
    if (channelCache) history.push(`/home/${groupId}/${channelCache}`);
    // if channel not cached, set to no channel
    else setChannelId('');
  }

  // check for channel cache if no channel param
  useEffect(() => {
    if (!channelParam) getChannel();
  }, [groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function setChannel() {
    // if empty parameter, return
    if (!channelParam || !groupId) return;
    // if invalid channel, clear selection and get new channel
    const channels = channelsCollection ?? await channelsRef.get();
    if (!channels.docs.some(channel => channel.id === channelParam)) {
      history.push(`/home/${groupId}`);
      getChannel();
    // if valid channel, set id
    } else setChannelId(channelParam);
  }

  // validate channel id when param or group changes
  useEffect(() => {
    setChannel();
  }, [channelParam, groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="Home">
      {
        userData ?
        <Page
          group={groupId}
          setGroup={setGroupId}
          channel={channelId}
          setChannel={setChannelId}
          userData={userData}
        /> :
        <Loading message="Loading user..." />
      }
    </div>
  );
}

export default Home;
