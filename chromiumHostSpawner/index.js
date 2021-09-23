const io = require('socket.io-client');

// var path = require('path');
// const execFile = require('child_process').execFile;

// var exePath = path.resolve(__dirname, 'host.py');

// var child = require('child_process').exec('python', [exePath]);

// process = execFile('python', [exePath]);

// process.stdout.write('hello');

// child.stdout.on('data', function (data) {
//   let activeTab = data.toString().trim();

//   console.log('activeTab ', activeTab);
// });

// child.stderr.on('data', function (data) {
//   if (data) console.log('STDERR: ', data);
// });

// child.on('error', function (err) {
//   if (err) return console.error(err);
// });

// child.on('exit', function () {
//   process.exit();
// });

const socket = io('ws://127.0.0.1:8081/auth', {
  // auth: {
  //   token: 'test',
  // },
  // transports: ['websocket'],
  // origins: 'localhost:* http://localhost:* http://www.localhost:*',
});

socket.on('connection', () => {
  console.log('Client socket connected');
});
socket.on('fromApp:userID', (packet) => {
  // sendActivityToLocalStorage(packet);
  console.log('lalala ', packet);
});

socket.io.on('error', (error) => {
  console.log('error', error);
});
socket.io.on('reconnect', (attempt) => {
  console.log('attempt', attempt);
});

// while (true) {}
