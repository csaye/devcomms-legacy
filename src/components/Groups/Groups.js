import React, { useEffect, useState } from 'react';

import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';

import './Groups.css';

function Groups() {
  const [groups, setGroups] = useState(undefined);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');

  const groupsRef = firebase.firestore().collection('groups');
  const [allGroups] = useCollectionData(groupsRef);

  const uid = firebase.auth().currentUser.uid;
  const userRef = firebase.firestore().collection('users').doc(uid);

  // updates current user group in firebase
  async function selectGroup(group) {
    await userRef.update({
      currentGroup: group
    });
  }

  // attempts to create a group with given name
  async function createGroup(e) {
    e.preventDefault();
    // if group already exists with name
    if (allGroups.some(group =>
      group.name.toLowerCase() === groupName.toLowerCase()
    )) {
      setError('Group with name already exists.');
      return;
    }

    // create group document
    await groupsRef.add({
      name: groupName,
      owner: uid,
      members: [uid]
    });

    // set current user group to this
    await firebase.firestore().collection('users').doc(uid).update({
      currentGroup: groupName,
      groups: firebase.firestore.FieldValue.arrayUnion(groupName)
    });
  }

  // retrieves current user groups from firebase
  async function getGroups() {
    await userRef.get().then(doc => {
      const docData = doc.data();
      setGroups(docData.groups);
    });
  }

  useEffect(() => {
    getGroups();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="Groups">
      <p>Signed in as {firebase.auth().currentUser.displayName}</p>
      <button onClick={() => firebase.auth().signOut()} className="sign-out-button">
        <ExitToAppIcon />
      </button>
      <h1>Select Group</h1>
      {
        groups ?
        groups.map((g, i) =>
          <button
            key={`groupbutton-${i}`}
            onClick={() => selectGroup(g)}
            className={`group-${i}`}
          >
            {g}
          </button>
        ) :
        <p>Retrieving groups...</p>
      }
      <form onSubmit={createGroup}>
        <input
          placeholder="group name"
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
          required
        />
        <button type="submit">Create Group</button>
      </form>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default Groups;
