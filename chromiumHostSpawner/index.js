const io = require('socket.io-client');

const socket = io('ws://127.0.0.1:8081/auth', {
  // auth: {
  //   accessToken: 'test',
  // },
  // transports: ['websocket'],
  // origins: 'localhost:* http://localhost:* http://www.localhost:*',
});

socket.on('fromAppToHost:requestreset', () => {
  setTimeout(() => sendToChromium('request:reset'), 1);
});

socket.on('fromAppToHost:userID', (packet) => {
  setTimeout(() => sendToChromium(packet), 1);
});

socket.on('fromAppToHost:signedOut', (packet) => {
  setTimeout(() => sendToChromium('request:reset'), 1);
});

socket.on('getYouTubeTime', (packet) => {
  sendToChromium(packet);
});

socket.on('connection', () => {
  console.log('Client socket connected');
});
socket.io.on('error', (error) => {
  console.log('error', error);
});
socket.io.on('reconnect', (attempt) => {
  console.log('attempt number ', attempt);
});

// console.log writes to stdout, which is then received by
// the chromium extension that opens this program
function sendToChromium(msg) {
  var buffer = Buffer.from(JSON.stringify(msg));

  var header = Buffer.alloc(4);

  header.readUIntBE(0, 4);
  header.writeUInt32LE(buffer.length, 0);

  var data = Buffer.concat([header, buffer]);

  process.stdout.write(data);
}

let payloadSize = null;

// A queue to store the chunks as we read them from stdin.
// This queue can be flushed when `payloadSize` data has been read
let chunks = [];

// Only read the size once for each payload
const sizeHasBeenRead = () => Boolean(payloadSize);

// All the data has been read, reset everything for the next message
const flushChunksQueue = () => {
  payloadSize = null;
  chunks.splice(0);
};

const processData = () => {
  // Create a buffer with all the chunks
  const stringData = Buffer.concat(chunks);

  // The browser will emit the size as a header of the payload,
  // if it hasn't been read yet, do it.
  // The next time we'll need to read the payload size is when all of the data
  // of the current payload has been read (ie. data.length >= payloadSize + 4)
  if (!sizeHasBeenRead()) {
    payloadSize = stringData.readUInt32LE(0);
  }

  // If the data we have read so far is >= to the size advertised in the header,
  // it means we have all of the data sent.
  // We add 4 here because that's the size of the bytes that old the payloadSize
  if (stringData.length >= payloadSize + 4) {
    // Remove the header
    const contentWithoutSize = stringData.slice(4, payloadSize + 4);

    // Reset the read size and the queued chunks
    flushChunksQueue();

    const json = JSON.parse(contentWithoutSize);

    // socket.timeout(1000).emit('fromHostToApp:data', json, (err, response) => {
    //   sendToChromium(response);
    //   // if no response within 5000ms, it might mean that the client has closed mingler
    //   // if client has closed mingler, reset chromium extension to await a new client and spawn a new host
    //   if (err) {
    //     sendToChromium('request:reset');
    //   }
    // });
    socket.emit('fromHostToApp:data', json);
  }
};

process.stdin.on('readable', () => {
  // A temporary variable holding the nodejs.Buffer of each
  // chunk of data read off stdin
  let chunk = null;

  // Read all of the available data
  while ((chunk = process.stdin.read()) !== null) {
    chunks.push(chunk);
  }

  processData();
});
