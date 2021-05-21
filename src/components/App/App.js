import SignIn from '../SignIn/SignIn.js';
import Home from '../Home/Home.js';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import { firebaseConfig } from '../../util/firebaseConfig.js';
import { useAuthState } from 'react-firebase-hooks/auth';

import './App.css';

firebase.initializeApp(firebaseConfig);

function App() {
  useAuthState(firebase.auth());

  return (
    <div className="App">
      {
        firebase.auth().currentUser ?
        <Home /> :
        <SignIn />
      }
    </div>
  );
}

export default App;
