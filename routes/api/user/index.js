'use strict';

var router = require('express').Router(),
  passwordHash = require('password-hash'),
  path = require('path'),
  User = require(path.join(appRoot, 'models/mobile')).User,
  connection_route = require('./connection'),
  message_route = require('./message');

router.use('/connection', connection_route);
router.use('/message', message_route);

router.get('/', function(req, res) {
  User.findAll({
      where: {
        optOut: false
      },
      attributes: {
        exclude: ['password']
      }
    })
    .then(function(users) {
      res.json({
        success: true,
        users: users
      });
    }).catch(function(err) {
      res.json({
        success: false,
        error: {
          message: err
        }
      });
    });
});

router.post('/login', function(req, res) {
  User.findOne({
      where: {
        email: req.body.email
      }
    })
    .then(function(user) {
      if (passwordHash.verify(req.body.password, user.password)) {
        req.session.user_id = user.id;
        res.json({
          success: true,
          user: user
        });
      } else {
        throw new Error("Invalid username or password");
      }
    }).catch(function(err) {
      res.json({
        success: false,
        error: {
          message: "Invalid username or password"
        }
      });
    });
});

router.get('/logout', function(req, res) {
  req.session.destroy();
  res.end();
});

router.get('/unconnected', function(req, res) {
  var userId = parseInt(req.session.user_id);

  User.findById(userId).bind({})
    .then(function(user) {
      this.user = user;
      return user.getChildren();
    }).then(function(children) {
      this.children = children;
      return this.user.getParents();
    }).then(function(parents) {
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
    }).then(function(users) {
      res.json({
        success: true,
        users: users
      });
    }).catch(function(err) {
      res.json({
        success: false,
        error: {
          message: "Error finding users"
        }
      });
    });
});

router.post('/create', function(req, res) {
  User.findOrCreate({
      where: {
        email: req.body.email
      },
      defaults: {
        password: passwordHash.generate(req.body.password),
        name: req.body.name,
        biography: req.body.biography,
        phone: req.body.phone,
        website: req.body.website,
        optOut: req.body.opt_out
      }
    })
    .spread(function(user, created) {
      if (created) {
        req.session.user_id = user.id;
        res.json({
          success: true,
          user: user
        });
      } else {
        throw new Error("User with email, " + req.body.email + ", already exists");
      }
    }).catch(function(err) {
      res.json({
        success: false,
        error: {
          message: "User with email, " + req.body.email + ", already exists"
        }
      });
    })
})

module.exports = router;
