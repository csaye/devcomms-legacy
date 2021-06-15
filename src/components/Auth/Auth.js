import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';

import logo from '../../img/logo.png';
import './Auth.css';

function Auth(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [signingUp, setSigningUp] = useState(props.signUp);

  const history = useHistory();

  const usernamesRef = firebase.firestore().collection('usernames');
  const [usernamesData] = useCollectionData(usernamesRef);

  // attempts to sign in user
  async function signIn(e) {
    e.preventDefault();
    setError('');

    // try to sign in with email and password
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
    // handle sign in error
    } catch(e) {
      if (e.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (e.code === 'auth/user-not-found') {
        setError('Unknown email address.');
      } else if (e.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (e.code === 'auth/too-many-requests') {
        setError('Too many sign in requests. Please try again later.')
      } else if (e.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.')
      } else {
        setError(e.message);
      }
    }
  }

  // attempts to sign up user
  async function signUp(e) {
    e.preventDefault();
    setError('');

    // verify password confirmation
    if (password !== confirmPassword) {
      setError("Passwords must match.");
      return;
    }
    // verify username chars
    if (!/^[A-Za-z0-9_]+$/.test(username)) {
      setError("Username can only contain alphanumeric characters and underscore.");
      return;
    }
    // verify username length
    if (username.length < 2 || username.length > 16) {
      setError("Username must be between 2 and 16 characters.");
      return;
    }
    // verify username availability
    if (usernamesData.some(user => user.username.toLowerCase() === username.toLowerCase())) {
      setError("Username taken. Please try another.");
      return;
    }

    // create user account
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
    // fail create user
    } catch(e) {
      setError(e.code);
      return;
    };
    // create user documents
    const uid = firebase.auth().currentUser.uid;
    await firebase.firestore().collection('users').doc(uid).set({
      username: username,
      uid: uid,
      registered: new Date(),
      group: '',
      channels: {}
    });
    await firebase.firestore().collection('usernames').doc(uid).set({
      username: username,
      uid: uid
    });
  }

  return (
    <div className="Auth">
      <div className="center-box">
        <img src={logo} alt="logo" />
        <h1>Devcomms</h1>
        <hr />
        {
          signingUp ?
          <form onSubmit={signUp}>
            <h2>Sign Up</h2>
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              placeholder="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <label htmlFor="signup-username">Username</label>
            <input
              id="signup-username"
              placeholder="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              placeholder="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <input
              id="signup-confirmpassword"
              placeholder="confirm password"
              style={{marginTop: '2px'}}
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button className="clean-btn">Sign Up</button>
          </form> :
          <form onSubmit={signIn}>
            <h2>Sign In</h2>
            <label htmlFor="signin-email">Email</label>
            <input
              id="signin-email"
              placeholder="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <label htmlFor="signin-password">Password</label>
            <input
              id="signin-password"
              placeholder="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button className="clean-btn">Sign In</button>
          </form>
        }
        {error && <p className="error-text">{error}</p>}
        <hr className="bottom-hr" />
        {
          signingUp ?
          <button className="switch-button clean-btn" onClick={() => {
            setError('');
            setSigningUp(false);
            history.push('/signin');
          }}>Have an account? Sign in</button> :
          <button className="switch-button clean-btn" onClick={() => {
            setError('');
            setSigningUp(true);
            history.push('/signup');
          }}>No account? Sign up</button>
        }
      </div>
    </div>
  );
}

export default Auth;
