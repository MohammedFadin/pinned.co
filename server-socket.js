'use strict';
module.exports.listen = function(server) {
  var io = require('socket.io')(server);
  var pinnedNS = io.of('/pinned-ns');
  var pinnedBOTName = 'Chat Bot';
  var connectedUsers = {}; // Track joined/left users sockets
  var userSessions = {}; // Track user sockets sessions
  var channels = [
    'general',
    'programmers',
    'football'
  ];
  // Check if channel exists
  var joinTo = function(channel) {
    if (!channels.indexOf(channel)) {
      return channels[0];
    } else {
      return channel;
    }
  }

  var chatHistoryCounter = 0;

  pinnedNS.on('connection', function(client) {
    console.log('A socket connection has established');
    client.on('chat login', function(msg) {
      console.log(msg.nickname + ' has logged in to Pinned Name Space');

      // store users nickname
      // and channel, in a global var
      connectedUsers[msg.nickname] = {};
      connectedUsers[msg.nickname].socket = client; // socket
      connectedUsers[msg.nickname].nickname = msg.nickname;
    });

    /*
      On user joins a channel/room
     */
    client.on('chat subscribe', function(msg) {
      // Detect if same user joined
      // with multiple sockets
      for (var prop in userSessions[msg.nickname]) {
        if (userSessions[msg.nickname].hasOwnProperty('socket')) {
          console.log('User established connection twice, kick him!');
          // userSessions[msg.nickname].socket.broadcast.emit('chat message', {
          //   context: msg.nickname + ' has rejoined the channel!',
          //   nickname: pinnedBOTName
          // });
          userSessions[msg.nickname].socket.disconnect();
          delete userSessions[msg.nickname];
        }
      }
      userSessions[msg.nickname] = {};
      userSessions[msg.nickname].socket = client;
      client.nickname = msg.nickname;
      client.channel = joinTo(msg.channel);
      connectedUsers[msg.nickname].channel = joinTo(msg.channel);
      client.join(joinTo(msg.channel)); // Welcome Message
      pinnedNS.emit('chat history counter', {totalJoined: ++chatHistoryCounter})
      pinnedNS.emit('user joined', {
        totalUsers: Object.keys(connectedUsers).length
      });
      console.log('client joined this ' + connectedUsers[msg.nickname].channel);
    });

    client.on('chat subscribe channel', function (msg) {

    });

    /*
      On user broadcasts a message to the
      joined-in channel
     */
    client.on('chat message', function(msg, ack) {
      ack({
        request: {
          status: 200,
          msg: 'Successful'
        }
      });
      client.broadcast.to(connectedUsers[msg.nickname].channel).emit('chat message', {
        context: msg.context,
        nickname: msg.nickname,
      });
    });

    /*
      On user sends a private message to
      another user in same channel
     */
    client.on('private message', function(msg) {
      connectedUsers[msg.to].socket.emit('private message', {
        context: msg.context,
        from: connectedUsers[msg.from].nickname,
        to: connectedUsers[msg.to].nickname,
        time: new Date().getTime() // Change to getHours
      });
    });

    /*
      On user leavs a channel/room
      but still connected to namespace
     */
    client.on('chat leave', function() {
      client.leave();
      console.log('A user left from channel/room');
    });
    client.on('user typing', function () {
        client.broadcast.to(client.channel).emit('user typing')
    })
    client.on('user stopped typing', function () {
        client.broadcast.to(client.channel).emit('user stopped typing')
    })
    /*
      On user connections disconnects
     */
    client.on('disconnect', function() {
      console.log(client.nickname + ' disconnected from Pinned.CO');
      client.broadcast.emit('user left', {
        totalUsers: Object.keys(connectedUsers).length - 1,
        nickname: client.nickname
      });
      delete connectedUsers[client.nickname];
      client.disconnect();
    });
  });
}; // end
