'use strict';

var router = require('express').Router(),
  path = require('path'),
  models = require(path.join(appRoot, 'models/mobile')),
  cleaner = require('deep-cleaner'),
  Logger = require(path.join(appRoot, 'Logger.js')),
  logger = new Logger().logger,
  User = models.User,
  Connection = models.Connection;

router.get('/', function (req, res, next) {
  var userId = parseInt(req.session.user.id);

  User.findById(userId, {
      include: [{
        model: User,
        as: 'children',
        attributes: {
          exclude: ['password']
        },
        through: {
          where: {
            status: {
              $ne: 'Rejected'
            }
          }
        }
      }, {
        model: User,
        as: 'parents',
        attributes: {
          exclude: ['password']
        },
        through: {
          where: {
            status: {
              $ne: 'Rejected'
            }
          }
        }
      }]
    }).bind({})
    .then(function (user) {
      var connections = user.children.concat(user.parents);
      res.json({
        success: true,
        connections: connections
      });
    })
    .catch(function (err) {
      logger.log('error', err);
      next(err);
    })
});

router.post('/request', function (req, res, next) {
  var userId = parseInt(req.session.user.id);
  var connectionId = parseInt(req.body.connection_id);

  User.findById(userId).bind({})
    .then(function (user) {
      this.parentUser = user;
      return User.findById(connectionId, {
        attributes: {
          exclude: ['password']
        }
      });
    })
    .then(function (user) {
      this.childUser = user;
      return this.parentUser.addChild(user);
    })
    .then(function () {
      res.json({
        success: true,
        user: this.childUser
      });
    })
    .catch(function (err) {
      logger.log('error', err);
      next(err);
    });
});

router.post('/reply', function (req, res, next) {
  var userId = parseInt(req.session.user.id);
  var connectionId = parseInt(req.body.connection_id);
  var status = (req.body.accepted == "true" ? "Accepted" : "Rejected");

  User.findById(userId).bind({})
    .then(function (user) {
      this.user = user;
      return user.getParents({
        where: {
          id: connectionId
        },
        attributes: {
          exclude: ['password']
        }
      })
    })
    .then(function (parents) {
      parents[0].Connection.status = status;
      return parents[0].Connection.save();
    })
    .then(function () {
      return this.user.getChildren({
        attributes: {
          exclude: ['password']
        }
      });
    })
    .then(function (children) {
      this.children = children
      return this.user.getParents({
        attributes: {
          exclude: ['password']
        }
      });
    })
    .then(function (parents) {
      var connections = this.children.concat(parents);
      res.json({
        success: true,
        connections: connections
      })
    })
    .catch(function (err) {
      logger.log('error', err);
      next(err);
    });
});

router.post('/remove', function (req, res, next) {
  var userId = parseInt(req.session.user.id);
  var connectionId = parseInt(req.body.connection_id);
  User.findById(userId).bind({})
    .then(function (user) {
      this.user = user;
      return user.getChildren({
        where: {
          id: connectionId
        }
      });
    })
    .then(function (children) {
      this.children = children;
      return this.user.getParents({
        where: {
          id: connectionId
        }
      });
    }).then(function (parents) {
      var connections = this.children.concat(parents);
      for (var i = 0; i < connections.length; i++) {
        if (connections[i].id == connectionId) {
          connections[i].Connection.status = "Rejected";
          connections[i].Connection.save();
        }
      }
      return this.user.getChildren({
        attributes: {
          exclude: ['password']
        }
      });
    }).then(function (children) {
      this.children = children;
      return this.user.getParents({
        attributes: {
          exclude: ['password']
        }
      });
    }).then(function (parents) {
      var connections = this.children.concat(parents);
      res.json({
        success: true,
        connections: connections
      });
    }).catch(function (err) {
      logger.log('error', err);
      next(err);
    });
});

module.exports = router;