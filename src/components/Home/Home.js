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
  const [groupsCol] = useCollection(groupsQuery);

  const channelsRef = groupsRef.doc(groupId ?? 'null').collection('channels');
  const [channelsCol] = useCollection(channelsRef);

  const { groupParam, channelParam } = useParams();
  const history = useHistory();

  // returns whether id is one of a valid group
  async function isValidGroup(id) {
    // get groups
    const groups = await groupsQuery.get();
    // return whether any group where id matches
    return groups.docs.some(g => g.id === id);
  }

  // sets group id from current group param
  async function getGroupFromParam() {
    // if already set, return
    if (groupParam === groupId) return;
    // if valid parameter, set group id
    if (await isValidGroup(groupParam)) setGroupId(groupParam);
    // if invalid parameter, go home
    else history.push('/home');
  }

  // gets group id from current group cache
  async function getGroupFromCache() {
    // get group cache
    const groupCache = userData ? userData.group :
    (await userDoc.get()).data().group;
    // if group cache
    if (groupCache) {
      // if valid cache, set cache
      if (await isValidGroup(groupCache)) setGroupId(groupCache);
      // if invalid cache, clear cache
      else setGroupId(null);
    }
    // if no group cache, clear group id
    else setGroupId(null);
  }

  // attempts to get group id when parameter changes
  function getGroup() {
    // if group parameter given, pull from param
    if (groupParam) getGroupFromParam();
    // if no group parameter given, pull from cache
    else getGroupFromCache();
  }

  // get group id when group param changes
  useEffect(() => {
    getGroup();
  }, [groupParam]); // eslint-disable-line react-hooks/exhaustive-deps

  // returns whether id is one of a valid channel
  async function isValidChannel(id) {
    const channels = await channelsRef.get();
    return channels.docs.some(c => c.id === id);
  }

  // sets channel id from current channel param
  async function getChannelFromParam() {
    // if already set, return
    if (channelParam === channelId) return;
    // if valid parameter, set channel id
    if (await isValidChannel(channelParam)) setChannelId(channelParam);
    // if invalid parameter, go to group page
    else history.push(`/home/${groupId}`);
  }

  // gets channel id from current channel cache
  async function getChannelFromCache() {
    // get channel cache
    const channelCache = userData ? userData.channels[groupId] :
    (await userDoc.get()).data().channels[groupId];
    // if channel cache
    if (channelCache) {
      // if valid cache, set cache
      if (await isValidChannel(channelCache)) setChannelId(channelCache);
      // if invalid cache, clear cache
      else setChannelId(null);
    // if no channel cache, clear channel id
    } else setChannelId(null);
  }

  // attempts to get channel id when group id or channel param changes
  async function getChannel() {
    // if no group id, set channel to loading
    if (!groupId) setChannelId(undefined);
    // if group id and channel, get from param
    else if (channelParam) getChannelFromParam();
    // if group id but no channel, get from cache
    else getChannelFromCache();
  }

  // get channel id when param changes
  useEffect(() => {
    getChannel();
  }, [channelParam]); // eslint-disable-line react-hooks/exhaustive-deps

  // clear channel and get new when group changes
  useEffect(() => {
    setChannelId(undefined)
    getChannel();
  }, [groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  // validates current group
  async function validateGroup() {
    // if no group selected, return
    if (!groupId) return;
    // if invalid group selected, select none
    if (!(await isValidGroup(groupId))) setGroupId(null);
  }

  // when groups change, validate group
  useEffect(() => {
    validateGroup();
  }, [groupsCol]); // eslint-disable-line react-hooks/exhaustive-deps

  // validates current channel
  async function validateChannel() {
    // if no channel selected, return
    if (!channelId) return;
    // if invalid channel selected, select none
    if (!(await isValidChannel(channelId))) setChannelId(null);
  }

  // when channels change, validate channel
  useEffect(() => {
    validateChannel();
  }, [channelsCol]); // eslint-disable-line react-hooks/exhaustive-deps

  // called when group changes
  async function onGroupChange() {
    // cache group
    await userDoc.update({ group: groupId });
    // navigate to group on router if changed
    if (groupParam !== groupId) {
      history.push(groupId ? `/home/${groupId}` : '/home');
    }
  }

  // on group change
  useEffect(() => {
    // update if not loading group
    if (groupId !== undefined) onGroupChange();
  }, [groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  // called when channel changes
  async function onChannelChange() {
    // cache channel
    const channelCache = channelId ? channelId :
    firebase.firestore.FieldValue.delete();
    await userDoc.update({ [`channels.${groupId}`]: channelCache });
    // navigate to channel on router
    history.push(
      groupId ?
      channelId ?
      `/home/${groupId}/${channelId}` :
      `/home/${groupId}` :
      '/home'
    );
  }

  // on channel change
  useEffect(() => {
    // update if not loading channel
    if (channelId !== undefined) onChannelChange();
  }, [channelId]); // eslint-disable-line react-hooks/exhaustive-deps

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
