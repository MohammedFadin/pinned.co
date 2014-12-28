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
      // Check if user has multiple sockets online
      for (var prop in userSessions[msg.nickname]) {
        if (userSessions[msg.nickname].hasOwnProperty('connected')) {
          //Generate a new username
          msg.nickname = msg.nickname + '-' + Math.floor(Math.random() * (20 - 10) + 10);
          // client.emit('user logged in', {username: msg.nickname});
        }
      }
      console.log(msg.nickname + ' has logged in to Pinned Name Space');
      client.emit('user logged in', {username: msg.nickname});
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

      userSessions[msg.nickname] = {};
      userSessions[msg.nickname].connected = true;
      client.nickname = msg.nickname;
      console.log('Dude what is ' + client.nickname)
      client.channel = joinTo(msg.channel);
      connectedUsers[msg.nickname].channel = joinTo(msg.channel);
      client.join(joinTo(msg.channel));

      pinnedNS.emit('chat history counter', {
        totalJoined: ++chatHistoryCounter
      })
      pinnedNS.emit('user joined', {
        totalUsers: Object.keys(connectedUsers).length
      });

      console.log('client joined this ' + connectedUsers[msg.nickname].channel);
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
      client.broadcast.to('general').emit('chat message', {
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
    client.on('user check', function (data, cb) {
      if (connectedUsers.hasOwnProperty(data.nickname)){
        cb({connected: true});
      }else{
        cb({connected: false});
      }
    })
    /*
      On user leavs a channel/room
      but still connected to namespace
     */
    client.on('chat leave', function() {
      client.leave();
      console.log('A user left from channel/room');
    });
    client.on('user typing', function() {
      client.broadcast.to(client.channel).emit('user typing')
    })
    client.on('user stopped typing', function() {
      client.broadcast.to(client.channel).emit('user stopped typing')
    })
    /*
      On user connections disconnects
     */
    client.on('disconnect', function() {
      console.log(client.nickname + ' disconnected from Pinned.CO');
      var curr = Object.keys(connectedUsers).length;
      client.broadcast.emit('user left', {
        totalUsers: curr - 1,
        nickname: client.nickname
      });
      delete userSessions[client.nickname];
      delete connectedUsers[client.nickname];
      client.disconnect();
    });
  });
}; // end
