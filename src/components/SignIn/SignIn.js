import firebase from 'firebase/app';

import logo from '../../img/logo.png';
import './SignIn.css';

function SignIn() {
  function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  }

  return (
    <div className="SignIn">
      <div className="center-box">
        <img src={logo} alt="logo" />
        <h1>DevComms</h1>
        <hr />
        <button onClick={signInWithGoogle}>Sign in with Google</button>
      </div>
    </div>
  );
}

export default SignIn;
