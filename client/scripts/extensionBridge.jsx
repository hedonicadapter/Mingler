const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8000 });

wss.on('connection', (ws) => {
  console.log('sharehub connected ');

  ws.on('message', (data) => {
    console.log(data);
  });

  ws.on('close', () => {
    console.log('sharehub closed ');
  });
});
