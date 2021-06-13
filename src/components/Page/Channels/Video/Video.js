import React, { useRef, useState } from 'react';

import VideocamIcon from '@material-ui/icons/Videocam';

import './Video.css';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
    }
  ],
  iceCandidatePoolSize: 10
};

let localConnection = null;
let localStream = null;
let localVideo = null;

function Video(props) {
  const [streaming, setStreaming] = useState(false);

  const videoGridRef = useRef();

  // creates and returns a video object streaming from given stream
  function addVideoStream(stream) {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.playsinline = true;
    const videoGrid = videoGridRef.current;
    videoGrid.append(video);
    return video;
  }

  // starts local connection, stream, and video
  async function startWebcam() {
    // create local connection
    localConnection = new RTCPeerConnection(servers);
    // create local stream with video and audio
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    // add local stream to local connection
    localStream.getTracks().forEach(track => {
      localConnection.addTrack(track, localStream);
    });
    // create local video with local stream
    localVideo = addVideoStream(localStream);
    setStreaming(true);
  }

  // stops local connection, stream, and video
  function stopWebcam() {
    // close local connection
    localConnection.close();
    // stop streaming each track
    localStream.getTracks().forEach(track => {
      track.stop();
    });
    // remove local video
    localVideo.remove();
    setStreaming(false);
  }

  return (
    <div className="Video">
      <h1><VideocamIcon /> Video</h1>
      <div className="video-grid" ref={videoGridRef}></div>
      {
        streaming ?
        <button onClick={stopWebcam}>Stop Webcam</button> :
        <button onClick={startWebcam}>Start Webcam</button>
      }
    </div>
  );
}

export default Video;
