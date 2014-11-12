var express = require('express'),
  routes = require('./routes'),
  http = require('http'),
  path = require('path'),
  logger = require('morgan'),
  bodyParser = require('body-parser'),
  errorHandler = require('errorhandler'),
  methodOverride = require('method-override'),
  app = express();
  
  app.locals.appTitle = 'Pinned.co';

// Database

// Configuration
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

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
    console.info('Check request passed here!');
    next()
});

// Routes
app.get('/', routes.index);
app.all('*', function (req, res) {
    res.send(404);
});

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