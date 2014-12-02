module.exports.listen = function(server) {
  var io = require('socket.io')(server);
  var pinnedNS = io.of('/pinned-ns');
  var connectedUsers = {}; // Track joined/left users sockets
  var userSessions = {}; // Track user sockets sessions
  var channels = [
    'general',
    'programmers',
    'football',
  ];

  // A temporary function to check
  // if the channel requested by user
  // is valid or not
  var joinTo = function(channel) {
    if (!channels.indexOf(channel)) {
      return channels[0];
    } else {
      return channel;
    }
  }

  pinnedNS.on('connection', function(client) {
    console.log('User connected to Pinned-NS');

    client.on('chat login', function(msg) {
      console.log(msg.nickname + ' has logged in to Pinned Name Space');

      // store users nickname
      // and channel, in a global var
      connectedUsers[msg.nickname] = {};
      connectedUsers[msg.nickname].socket = client; // socket
      connectedUsers[msg.nickname].nickname = msg.nickname;
    });

    // If clients emits to subscribe to a channel
    // we check channel before subscribing
    client.on('chat subscribe', function(msg) {
      // Store the user channel
      connectedUsers[msg.nickname].channel = joinTo(msg.channel);
      console.log('client joined this ' + connectedUsers[msg.nickname].channel);
      // Broadcast a welcome message to the users
      client.join(joinTo(msg.channel));
    });

    // User broadcasts a message to others
    // except him
    client.on('chat message', function(msg, ack) {
      ack({request:{status:200, msg: 'Successful'}});
      client.broadcast.to(connectedUsers[msg.nickname].channel).emit('chat message', {
        context: msg.context,
        nickname: msg.nickname,
      });
    });

    // User want to send private message
    // to another user
    client.on('chat private', function(msg) {

      // Emit to the recipient
      connectedUsers[msg.to].socket.emit('chat private', {
        context: msg.context,
        from: connectedUsers[msg.from].nickname,
        to: connectedUsers[msg.to].nickname,
        time: new Date().getTime()
      });
    });
    // User disconnects
    client.on('disconnect', function() {
      client.leave();
      console.log('A user disconnected from Pinned.CO');
    });
  });
}; // end
