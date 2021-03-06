/*global
io,
messagesList,
document,
message,
messageRow,
scrollItDown,
outputMessage,
jQuery,console, $
*/
/*jslint todo: true */

var socket, sessions, message,
    messageRow, scrollItDown, outputMessage,
    clearUserInput, createCookie, readCookie, eraseCookie,
    username, channelTabs;

socket = io('/pinned-ns');
sessions = {};
messagesList = document.getElementById('messagesList');
message = document.getElementById('message');
messageRow = [];
username;
channelTabs = document.getElementsByClassName('channels tabs');

scrollItDown = function() {
    $('.scrollable-div').stop().animate({
        scrollTop: $(".scrollable-div")[0].scrollHeight
    }, 800);
};
outputMessage = function(data) {
    var messagerow = document.createElement('li'),
        templateMessage = '<li id="message" class="media"><div data-channel="test" class="media-body"><div class="media"><a href="#" class="pull-left"><img src="/img/Icon-user.png" class="media-object img-circle img-small"></a><div class="media-body" style="padding-top:-20px;"><p id="messageText">' + clearUserInput(data.context) + '</p><small class="text-muted">' + clearUserInput(data.nickname) + ' | 24th Nov at 2:00pm</small><hr></div></div></div></li>';
    messagerow.setAttribute('class', 'media');
    messagerow.setAttribute('id', 'message');
    messagerow.innerHTML = templateMessage;
    return messagerow;
};
OutputCurrentOnlineUsers = function(data) {
    $('#totalOnline').html(data.totalUsers); // Then add for each channel
}
// Prevent XSS
clearUserInput = function(input) {
    return $('<div/>').text(input).html();
};
createCookie = function(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    } else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
};
readCookie = function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};
eraseCookie = function(name) {
    createCookie(name, "", -1);
};

$(document).ready(function() {
    console.log('Initialized Pinned.co Sockets');
    //username = readCookie('pinned.co-user') || null;
        $('#chooseNicknameModal').modal({
            backdrop: 'static',
            show: true,
            keyboard: false,
        });
    // if (!username) {
    //     $('#chooseNicknameModal').modal({
    //         backdrop: 'static',
    //         show: true,
    //         keyboard: false,
    //     });
    // } else {
    //     socket.emit('chat login', {
    //         nickname: username,
    //     });
    //     socket.emit('chat subscribe', {
    //         nickname: username,
    //         channel: 'general'
    //     });
    //     socket.emit('chat message', {
    //         context: username + ' has joined the general channel!',
    //         nickname: username,
    //     }, function(ackData) {
    //         messagesList.appendChild(outputMessage({
    //             context: username + ' has joined the general channel!',
    //             nickname: username,
    //         }));
    //     });
    // }
});

$('#nicknameForm').submit(function() {
    username = $('#nickname').val();

    if (!$('#nickname').length) {
        return false;
    }

    $('#chooseNicknameModal').modal('hide');

    socket.emit('chat login', {
        nickname: username,
    });
    // socket.emit('user check', {
    //     nickname: nickname
    // }, function (data) {
    //     if (!data.connected){
    //         $('#chooseNicknameModal').modal({
    //             backdrop: 'static',
    //             show: true,
    //             keyboard: false,
    //         });
    //     console.log('user connected with username already')
    //     }
    //     return;
    // });

    // socket.emit('chat subscribe', {
    //     nickname: username,
    //     channel: 'general'
    // });
    // socket.emit('chat message', {
    //     context: username + ' has joined the general channel!',
    //     nickname: username,
    // }, function(ackData) {
    //     console.log(ackData);
    //     // var messagesList = document.getElementById('messagesList-general')
    //     messagesList.appendChild(outputMessage({
    //         context: username + ' has joined the general channel!',
    //         nickname: username,
    //     }));
    // });

    // Set user cookie
    //createCookie('pinned.co-user', username, 0);
    return false;
});

