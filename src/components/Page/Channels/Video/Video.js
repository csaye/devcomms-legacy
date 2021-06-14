import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

import VideocamIcon from '@material-ui/icons/Videocam';

import firebase from 'firebase/app';

import './Video.css';

let localStream = null;
let localVideo = null;
let localPeer = null;

function Video(props) {
  const [streaming, setStreaming] = useState(false);
  const [calling, setCalling] = useState(false);

  const videoGridRef = useRef();

  // get channel doc reference
  const groupDoc = firebase.firestore().collection('groups').doc(props.group);
  const channelDoc = groupDoc.collection('channels').doc(props.channel);

  // creates and returns a video object streaming from given stream
  function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.autoplay = true;
    video.playsinline = true;
    const videoGrid = videoGridRef.current;
    videoGrid.append(video);
  }

  // starts local connection, stream, and video
  async function startVideo() {
    // create local stream with video and audio
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
    })
  }

  function stopVideo() {
    // stop streaming each track
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    // remove local video
    if (localVideo) localVideo.remove();
    setStreaming(false);
  }

  // stops local connection, stream, and video
  async function leaveCall() {
    // remove peer id from firebase
    if (localPeer?.id) {
      await channelDoc.update({
        ids: firebase.firestore.FieldValue.arrayRemove(localPeer.id)
      });
    }
    setCalling(false);
  }

  function connectToPeer(peerId) {
    const call = localPeer.call(peerId, localStream);
    const video = document.createElement('video');
    call.on('stream', remoteStream => {
      addVideoStream(video, remoteStream);
    });
    call.on('close', () => video.remove());
  }

  async function joinCall() {
    const docData = (await channelDoc.get()).data();
    docData.ids.forEach(peerId => connectToPeer(peerId));
    await channelDoc.update({
      ids: firebase.firestore.FieldValue.arrayUnion(localPeer.id)
    });
    setCalling(true);
  }

  async function onExit() {
    stopVideo();
    await leaveCall();
  }

  // listen for unloading
  useEffect(() => {
    window.addEventListener('beforeunload', onExit);
    return () => {
      onExit();
      window.removeEventListener('beforeunload', onExit);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="Video">
      <h1><VideocamIcon /> Video</h1>
      <div className="video-grid" ref={videoGridRef}></div>
      {
        !streaming ?
        <button onClick={startVideo}>Start Video</button> :
        !calling ?
        <>
          <button onClick={joinCall}>Join Call</button>
          <button onClick={stopVideo}>Stop Video</button>
        </> :
        <button onClick={leaveCall}>Leave Call</button>
      }
    </div>
  );
}

export default Video;
