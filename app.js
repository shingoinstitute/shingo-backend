'use strict';

require('dotenv').load();

var express = require('express'),
  path = require('path'),
  session = require('express-session'),
  bodyParser = require('body-parser'),
  config = require('./config'),
  MySQLStore = require('express-mysql-session')(session),
  winston = require('winston'),
  routes = require('./routes');

winston.add(winston.transports.File, {
  filename: config.name + '.log'
});

var logger = new(winston.Logger)({
  transports: [
    new(winston.transports.Console)(),
    new(winston.transports.File)({
      filename: config.name + '.log'
    })
  ]
});

console.log = logger.info;

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
  console.log('Node app is running on port', app.get('port'));
});
