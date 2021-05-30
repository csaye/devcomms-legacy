import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PersonIcon from '@material-ui/icons/Person';
import GroupIcon from '@material-ui/icons/Group';

import firebase from 'firebase/app';

import logo from '../../img/logo.png';
import './Header.css';

function Header(props) {
  // exists current group
  async function exitGroup() {
    const uid = firebase.auth().currentUser.uid;
    // set current group to empty string
    await firebase.firestore().collection('users').doc(uid).update({
      currentGroup: ''
    });
  }

  return (
    <div className="Header">
      <h1>DevComms</h1>
      <img className="logo-img" src={logo} alt="logo" />
      <span className="flex-grow" />
      <PersonIcon className="header-icon" />@{props.username}
      <GroupIcon className="header-icon" />{props.groupName}
      <button onClick={exitGroup} className="sign-out-button">
        <ExitToAppIcon />
      </button>
    </div>
  );
}

export default Header;
