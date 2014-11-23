var WebServerSocket = require('ws').Server
  , ssocket = new WebServerSocket({port: 4000});

ssocket.on('connection', function (ssocket) {
  ssocket.send('Hello from Nomo Server!');
  ssocket.on('message', function (message) {
    console.log("Client Message: " + message);
    ssocket.send('Roget that browser!' + new Date());
  });
});