$('#messageValue').on('input', function() {
    socket.emit('user typing');
    // console.log('input event working')
})
$(window).keydown(function(event) {
    if (event.which === 13) {
        socket.emit('user stopped typing');
    }
})
$('#chatSendBtn').click(function() {
    // Here we check which channel tab is active
    // var currChannel = $('.tab-pane.active').attr('id');

    // var messagesList = document.getElementById('messagesList-'+currChannel);
    messagesList.appendChild(outputMessage({
        context: $('#messageValue').val(),
        nickname: username
    }));

    socket.emit('chat message', {
        context: $('#messageValue').val(),
        nickname: username,
        // channel: currChannel,
    }, function(ackData) {});
    $('#messageValue').val('');
    $('#messageValue').focus();
    scrollItDown();
    socket.emit('user stopped typing');
    console.log('Message Sent!');
    return false;
});

$('#sendPrivate').click(function() {
    socket.emit('chat private', {
        context: 'Ahlan bro!',
        from: 'fadin',
        to: 'hassan',
    });
});

// $(document).on("click", ".channels.card", function (e) {
//     var btn = $(this).attr("data-channel");
//     var tabsMainDiv = document.getElementById('channelsTabsContent');

//     if ($('#'+btn).length === 0){
//         var atab = document.createElement('li');
//         $('.nav.nav-tabs.channels.tabs li').removeClass('active');
//             atab.setAttribute('id', btn+'-tab');
//             atab.setAttribute('class', 'active');
//         var tabStyle = '<a href="#'+btn+'" data-toggle="tab" aria-expanded="true">'+btn+'</a>';
//         var tabHTMLContent = '<div class="panel-body scrollable-div"><ul id="messagesList-'+btn+'" class="media-list"></ul></div>'
//         var tabNodeContent = document.createElement('div');
//             tabNodeContent.setAttribute('class', 'tab-pane fade');
//             tabNodeContent.setAttribute('id', btn);
//         tabNodeContent.innerHTML = tabHTMLContent;
//         atab.innerHTML = tabStyle;

//         channelTabs[0].appendChild(atab);
//         tabsMainDiv.appendChild(tabNodeContent);
//         $('.tab-content .tab-pane').removeClass('active');
//         $('#'+btn).addClass('active');
//     }else{
//         $('.nav.nav-tabs.channels.tabs li').removeClass('active');
//         $('#'+btn+'-tab').addClass('active');
//         $('.tab-content .tab-pane').removeClass('active');
//         $('#'+btn).addClass('active');
//     }
// })
socket.on('user logged in', function (data) {
    username = data.username || username;
    socket.emit('chat subscribe', {
        nickname: username,
        channel: 'general'
    });
    socket.emit('chat message', {
        context: username + ' has joined the general channel!',
        nickname: username,
    }, function(ackData) {
        console.log(ackData);
        // var messagesList = document.getElementById('messagesList-general')
        messagesList.appendChild(outputMessage({
            context: username + ' has joined the general channel!',
            nickname: username,
        }));
    });
});
socket.on('user new username', function (data) {
    username = data.nickname;
})
socket.on('chat message', function(data) {
    messagesList.appendChild(outputMessage(data));
    var snd = new Audio("./sounds/msg-notification.mp3"); // buffers automatically when created
    snd.play();
    scrollItDown();
});
socket.on('chat history counter', function(data) {
    $('#totalJoined').html(data.totalJoined);
});
socket.on('private message', function(msg) {
    console.log(msg.from + ': ' + msg.context + ' Time ' + msg.time);
});
socket.on('user joined', function(data) {
    OutputCurrentOnlineUsers(data); // update total users
});
socket.on('user left', function(data) {
    OutputCurrentOnlineUsers(data);
    messagesList.appendChild(outputMessage({
        context: data.nickname + ' has left the chat',
        nickname: 'Chat Bot'
    }));
    scrollItDown();
});
socket.on('user typing', function(data) {
    $('.typing-alert').fadeIn();
});
socket.on('user stopped typing', function(data) {
    $('.typing-alert').fadeOut();
    scrollItDown();
})

socket.on('disconnect', function() {
});

// socket.on('user clear cache', function () {
//     eraseCookie('pinned.co-user', username, 0);
// })

// socket.on('user force logout', function () {
//     socket.disconnect({duplicate: true});
//     console.log('You have been forced to disconnect');
// })
/*
    TODO: 'refactor appending messages',
          'rename listeners',
          'cache user information'

 */
