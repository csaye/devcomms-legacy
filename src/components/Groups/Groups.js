import React, { useState } from 'react';

import Loading from '../Loading/Loading.js';

import Popup from 'reactjs-popup';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import CheckIcon from '@material-ui/icons/Check';
import AddIcon from '@material-ui/icons/Add';
import GroupIcon from '@material-ui/icons/Group';
import PersonIcon from '@material-ui/icons/Person';
import DeleteIcon from '@material-ui/icons/Delete';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';

import './Groups.css';

function Groups(props) {
  const [groupName, setGroupName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addError, setAddError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [member, setMember] = useState('');

  const uid = firebase.auth().currentUser.uid;
  const groupsRef = firebase.firestore().collection('groups');
  const groupsQuery = groupsRef.where('members', 'array-contains', uid).orderBy('name');
  const [groups] = useCollectionData(groupsQuery, { idField: 'id' });

  const usernamesRef = firebase.firestore().collection('usernames');
  const [usernamesData] = useCollectionData(usernamesRef);

  const userRef = firebase.firestore().collection('users').doc(uid);
  const ownedQuery = groupsRef.where('owner', '==', uid).orderBy('name');
  const [ownedGroups] = useCollectionData(ownedQuery, { idField: 'id' });

  // updates current user group in firebase
  async function selectGroup(groupId) {
    await userRef.update({
      group: groupId
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

    // start loading
    setLoading(true);

    // create group document
    await firebase.firestore().collection('groups').add({
      name: groupName,
      owner: uid,
      members: [uid]
    }).then(doc => {
      // get group id
      const groupId = doc.id;
      // set current user group to this
      firebase.firestore().collection('users').doc(uid).update({
        group: groupId
      });
    });
  }

  // deletes group with given id
  async function deleteGroup(groupId) {
    setLoading(true);
    // delete group doc
    const groupRef = groupsRef.doc(groupId);
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

  // updates group document in firebase
  async function updateGroup(groupId) {
    await groupsRef.doc(groupId).update({
      name: newGroupName
    });
  }

  // gets a username from user id
  function getUsername(userId) {
    const matches = usernamesData.filter(user => user.uid === userId);
    return matches.length === 0 ? null : matches[0].username;
  }

  // adds member to given group
  async function addMember(groupId) {
    const newMember = member;
    setMember('');
    // retrieve new member uid
    const matches = usernamesData.filter(user => user.username === newMember);
    if (matches.length === 0) {
      setAddError(`No user @${newMember} found`)
      setTimeout(() => setAddError(''), 2000);
      return;
    }
    const memberUid = matches[0].uid;
    // update document in firebase
    await firebase.firestore().collection('groups').doc(groupId).update({
      members: firebase.firestore.FieldValue.arrayUnion(memberUid)
    });
  }

  // removes given member from given group
  async function removeMember(groupId, member) {
    // update document in firebase
    await firebase.firestore().collection('groups').doc(groupId).update({
      members: firebase.firestore.FieldValue.arrayRemove(member)
    });
  }

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
                    onClick={() => selectGroup(g.id)}
                    className="group-button"
                  >
                    {g.name}
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
                    onOpen={() => {
                      setNewGroupName(g.name);
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
                            Editing
                            <GroupIcon style={{marginLeft: '5px'}} />
                            {g.name}
                          </div>
                          <form
                            style={{
                              margin: '0 0 20px 0'
                            }}
                            onSubmit={e => {
                              e.preventDefault();
                              updateGroup(g.id);
                              close();
                            }}
                          >
                            <p style={{margin: '10px 0 0 0'}}><u>Group Name</u></p>
                            <input
                              placeholder="group name"
                              value={newGroupName}
                              onChange={e => setNewGroupName(e.target.value)}
                              required
                            />
                            <button
                              type="submit"
                              style={{marginLeft: '5px', position: 'relative', top: '5px'}}
                            >
                              <CheckIcon />
                            </button>
                          </form>
                          <hr />
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
                                <PersonIcon/> {getUsername(m)}
                                {
                                  m !== uid &&
                                  <button
                                    onClick={() => removeMember(g.id, m)}
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
                            onSubmit={e => {
                              e.preventDefault();
                              addMember(g.id);
                            }}
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
                                deleteGroup(g.id);
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
