import React, { useEffect, useState } from 'react';

import Loading from '../Loading/Loading.js';

import Popup from 'reactjs-popup';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AddIcon from '@material-ui/icons/Add';
import GroupIcon from '@material-ui/icons/Group';
import PersonIcon from '@material-ui/icons/Person';
import DeleteIcon from '@material-ui/icons/Delete';

import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';

import './Groups.css';

function Groups(props) {
  const [groups, setGroups] = useState(undefined);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addError, setAddError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [member, setMember] = useState('');

  const groupsRef = firebase.firestore().collection('groups');
  const groupsQuery = groupsRef.orderBy('name');
  const [allGroups] = useCollectionData(groupsQuery);

  const usersRef = firebase.firestore().collection('users');
  const [usersData] = useCollectionData(usersRef);
  const uid = firebase.auth().currentUser.uid;
  const userRef = usersRef.doc(uid);
  const [userData] = useDocumentData(userRef);
  const ownedQuery = groupsRef.where('owner', '==', uid).orderBy('name');
  const [ownedGroups] = useCollectionData(ownedQuery);

  // updates current user group in firebase
  async function selectGroup(group) {
    await userRef.update({
      currentGroup: group
    });
  }

  // attempts to create a group with given name
  async function createGroup(e) {
    e.preventDefault();

    // invalid characters
    if (groupName.includes('/')) {
      setError('Group name contains invalid characters.');
      return;
    }

    // if group already exists with name
    if (allGroups.some(group =>
      group.name.toLowerCase() === groupName.toLowerCase()
    )) {
      setError('Group with name already exists.');
      return;
    }

    // start loading
    setLoading(true);

    // create group document
    await firebase.firestore().collection('groups').doc(groupName).set({
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

  // deletes group with given name
  async function deleteGroup(group) {
    setLoading(true);
    // delete group doc
    const groupRef = groupsRef.doc(group);
    // delete each subcollection
    const batch = firebase.firestore().batch();
    const subcollections = ['chats', 'goals', 'notes', 'sketches', 'todos'];
    for (const subcollection of subcollections) {
      await groupRef.collection(subcollection).get().then(docs => {
        docs.forEach(doc => {
          batch.delete(doc.ref);
        });
      });
    }
    batch.delete(groupRef); // delete group document
    batch.commit(); // commit batch
    setLoading(false);
  }

  // gets a username from user id
  function getUsername(userId) {
    const matches = usersData.filter(user => user.uid === userId);
    return matches.length === 0 ? null : matches[0].username;
  }

  // adds member to given group
  async function addMember(e, group) {
    e.preventDefault();
    const newMember = member;
    setMember('');
    // retrieve new member uid
    const matches = usersData.filter(user => user.username === newMember);
    if (matches.length === 0) {
      setAddError(`No user @${newMember} found`)
      setTimeout(() => setAddError(''), 2000);
      return;
    }
    const memberUid = matches[0].uid;
    // update document in firebase
    await firebase.firestore().collection('groups').doc(group).update({
      members: firebase.firestore.FieldValue.arrayUnion(memberUid)
    });
  }

  // removes given member from given group
  async function removeMember(group, member) {
    // update document in firebase
    await firebase.firestore().collection('groups').doc(group).update({
      members: firebase.firestore.FieldValue.arrayRemove(member)
    });
  }

  // set current user groups
  async function getGroups() {
    if (!userData || !allGroups) return;
    // retrieve user groups
    const userGroups = allGroups.filter(g => {
      return g.members.includes(uid);
    }).map(g => g.name);
    setGroups(userGroups);
    // update user doc with new groups
    if (userData.groups.length !== userGroups.length) {
      await userRef.update({
        groups: userGroups
      });
    }
  }

  useEffect(() => {
    getGroups();
  }, [userData, allGroups]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="Groups">
      {
        (loading || !groups || !ownedGroups) ?
        <Loading /> :
        <div className="center-box">
          <h1><GroupIcon /> Groups</h1>
          <hr />
          {
            groups.length > 0 &&
            <>
              <h2>Select Group</h2>
              {
                groups.map((g, i) =>
                  <button
                    key={`groupbutton-${i}`}
                    onClick={() => selectGroup(g)}
                    className="group-button"
                  >
                    {g}
                  </button>
                )
              }
            </>
          }
          {
            ownedGroups.length > 0 &&
            <>
              <h2>Edit Group</h2>
              {
                ownedGroups.map((g, i) =>
                  <Popup
                    trigger={
                      <button className="group-button">{g.name}</button>
                    }
                    key={`grouppopup-${i}`}
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
                          Editing
                          <GroupIcon style={{marginLeft: '5px'}} />
                          {g.name}
                          </div>
                          <p style={{margin: '15px 0 5px 0'}}><u>Members</u></p>
                          {
                            g.members.sort().map((m, i) =>
                              <div
                                key={`groupmember-${i}`}
                                style={{
                                  height: '30px',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center'
                                }}
                              >
                                <PersonIcon
                                  style={{

                                  }}
                                /> {getUsername(m)}
                                {
                                  m !== uid &&
                                  <button
                                    onClick={() => removeMember(g.name, m)}
                                    style={{
                                      border: '0',
                                      background: 'transparent',
                                      margin: '0', padding: '0'
                                    }}
                                  >
                                    <DeleteIcon />
                                  </button>
                                }
                              </div>
                            )
                          }
                          <hr />
                          <p style={{margin: '15px 0 5px 0'}}><u>Add member</u></p>
                          <form
                            onSubmit={e => addMember(e, g.name)}
                            style={{
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <input
                              placeholder="username"
                              value={member}
                              onChange={e => setMember(e.target.value)}
                              style={{
                                marginRight: '5px'
                              }}
                              required
                            />
                            <button type="submit"><AddIcon /></button>
                          </form>
                          {
                            addError && <p
                              className="error-text"
                              style={{margin: '5px 0'}}
                              >
                                {addError}
                              </p>
                          }
                          <hr style={{marginBottom: '0'}} />
                          {
                            deleting ?
                            <>
                              <p className="delete-text">Delete group?</p>
                              <button onClick={() => setDeleting(false)} style={{"marginRight": "5px"}}>
                                cancel
                              </button>
                              <button onClick={() => {
                                deleteGroup(g.name);
                                close();
                                setDeleting(false);
                              }}>
                                delete
                              </button>
                            </> :
                            <button
                              className="button"
                              onClick={() => {
                                setDeleting(true);
                              }}
                              style={{
                                marginTop: '10px'
                              }}
                            >
                              <DeleteIcon />
                            </button>
                          }
                        </div>
                      )
                    }
                  </Popup>
                )
              }
            </>
          }
          <form onSubmit={createGroup}>
            <h2>Create Group</h2>
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
            <p>Signed in as @{props.username}</p>
            <button onClick={() => firebase.auth().signOut()} className="sign-out-button">
              <ExitToAppIcon />
            </button>
          </div>
        </div>
      }
    </div>
  );
}

export default Groups;
