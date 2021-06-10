import './Sidebar.css';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';

function Sidebar() {
  const uid = firebase.auth().currentUser.uid;
  const userRef = firebase.firestore().collection('users').doc(uid);

  const groupsRef = firebase.firestore().collection('groups');
  const groupsQuery = groupsRef.where('members', 'array-contains', uid).orderBy('name');
  const [groups] = useCollectionData(groupsQuery, { idField: 'id' });

  // selects given group for current user
  async function selectGroup(group) {
    await userRef.update({
      group: group.id
    });
  }

  if (!groups) {
    return (
      <div className="Sidebar" />
    );
  }

  return (
    <div className="Sidebar">
      {
        groups.map((group, i) =>
          <button
            className="group-btn"
            key={`sidebar-groupdiv-${i}`}
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
                Create New Group
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
                <button className="create-button clean-btn" type="submit">
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

export default Sidebar;
