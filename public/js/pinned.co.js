        var socket = io('/pinned-ns');
        var sessions = {};
        var messagesList = document.getElementById('messagesList');
        var message = document.getElementById('message');
        var messageRow = new Array();
        var messageBody = new Array();

        $(document).ready(function() {
            console.log('Initialized Pinned.co Sockets');
            $('#chooseNicknameModal').modal({
                backdrop: 'static',
                show: true,
                keyboard: false,
            });
        });

        $('#nicknameForm').submit(function() {
            console.log('Form Submitted');
            if (!$('#nickname').length) {} else {
                $('#chooseNicknameModal').modal('hide');
                socket.emit('chat login', {
                    nickname: $('#nickname').val(),
                    channel: 'general'
                });
            }
            return false;
        });

        $('#chatSendBtn').click(function() {
            socket.emit('chat message', {
                msg: $('#messageValue').val(),
                nickname: $('#nickname').val(),
            });
            $('#messageValue').val('');
            console.log('Message Sent!');
            return false;
        });

        socket.on('chat message', function(data) {
            var outputMessage = '<li id="message" class="media"><div data-channel="test" class="media-body"><div class="media"><a href="#" class="pull-left"><img src="/img/Icon-user.png" class="media-object img-circle img-small"></a><div class="media-body" style="padding-top:-20px;"><p id="messageText">' + data.msg + '</p><small class="text-muted">' + data.nickname + ' | 24th Nov at 2:00pm</small><hr></div></div></div></li>';
            var messagerow = document.createElement('li');
            messagerow.setAttribute('class', 'media');
            messagerow.setAttribute('id', 'message');
            messagerow.innerHTML = outputMessage;
            messagesList.appendChild(messagerow);
            $('.scrollable-div').stop().animate({
              scrollTop: $(".scrollable-div")[0].scrollHeight
            }, 800);
        });

        socket.on('private message', function(msg) {
            $('#privateMessage').append($('<li>').text(msg));
        });
