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
  passport = require('passport'),
  MySQLStore = require('express-mysql-session')(session),
  mobileModels = require(path.join(appRoot, 'models/mobile')),
  Logger = require('./Logger'),
  logger = new Logger().logger;

mobileModels.sequelize.sync()
.then(function(){
    logger.log('info', 'Mobile models synced');
})
.catch(function(err){
    logger.log('error', 'Error syncing mobile models %j', err);
});

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

require(path.join(appRoot, 'passport.js'))(passport);

app.use(passport.initialize());
app.use(passport.session());

var routes = require('./routes')(passport);

app.use('/', routes);

app.use(function(req, res, next){
    res.status(404);

    if(req.accepts('json')) return res.send({error: '+++++++++++++++++++++++++++\n** Whoops! Couldn\'t find **\n** what you were looking **\n**                       **\n**      ¯\_(ツ)_/¯       **\n+++++++++++++++++++++++++++'});
    res.type('txt').send('+++++++++++++++++++++++++++\n** Whoops! Couldn\'t find **\n** what you were looking **\n**                       **\n**      ¯\_(ツ)_/¯       **\n+++++++++++++++++++++++++++')
});

app.use(function(error, req, res, next){
    res.status(error.status || 500);

    logger.log('error', error);

    if(req.accepts('json')){
        if(app.get('env') === 'development') return res.send({error: error});
        else return res.send({error: "An unknown error has occurred..."});
    }
    if(app.get('env') === 'development') return res.type('txt').send(JSON.stringify(error));
    else return res.type('txt').send('An unknown error has occurred...');
});

app.listen(app.get('port'), function(){
  logger.log("info", "Node app is running on port %s", app.get('port'));
});
