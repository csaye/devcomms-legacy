import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import firebase from 'firebase/app';

import logo from '../../img/logo.png';
import './Header.css';

function Header() {
  return (
    <div className="Header">
      <h1>DevComms</h1>
      <img className="logo-img" src={logo} alt="logo" />
      <span className="flex-grow" />
      <p>Signed in as {firebase.auth().currentUser.displayName}</p>
      <button onClick={() => firebase.auth().signOut()} className="sign-out-button">
        <ExitToAppIcon />
      </button>
    </div>
  );
}

export default Header;
