        var socket = io('/pinned-ns');
        var sessions = {};
        var messagesList = document.getElementById('messagesList');
        var message = document.getElementById('message');
        var messageRow = new Array();

        var outputMessage = function(data) {
            var messagerow = document.createElement('li');
            messagerow.setAttribute('class', 'media');
            messagerow.setAttribute('id', 'message');

            var templateMessage = '<li id="message" class="media"><div data-channel="test" class="media-body"><div class="media"><a href="#" class="pull-left"><img src="/img/Icon-user.png" class="media-object img-circle img-small"></a><div class="media-body" style="padding-top:-20px;"><p id="messageText">' + data.context + '</p><small class="text-muted">' + data.nickname + ' | 24th Nov at 2:00pm</small><hr></div></div></div></li>';
            messagerow.innerHTML = templateMessage;

            return messagerow;
        };
        var scrollItDown = function() {
            $('.scrollable-div').stop().animate({
                scrollTop: $(".scrollable-div")[0].scrollHeight
            }, 800);
        };

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

            var nickname = $('#nickname').val();

            if (!$('#nickname').length) {
                return false;
            }

            $('#chooseNicknameModal').modal('hide');

            socket.emit('chat login', {
                nickname: nickname,
            });

            socket.emit('chat subscribe', {
                nickname: nickname,
                channel: 'general'
            });

            socket.emit('chat message', {
                context: '<em>' + nickname + '</em>' + ' has joined the general channel!',
                nickname: nickname,
            }, function(ackData) {
                messagesList.appendChild(outputMessage({
                    context: '<em>' + nickname + '</em>' + ' has joined the general channel!',
                    nickname: nickname,
                }));
            });

            return false;
        });

        $('#chatSendBtn').click(function() {
            messagesList.appendChild(outputMessage({
                context: $('#messageValue').val(),
                nickname: $('#nickname').val()
            }));

            socket.emit('chat message', {
                context: $('#messageValue').val(),
                nickname: $('#nickname').val(),
            });
            $('#messageValue').val('');
            $('#messageValue').focus();
            scrollItDown();
            console.log('Message Sent!');
            return false;
        });

        socket.on('chat message', function(data) {
            messagesList.appendChild(outputMessage(data));
            scrollItDown();
        });

        $('#sendPrivate').click(function() {
            socket.emit('chat private', {
                context: 'Ahlan bro!',
                from: 'fadin',
                to: 'hassan',
            });
        });

        socket.on('chat private', function(msg) {
            console.log(msg.from + ': ' + msg.context + ' Time ' + msg.time);
        });
