import React, { useState } from 'react';

import Popup from 'reactjs-popup';
import AddIcon from '@material-ui/icons/Add';
import GroupIcon from '@material-ui/icons/Group';

import './Groups.css';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';

function Groups(props) {
  const [groupName, setGroupName] = useState('');

  // get user doc
  const uid = firebase.auth().currentUser.uid;
  const userDoc = firebase.firestore().collection('users').doc(uid);

  // get user groups
  const groupsRef = firebase.firestore().collection('groups');
  const groupsQuery = groupsRef.where('members', 'array-contains', uid).orderBy('name');
  const [groups] = useCollectionData(groupsQuery, { idField: 'id' });

  // selects given group for current user
  async function selectGroup(group) {
    await userDoc.update({
      group: group.id
    });
  }

  // creates a group with given name
  async function createGroup() {
    // create group document
    await groupsRef.add({
      name: groupName,
      owner: uid,
      members: [uid]
    }).then(doc => {
      // get group id
      const groupId = doc.id;
      // set current user group to this
      userDoc.update({
        group: groupId
      });
    });
  }

  if (!groups) {
    return (
      <div className="Groups" />
    );
  }

  return (
    <div className="Groups">
      {
        groups.map((group, i) =>
          <button
            className={
              props.group === group.id ? 'group-btn selected' : 'group-btn'
            }
            onClick={() => selectGroup(group)}
          >
            {group.name}
          </button>
        )
      }
      <Popup
        trigger={
          <button className="group-btn">
            <AddIcon />
          </button>
        }
        onOpen={() => {
          setGroupName('');
        }}
        modal
      >
        {
          close => (
            <div className="modal">
              <button className="close" onClick={close}>&times;</button>
              <div
                className="header"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                New Group
                <GroupIcon style={{marginLeft: '5px'}} />
              </div>
              <form onSubmit={e => {
                e.preventDefault();
                createGroup().then(close);
              }}>
                <input
                  placeholder="group name"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  required
                />
                <button
                  className="clean-btn"
                  style={{
                    marginLeft: '5px', marginTop: '5px',
                    position: 'relative', top: '4px'
                  }}
                >
                  <AddIcon />
                </button>
              </form>
            </div>
          )
        }
      </Popup>
    </div>
  );
}

export default Groups;
