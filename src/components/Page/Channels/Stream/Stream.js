import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

import VideocamIcon from '@material-ui/icons/Videocam';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';

import firebase from 'firebase/app';

import './Stream.css';

let localStream = null;
let localVideo = null;
let localPeer = null;

const calls = {};

function Stream(props) {
  const [streaming, setStreaming] = useState(false);
  const [calling, setCalling] = useState(false);

  const videoGridRef = useRef();

  // get channel doc reference
  const groupDoc = firebase.firestore().collection('groups').doc(props.group);
  const channelDoc = groupDoc.collection('channels').doc(props.channel);
  const peersRef = channelDoc.collection('peers');

  // creates a video object streaming from given stream
  function addStream(container, username, stream) {
    // create container title
    const title = document.createElement('p');
    title.textContent = username;
    container.append(title);
    // create container video
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.playsinline = true;
    container.append(video);
    // append container to grid
    const videoGrid = videoGridRef.current;
    videoGrid.append(container);
  }

  // answers given call
  async function answerCall(call) {
    // answer call with local stream
    call.answer(localStream);
    const peerId = call.peer;
    // reigster remote stream
    let streamCreated = false;
    const video = document.createElement('div');
    call.on('stream', remoteStream => {
      if (streamCreated) return;
      streamCreated = true;
      // retrieve peer username
      peersRef.doc(peerId).get().then(doc => {
        const username = doc.data().username;
        addStream(video, username, remoteStream);
      });
    });
    call.on('close', () => video.remove());
    // cache call
    calls[peerId] = call;
  }

  // starts local connection, stream, and video
  async function startStream() {
    // create local stream with video and audio
    localStream = await navigator.mediaDevices.getUserMedia(
      { video: props.useVideo, audio: true }
    );
    // create local video with local stream
    localVideo = document.createElement('div');
    addStream(localVideo, props.username, localStream);
    // set up local peer
    localPeer = new Peer();
    localPeer.on('open', () => setStreaming(true)); // start streaming on open
    localPeer.on('call', call => answerCall(call)); // answer when peer called
  }

  // stops video streaming
  function stopStream() {
    // stop streaming tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    // remove local video
    if (localVideo) localVideo.remove();
    // stop streaming
    setStreaming(false);
  }

  // stops local connection, stream, and video
  async function leaveCall() {
    // close each call
    Object.values(calls).forEach(call => call.close());
    // remove peer id from firebase
    if (localPeer?.id) {
      await peersRef.doc(localPeer.id).delete();
    }
    // stop calling
    setCalling(false);
  }

  // attempts to connect given peer
  function connectPeer(peer) {
    const call = localPeer.call(peer.id, localStream);
    const video = document.createElement('div');
    let streamCreated = false;
    call.on('stream', remoteStream => {
      if (streamCreated) return;
      streamCreated = true;
      addStream(video, peer.username, remoteStream);
    });
    call.on('close', () => video.remove());
    calls[peer.id] = call;
  }

  // attempts to disconnect given peer
  function disconnectPeer(peerId) {
    if (calls[peerId]) calls[peerId].close();
  }

  async function joinCall() {
    const snapshot = await peersRef.get();
    snapshot.docs.forEach(doc => connectPeer(doc.data()));
    await peersRef.doc(localPeer.id).set({
      id: localPeer.id,
      username: props.username
    });
    setCalling(true);
  }

  // called when user exits page
  async function onExit() {
    stopStream();
    await leaveCall();
  }

  // listen for unloading
  useEffect(() => {
    window.addEventListener('beforeunload', onExit);
    const peersListener = peersRef.onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'removed') {
          const data = change.doc.data();
          const peerId = data.id;
          disconnectPeer(peerId);
        }
      });
    });
    return () => {
      onExit();
      window.removeEventListener('beforeunload', onExit);
      peersListener();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="Stream">
      {
        props.useVideo ?
        <h1><VideocamIcon /> Video</h1> :
        <h1><VolumeUpIcon /> Audio</h1>
      }
      <div
        className={props.useVideo ? "video-grid" : "audio-grid"}
        ref={videoGridRef}
      >
      </div>
      {
        !streaming ?
        <button className="clean-btn var3" onClick={startStream}>Start Stream</button> :
        !calling ?
        <>
          <button className="clean-btn var3" onClick={joinCall}>Join Call</button>
          <button className="clean-btn var3" onClick={stopStream}>Stop Stream</button>
        </> :
        <button className="clean-btn var3" onClick={leaveCall}>Leave Call</button>
      }
    </div>
  );
}

export default Stream;
