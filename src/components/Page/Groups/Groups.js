import React, { useEffect, useState } from 'react';
import Popup from 'reactjs-popup';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useHistory } from 'react-router-dom';

import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import PersonIcon from '@material-ui/icons/Person';
import GroupIcon from '@material-ui/icons/Group';

import './Groups.css';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';

function Groups(props) {
  const [groupName, setGroupName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [member, setMember] = useState('');
  const [addError, setAddError] = useState('');

  const history = useHistory();

  // get user doc
  const uid = firebase.auth().currentUser.uid;
  const userDoc = firebase.firestore().collection('users').doc(uid);

  // get user groups
  const groupsRef = firebase.firestore().collection('groups');
  const groupsQuery = groupsRef.where('members', 'array-contains', uid);
  const [groupsSrc] = useCollectionData(groupsQuery, { idField: 'id' });
  const [groups, setGroups] = useState(undefined);

  // caches given group id
  async function cacheGroup(groupId) {
    await userDoc.update({ group: groupId });
  }

  // validates selected group
  async function validateGroup() {
    // if current group invalid, push empty
    if (groupsSrc && !groupsSrc.some(group => props.group === group.id)) {
      history.push('/home');
    }
  }

  // validate group when groups update
  useEffect(() => {
    validateGroup();
  }, [groupsSrc]); // eslint-disable-line react-hooks/exhaustive-deps

  // sort groups when source changed
  useEffect(() => {
    if (!groupsSrc) {
      setGroups(undefined);
      return;
    }
    const groupsSorted = groupsSrc.slice();
    groupsSorted.sort((a, b) => {
      const valA = props.userData.groups[a.id];
      const valB = props.userData.groups[b.id]
      if (valA === undefined && valB !== undefined) return 1;
      if (valA !== undefined && valB === undefined) return -1;
      if (valA === undefined && valB === undefined) {
        if (a.created < b.created) return -1;
        if (a.created > b.created) return 1;
        return 0;
      }
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
    setGroups(groupsSorted);
  }, [groupsSrc]); // eslint-disable-line react-hooks/exhaustive-deps

  // get usernames data
  const usernamesRef = firebase.firestore().collection('usernames');
  const [usernamesData] = useCollectionData(usernamesRef);

  // selects given group for current user
  async function selectGroup(groupId) {
    props.setGroup(groupId);
    history.push(`/home/${groupId}`);
    await cacheGroup(groupId);
  }

  // creates a group with given name
  async function createGroup() {
    const docRef = await groupsRef.add({
      name: groupName,
      owner: uid,
      members: [uid],
      created: new Date()
    });
    await selectGroup(docRef.id);
  }

  // deletes given group
  async function deleteGroup(group) {
    // delete group cache
    const updateObj = {
      [`channels.${group.id}`]: firebase.firestore.FieldValue.delete(),
      [`groups.${group.id}`]: firebase.firestore.FieldValue.delete()
    };
    if (props.group === group.id) updateObj.group = '';
    await userDoc.update(updateObj);
    // delete all channels
    const batch = firebase.firestore().batch();
    const groupDoc = groupsRef.doc(group.id);
    await groupDoc.collection('channels').get().then(docs => {
      docs.forEach(doc => {
        batch.delete(doc.ref);
      });
    });
    batch.delete(groupDoc); // delete group document
    batch.commit(); // commit batch
  }

  // updates group document in firebase
  async function updateGroup(group) {
    const groupDoc = groupsRef.doc(group.id);
    await groupDoc.update({ name: newGroupName });
  }

  // gets a username from user id
  function getUsername(userId) {
    if (!usernamesData) return null;
    const matches = usernamesData.filter(user => user.uid === userId);
    return matches.length === 0 ? null : matches[0].username;
  }

  // adds member to group
  async function addMember(group) {
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
    const groupDoc = groupsRef.doc(group.id);
    await groupDoc.update({
      members: firebase.firestore.FieldValue.arrayUnion(memberUid)
    });
  }

  // removes given member
  async function removeMember(group, member) {
    // update document in firebase
    const groupDoc = groupsRef.doc(group.id);
    await groupDoc.update({
      members: firebase.firestore.FieldValue.arrayRemove(member)
    });
  }

  // returns abbreviated version of given name
  function abbreviateName(name) {
    const words = name.split(' ').filter(w => w); // split name by spaces
    const letters = words.map(word => word[0]); // get word letters
    return letters.join('').toUpperCase(); // return letters to uppercase
  }

  // updates group orders in firebase
  async function updateGroupOrder() {
    const groupIndexes = {};
    groups.forEach((group, i) => groupIndexes[group.id] = i);
    await userDoc.update({ groups: groupIndexes });
  }

  // swaps group orders
  function reorderGroups(indexA, indexB) {
    const [removed] = groups.splice(indexA, 1);
    groups.splice(indexB, 0, removed);
    updateGroupOrder();
  }

  // called after drag ends
  function onGroupDrag(result) {
    if (!result.destination) return;
    reorderGroups(result.source.index, result.destination.index);
  }

  // if no groups, load
  if (!groups) {
    return (
      <div className="Groups">
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className="Groups">
      <DragDropContext onDragEnd={onGroupDrag}>
        <Droppable droppableId="droppable-channels">
        {
          (provided, snapshot) =>
          <div ref={provided.innerRef} {...provided.droppableProps}>
          {
            groups.map((group, i) =>
            <Draggable
              key={`groups-draggable-${group.id}`}
              draggableId={group.id}
              index={i}
            >
            {
              (provided, snapshot) =>
              <div
                className="draggable-div"
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                <Popup
                  key={`groups-button-${i}`}
                  trigger={
                    <div
                      className={
                        props.group === group.id ? 'group-btn selected' : 'group-btn'
                      }
                      onClick={() => selectGroup(group.id)}
                    >
                      {abbreviateName(group.name)}
                    </div>
                  }
                  on={group.owner === uid ? 'right-click' : ''}
                  position="right center"
                  arrow={false}
                  nested
                >
                  {
                    close => (
                      <>
                        <Popup
                          nested
                          onClose={close}
                          trigger={
                            <EditIcon style={{cursor: 'pointer'}} />
                          }
                          onOpen={() => {
                            setNewGroupName(group.name);
                          }}
                          modal
                        >
                          <div className="modal">
                            <button className="close" onClick={close}>&times;</button>
                            <div className="header">
                              <span>Editing</span>
                              <GroupIcon style={{marginLeft: '5px'}} />
                              <span className="shrink">{group.name}</span>
                            </div>
                            <form
                              onSubmit={e => {
                                e.preventDefault();
                                updateGroup(group);
                                close();
                              }}
                            >
                              <input
                                placeholder="group name"
                                spellCheck="false"
                                value={newGroupName}
                                onChange={e => setNewGroupName(e.target.value)}
                                required
                              />
                              <button
                                type="submit"
                                style={{
                                  marginLeft: '5px', marginTop: '5px',
                                  position: 'relative', top: '4px'
                                }}
                              >
                                <CheckIcon />
                              </button>
                            </form>
                          </div>
                        </Popup>
                        <Popup
                          nested
                          onClose={close}
                          trigger={
                            <GroupIcon style={{cursor: 'pointer'}} />
                          }
                          modal
                        >
                          <div className="modal">
                            <button className="close" onClick={close}>&times;</button>
                            <div className="header">
                              <span>Members of</span>
                              <GroupIcon style={{marginLeft: '5px'}} />
                              <span className="shrink">{group.name}</span>
                            </div>
                            <div style={{marginTop: '5px'}}>
                              {
                                group.members.sort().map((m, i) =>
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
                                        onClick={() => removeMember(group, m)}
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
                            </div>
                            <form
                              onSubmit={e => {
                                e.preventDefault();
                                addMember(group);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <input
                                placeholder="username"
                                spellCheck="false"
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
                              addError &&
                              <p
                                className="error-text"
                                style={{margin: '5px 0'}}
                              >
                                {addError}
                              </p>
                            }
                          </div>
                        </Popup>
                        <Popup
                          nested
                          onClose={close}
                          trigger={
                            <DeleteIcon style={{cursor: 'pointer'}} />
                          }
                          modal
                        >
                          <div className="modal">
                            <button className="close" onClick={close}>&times;</button>
                            <div className="header">
                              <span>Delete</span>
                              <GroupIcon style={{marginLeft: '5px'}} />
                              <span className="shrink">{group.name}</span>?
                            </div>
                            <button
                              onClick={close}
                              style={{
                                padding: '5px 10px', marginTop: '10px'
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => {
                                deleteGroup(group);
                                close();
                              }}
                              style={{
                                padding: '5px 10px', marginTop: '10px', marginLeft: '10px'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </Popup>
                      </>
                    )
                  }
                </Popup>
              </div>
            }
            </Draggable>
          )}
          {provided.placeholder}
          </div>
        }
        </Droppable>
      </DragDropContext>
      <Popup
        trigger={
          <button className="group-btn add-btn">
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
                createGroup();
                close();
              }}>
                <input
                  placeholder="group name"
                  spellCheck="false"
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
