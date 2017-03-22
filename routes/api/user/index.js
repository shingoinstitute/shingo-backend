'use strict';

var router = require('express').Router(),
  passwordHash = require('password-hash'),
  path = require('path'),
  Logger = require(path.join(appRoot, 'Logger.js')),
  logger = new Logger().logger,
  User = require(path.join(appRoot, 'models/mobile')).User,
  connection_route = require('./connection'),
  message_route = require('./message');

module.exports = function (passport) {
  var auth = require('./auth')(passport);
  router.use('/auth', auth);
  router.use('/connection', connection_route);
  router.use('/message', message_route);

  router.get('/', function (req, res) {
    User.findAll({
        where: {
          optOut: false
        },
        attributes: {
          exclude: ['password']
        }
      })
      .then(function (users) {
        res.json({
          success: true,
          users: users
        });
      }).catch(function (err) {
        res.json({
          success: false,
          error: {
            message: err
          }
        });
      });
  });

  router.get('/me', function(req, res, next){
    if(!req.session.user) return next({status: 401, message: 'Please login...'});
    res.json({success: true, user: req.session.user});
  });

  router.get('/logout', function (req, res) {
    req.session.destroy();
    delete req.user;
    logger.log('debug', "User logged out");
    res.json({success: true, message: 'User logged out'});
  });

  router.get('/unconnected', function (req, res) {
    var userId = parseInt(req.session.user.id);

    User.findById(userId).bind({})
      .then(function (user) {
        this.user = user;
        return user.getChildren();
      }).then(function (children) {
        this.children = children;
        return this.user.getParents();
      }).then(function (parents) {
        var connections = this.children.concat(parents);
        var connectionIds = new Array();
        for (var i = 0; i < connections.length; i++) {
          connectionIds.push(connections[i].id);
        }
        connectionIds.push(userId);

        return User.findAll({
          where: {
            id: {
              $notIn: connectionIds
            },
            optOut: false
          },
          attributes: {
            exclude: ['password']
          }
        });
      }).then(function (users) {
        res.json({
          success: true,
          users: users
        });
      }).catch(function (err) {
        res.json({
          success: false,
          error: {
            message: "Error finding users"
          }
        });
      });
  });

  return router;
}