import { useParams } from 'react-router-dom';

import Page from '../Page/Page.js';
import Loading from '../Loading/Loading.js';

import firebase from 'firebase/app';
import { useDocumentData } from 'react-firebase-hooks/firestore';

import './Home.css';

function Home() {
  const uid = firebase.auth().currentUser.uid;
  const userDoc = firebase.firestore().collection('users').doc(uid);
  const [userData] = useDocumentData(userDoc);

  const { groupId, channelId } = useParams();

  return (
    <div className="Home">
      {
        userData ?
        <Page group={groupId} channel={channelId} username={userData.username} /> :
        <Loading message="Loading user..." />
      }
    </div>
  );
}

export default Home;
