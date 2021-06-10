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
      <button onClick={exitGroup} className="sign-out-button clean-btn">
        <ExitToAppIcon />
      </button>
    </div>
  );
}

export default Header;
