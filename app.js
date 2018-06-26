'use strict';

require('dotenv').load();

// !!! Set a global variable for the app root
// This way we don't have to play the ../../../ game
var path = require('path'); 
global.appRoot = path.resolve(__dirname);
global.path = path;
var express = require('express'),
  session = require('express-session'),
  bodyParser = require('body-parser'),
  config = require('./config'),
  MySQLStore = require('express-mysql-session')(session),
  routes = require('./routes'),
  Logger = require('./Logger'),
  logger = new Logger().logger;


var app = express()
app.set('port', config.port)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

var store = new MySQLStore(config.mysql_connection.session_database);
app.use(
    session({
        secret: 'iamawesome',
        store: store,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: false
        }
    })
);

app.use('/', routes);
app.use(function(err, req, res, next) {
    console.error(err)
    logger.log('error', 'ERROR %s', err.toString())
    return next(err)
})

app.listen(app.get('port'), function(){
  logger.log("info", "Node app is running on port %s", app.get('port'));
});
