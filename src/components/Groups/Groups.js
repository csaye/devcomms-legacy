import React, { useEffect, useState } from 'react';

import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AddIcon from '@material-ui/icons/Add';
import GroupIcon from '@material-ui/icons/Group';

import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
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
  const [userData] = useDocumentData(userRef);

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

  // set current user groups
  async function getGroups() {
    if (!userData) return;
    setGroups(userData.groups);
  }

  useEffect(() => {
    getGroups();
  }, [userData]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="Groups">
      <div className="center-box">
        <h1><GroupIcon /> Groups</h1>
        <hr />
        <h2 className="select-text">Select Group</h2>
        {
          groups ?
          <>
            {
              groups.length > 0 ?
              groups.map((g, i) =>
                <button
                  key={`groupbutton-${i}`}
                  onClick={() => selectGroup(g)}
                  className="group-button"
                >
                  {g}
                </button>
              ) :
              <p>No groups</p>
            }
          </> :
          <p>Retrieving groups...</p>
        }
        <form onSubmit={createGroup}>
          <h2 className="create-text">Create Group</h2>
          <div>
            <input
              placeholder="group name"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              required
            />
            <button className="create-button" type="submit">
              <AddIcon />
            </button>
          </div>
        </form>
        {error && <p className="error-text">{error}</p>}
        <hr />
        <div>
          <p>Signed in as {firebase.auth().currentUser.displayName}</p>
          <button onClick={() => firebase.auth().signOut()} className="sign-out-button">
            <ExitToAppIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Groups;
