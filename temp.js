! function(e) {
    e.extend({
        playSound: function() {
            return e("<embed src='" + arguments[0] + ".mp3' hidden='true' autostart='true' loop='false' class='playSound'><audio autoplay='autoplay' style='display:none;' controls='controls'><source src='" + arguments[0] + ".mp3' /><source src='" + arguments[0] + ".ogg' /></audio>").appendTo("body")
        }
    })
}(jQuery);
var socket = io(),
    session = {
        username: $.cookie("username") ? $.cookie("username") : null,
        channel: "initial",
        notifications: 0
    },
    windowFocus = !0;
$(window).focus(function() {
    windowFocus = !0;
    session.notifications = 0;
    document.title = "Ghat - GitHub Chat"
}).blur(function() {
    windowFocus = !1
});
$(window).on("resize", function() {
    $("body").height($(this).height())
}).trigger("resize");
$.cookie("username") && socket.emit("chat login", {
    username: $.cookie("username")
});
var $channels = $("#channels");
socket.on("channels users", function(e) {
    $channels.empty();
    e.forEach(function(e) {
        var n = $('<div class=channel data-channel="' + e.name + '" data-namespace="' + e.namespace + '"><span class=counter>' + e.users.length + "</span>" + e.name + "</div>");
        e.name == session.channel && n.addClass("active");
        $channels.append(n)
    })
});
var $users = $("#users");
socket.on("users of channel", function(e) {
    $users.empty();
    e.forEach(function(e) {
        $users.append("<div class=user>" + e + "</div>")
    });
});
$(document).on("click", ".channel, .card", function(e) {
    if ($(e.target).is(".close")) return !1;
    $("#channels .channel, .cards .card").removeClass("active");
    var n = $(this).attr("data-channel");
    session.channel = n;
    session.namespace = $(this).attr("data-namespace");
    $("#channelswrapper .channelbox").removeClass("active");
    if ($("#channelswrapper [data-channel='" + n + "']").length) {
        $("[data-channel='" + n + "']").addClass("active");
        $(this).addClass("active")
    } else {
        socket.emit("channels enter", {
            username: session.username,
            channel: n
        });
        $("#channelswrapper").append("<ul data-channel='" + n + '\' class="channelbox active"></ul>');
        $(".cards").append('<div class="card active" data-channel="' + n + '">' + n + "<span class=close>&times;</span></div>")
    }
    $("#m").focus()
});
$(document).on("click", ".cards .card .close", function() {
    var e = $(this).parent().attr("data-channel");
    if (e == session.channel) {
        session.channel = "initial";
        $("[data-channel='initial']").addClass("active")
    }
    1 == $(".cards .card").length && (session.channel = null);
    $(this).parent().remove();
    $("#channelswrapper [data-channel='" + e + "']").remove();
    socket.emit("channels leave", {
        username: session.username,
        channel: e
    })
});
if (session.username) {
    socket.emit("chat message", {
        channel: "initial",
        username: "Welcome bot",
        text: "Welcome back **" + session.username + "**!"
    });
    socket.emit("channels enter", {
        username: session.username,
        channel: session.channel
    })
} else $("#login").modal({
    backdrop: "static",
    keyboard: !1
});
$("#loginform").submit(function() {
    session.username = $(this).find("[name=username]").val();
    socket.emit("chat login", {
        username: session.username
    });
    socket.emit("chat message", {
        channel: session.channel,
        username: "Welcome bot",
        text: "Welcome **" + session.username + "** to this chat"
    });
    socket.emit("channels enter", {
        username: session.username,
        channel: session.channel
    });
    $.cookie("username", session.username);
    $("#login").modal("hide");
    return !1
});
$("#chatform").submit(function() {
    var e = {
        channel: session.channel,
        namespace: session.namespace,
        username: session.username,
        text: $("#m").val()
    };
    socket.emit("chat message", e);
    $("#m").val("");
    return !1
});
socket.on("chat message", function(e) {
    e.mentions && -1 !== $.inArray("@" + session.username, e.mentions) && (windowFocus || $.playSound("/media/blop"));
    if (!windowFocus) {
        session.notifications = session.notifications + 1;
        document.title = "(" + session.notifications + ") Ghat - GitHub Chat"
    }
    var n = $("<li>").html('<span class="username">' + e.username + "</span>: " + e.text);
    $("#channelswrapper [data-channel='" + e.channel + "']").append(n);
    $(".channelbox").scrollTop($(".channelbox")[0].scrollHeight)
});