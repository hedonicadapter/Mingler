const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('connected');
  ws.on('message', (message) => {
    console.log(`Received message => ${message}`);
    module.exports = { message };
  });
  ws.on('error', (error) => {
    console.log(`Error => ${error}`);
  });
  ws.on('close', (error) => {
    console.log(`Error => ${error}`);
  });
});
