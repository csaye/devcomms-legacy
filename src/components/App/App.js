import Page from '../Page/Page.js';
import SignIn from '../SignIn/SignIn.js';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
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
        <Page /> :
        <SignIn />
      }
    </div>
  );
}

export default App;
