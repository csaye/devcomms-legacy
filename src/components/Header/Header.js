import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PersonIcon from '@material-ui/icons/Person';
import GroupIcon from '@material-ui/icons/Group';

import firebase from 'firebase/app';

import { useDocumentData } from 'react-firebase-hooks/firestore';

import logo from '../../img/logo.png';
import './Header.css';

function Header(props) {
  const groupDoc = firebase.firestore().collection('groups').doc(props.group);
  const [groupData] = useDocumentData(groupDoc);

  // exits current group
  async function exitGroup() {
    const uid = firebase.auth().currentUser.uid;
    // set current group to empty string
    await firebase.firestore().collection('users').doc(uid).update({
      group: ''
    });
  }

  return (
    <div className="Header">
      <h1>Devcomms</h1>
      <img className="logo-img" src={logo} alt="logo" />
      <span className="flex-grow" />
      <PersonIcon className="header-icon" />@{props.username}
      <GroupIcon className="header-icon" />{groupData ? groupData.name : '...'}
      {
        (groupData && groupData.owner === uid) &&
        <Popup
          trigger={
            <button className="group-button clean-btn">
              <EditIcon />
            </button>
          }
          onOpen={() => {
            setNewGroupName(groupData.name);
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
                  {groupData.name}
                </div>
                <form
                  style={{
                    margin: '0 0 20px 0'
                  }}
                  onSubmit={e => {
                    e.preventDefault();
                    updateGroup();
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
                  groupData.members.sort().map((m, i) =>
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
                          onClick={() => removeMember(m)}
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
                    addMember();
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
                      deleteGroup();
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
      }
      <button onClick={exitGroup} className="sign-out-button clean-btn">
        <ExitToAppIcon />
      </button>
    </div>
  );
}

export default Header;
