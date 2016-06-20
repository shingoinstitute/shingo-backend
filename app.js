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

var store = new MySQLStore(config.mysql_connection);
app.use(
    session({
        secret: 'iamawesome',
        store: store,
        resave: true,
        saveUninitialized: true,
        cookie: {
            secure: config.cookie_security,
            maxAge: 3600000
        }
    })
);

app.get('/auth_callback', function(req, res) {
    var post_data = {
        grant_type: 'authorization_code',
        code: req.query.code,
        client_id: config.sf.client_id,
        client_secret: config.sf.client_secret,
        redirect_uri: config.sf.redirect_uri,
    }

    var options = {
        url: config.sf.environment + '/services/oauth2/token',
        form: post_data
    }

    request.postAsync(options).then(function(body) {
        if (body.statusCode != 200) {
            throw new Error("status_code:" + body.status_code);
        }

        response = body.body;

        req.session.access_token = response.access_token;
        return res.redirect('/');
    }).catch(function(err) {
        console.log(err);
        return res.redirect('/');
    });
});

app.use('/', routes);

app.listen(app.get('port'), function(){
  console.log('Node app is running on port', app.get('port'));
});
