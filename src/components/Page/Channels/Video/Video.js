import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

import VideocamIcon from '@material-ui/icons/Videocam';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';

import firebase from 'firebase/app';

import './Video.css';

let localStream = null;
let localVideo = null;
let localPeer = null;

const calls = {};

function Video(props) {
  const [streaming, setStreaming] = useState(false);
  const [calling, setCalling] = useState(false);

  const videoGridRef = useRef();

  // get channel doc reference
  const groupDoc = firebase.firestore().collection('groups').doc(props.group);
  const channelDoc = groupDoc.collection('channels').doc(props.channel);
  const peersRef = channelDoc.collection('peers');

  // creates and returns a video object streaming from given stream
  function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.autoplay = true;
    video.playsinline = true;
    const videoGrid = videoGridRef.current;
    videoGrid.append(video);
  }

  // starts local connection, stream, and video
  async function startStream() {
    // create local stream with video and audio
    localStream = await navigator.mediaDevices.getUserMedia(
      { video: props.useVideo, audio: true }
    );
    // create local video with local stream
    localVideo = document.createElement('video');
    addVideoStream(localVideo, localStream);
    // set up local peer
    localPeer = new Peer();
    localPeer.on('open', () => setStreaming(true));
    localPeer.on('call', call => {
      call.answer(localStream);
      const video = document.createElement('video');
      call.on('stream', remoteStream => {
        addVideoStream(video, remoteStream);
      });
      call.on('close', () => video.remove());
      calls[call.peer] = call;
    })
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
  function connectPeer(peerId) {
    const call = localPeer.call(peerId, localStream);
    const video = document.createElement('video');
    call.on('stream', remoteStream => {
      addVideoStream(video, remoteStream);
    });
    call.on('close', () => video.remove());
    calls[peerId] = call;
  }

  // attempts to disconnect given peer
  function disconnectPeer(peerId) {
    if (calls[peerId]) calls[peerId].close();
  }

  async function joinCall() {
    const snapshot = await peersRef.get();
    snapshot.docs.forEach(doc => connectPeer(doc.data().id));
    await peersRef.doc(localPeer.id).set({ id: localPeer.id });
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
    <div className="Video">
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

export default Video;
