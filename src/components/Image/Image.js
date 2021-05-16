import React, { useEffect, useState } from 'react';

import ImageIcon from '@material-ui/icons/Image';
import PublishIcon from '@material-ui/icons/Publish';
import GetAppIcon from '@material-ui/icons/GetApp';

import firebase from 'firebase/app';

import './Image.css';

function Image() {
  const storageRef = firebase.storage().ref('images/image');

  const [image, setImage] = useState(undefined);
  const [imageUrl, setImageUrl] = useState(undefined);

  // retrieves image from firebase
  async function getImage() {
    const url = await storageRef.getDownloadURL();
    setImageUrl(url);
  }

  // updates image in firebase storage
  async function updateImage(e) {
    e.preventDefault();
    if (!image) return;
    await storageRef.put(image);
    getImage();
  }

  // downloads image
  async function downloadImage() {

    // get object url
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = await URL.createObjectURL(blob);

    // download from link element
    const link = document.createElement('a');
    link.download = 'image';
    link.href = url;
    link.click();
  }

  // get image on start
  useEffect(() => {
    getImage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="Image">
      <h1><ImageIcon /> Image</h1>
      <form onSubmit={updateImage}>
        <input
          type="file"
          accept="image/*"
          onChange={e => setImage(e.target.files[0])}
          required
        />
        <button type="submit"><PublishIcon /></button>
      </form>
      {
        imageUrl ?
        <>
          <img src={imageUrl} alt="" />
          <button
            className="download-button"
            onClick={downloadImage}
          >
            <GetAppIcon />
          </button>
        </> :
        <p>Loading image...</p>
      }
    </div>
  );
}

export default Image;
