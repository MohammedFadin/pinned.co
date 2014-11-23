var express = require('express'),
  routes = require('./routes'),
  http = require('http'),
  app = express(),
  path = require('path'),
  logger = require('morgan'),
  bodyParser = require('body-parser'),
  errorHandler = require('errorhandler'),
  methodOverride = require('method-override');
  app.locals.appTitle = 'Pinned.co';

// Database

// Configuration
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Server Start
var server = http.createServer(app);
var boot = function () {
    server.listen(app.get('port'), function () {
        console.info('Server has started listening');
    });
};
var shutdown = function () {
    server.close();
};

if (require.main === module){
    boot();
}else{
    console.info('Server app running as module');
    exports.boot = boot;
    exports.shutdown = shutdown;
    exports.port = app.get('port');
}

// Socket events
var io = require('socket.io')(server);

io.on('connection', function (socket) {
  console.log('A user connected to default room');

  socket.on('chat message', function (msg) {
    console.log('User Message:' + msg);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', function () {
    console.log('user disconnected from default room');
  });
});

var generalRoom = io.of('/general');

generalRoom.on('connection', function (socket) {
  console.log('User connected to General Room');
  generalRoom.emit('chat message', 'Welcome to General Room');
});

// Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
extended: true
}));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
if ('development' === app.get('env')){
    app.use(errorHandler());
}
app.use(function (req, res, next) {
    console.info('[Check request passed here!]');
    next();
});

// Routes
app.get('/', routes.index);
app.get('/message', routes.message);

app.all('*', function (req, res) {
    res.send(404);
});