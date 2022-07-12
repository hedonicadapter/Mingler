export function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = (err) => {
      reject(err);
    };

    reader.readAsDataURL(file);
  });
}

export function arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function profilePictureToJSXImg(profilePicture) {
  let buffer = Buffer.from(profilePicture.image).toString('base64');

  return `data:${profilePicture?.mimetype};base64,${buffer}`;
}

const MAX_WIDTH = 142;
const MAX_HEIGHT = 142;
const QUALITY = 0.7;

// modified from https://stackoverflow.com/a/68956880/11599993 by Eyni Kave
export const compressFile = (file, callback) => {
  const blobURL = URL.createObjectURL(file);
  const img = document.createElement('img');
  img.src = blobURL;

  img.onerror = function () {
    URL.revokeObjectURL(img.src);
    // TODO: Handle the failure properly
    console.error('Cannot load image');
  };
  img.onload = async () => {
    URL.revokeObjectURL(img.src);
    const [newWidth, newHeight] = calculateSize(img, MAX_WIDTH, MAX_HEIGHT);

    const canvas = document.createElement('canvas');

    canvas.width = newWidth;
    canvas.height = newHeight;

    const ctx = canvas.getContext('2d');

    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    const blob = await new Promise((resolve) =>
      canvas.toBlob((blob) => resolve(blob), file.type, QUALITY)
    );
    callback(new File([blob], file.name, { type: file.type }));
  };
};

function calculateSize(img, maxWidth, maxHeight) {
  let width = img.width;
  let height = img.height;

  // calculate the width and height, constraining the proportions
  if (width > height) {
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }
  }
  return [width, height];
}
