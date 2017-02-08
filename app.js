'use strict';

require('dotenv').load();

var express = require('express'),
  path = require('path'),
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

app.listen(app.get('port'), function(){
  logger.log("info", "Node app is running on port %s", app.get('port'));
});
