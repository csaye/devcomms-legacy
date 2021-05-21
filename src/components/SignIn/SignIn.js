import React, { useState } from 'react';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';

import logo from '../../img/logo.png';
import './SignIn.css';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [signingUp, setSigningUp] = useState(false);

  const usersRef = firebase.firestore().collection('users');
  const [usersData] = useCollectionData(usersRef);

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
    if (usersData && usersData.some(u => u.username.toLower() === username.toLower())) {
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
    // create user user document
    const uid = firebase.auth().currentUser.uid;
    await firebase.firestore().collection('users').doc(uid).set({
      username: username,
      registered: new Date(),
      currentGroup: '',
      groups: []
    });
  }

  return (
    <div className="SignIn">
      <div className="center-box">
        <img src={logo} alt="logo" />
        <h1>DevComms</h1>
        <hr />
        {
          signingUp ?
          <form onSubmit={signUp}>
            <input
              placeholder="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              placeholder="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <input
              placeholder="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <button type="submit">Sign Up</button>
          </form> :
          <form onSubmit={signIn}>
            <input
              placeholder="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              placeholder="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button type="submit">Sign In</button>
          </form>
        }
        {
          signingUp ?
          <button onClick={() => {
            setError('');
            setSigningUp(false);
          }}>Have an account? Sign in</button> :
          <button onClick={() => {
            setError('');
            setSigningUp(true);
          }}>No account? Sign up</button>
        }
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}

export default SignIn;
