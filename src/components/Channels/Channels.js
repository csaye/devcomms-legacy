import firebase from 'firebase/app';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import './Channels.css';

function Channels(props) {
  // get group channels
  const groupDoc = firebase.firestore().collection('groups').doc(props.group);
  const channelsRef = groupDoc.collection('channels');
  const [channels] = useCollectionData(channelsRef);

  return (
    <div className="Channels">
      <p>Channels</p>
    </div>
  );
}

export default Channels;
