'use strict';

var router = require('express').Router(),
  path = require('path'),
  models = require(path.join(appRoot, 'models/mobile')),
  User = models.User,
  Message = models.Message,
  UserHasMessages = models.UserHasMessages,
  Logger = require(path.join(appRoot, 'Logger.js')),
  logger = new Logger().logger;

router.get('/', function(req, res) {
  var userId = parseInt(req.session.user.id);

  User.findById(userId, {
      include: [{
        model: Message,
        as: 'sent'
      }]
    }).bind({})
    .then(function(user) {
      this.user = user;
      return user.getMessages();
    }).then(function(messages) {
      messages.concat(this.user.sent);
      res.json({
        success: true,
        messages: messages
      });
    }).catch(function(err) {
      logger.log("error", "USER MESSAGE ROUTE\n%j", err);
      res.json({
        success: false,
        error: {
          message: "Couldn't get your messages"
        }
      })
    })
});

router.post('/send', function(req, res) {
  var userId = parseInt(req.session.user.id);
  var recipients = JSON.parse(req.body.recipients);

  User.findAll({
      where: {
        id: {
          $in: recipients
        }
      }
    }).bind({})
    .then(function(users) {
      this.recipients = users;
      return Message.create({
        subject: req.body.subject,
        message: req.body.message,
        SenderId: userId
      });
    }).then(function(message) {
      this.message = message
      return this.message.addRecipients(this.recipients);
    }).then(function() {
      res.json({
        success: true,
        message: this.message
      });
    }).catch(function(err) {
      logger.log("error", "USER MESSAGE SEND ROUTE\n%j", err);
      res.json({
        success: false,
        error: {
          message: "Error sending message..."
        }
      });
    });
});

router.post('/status', function(req, res) {
  var userId = parseInt(req.session.user.id);
  var messageId = parseInt(req.body.message_id);

  UserHasMessages.findOne({
      where: {
        MessageId: messageId,
        RecipientId: userId
      }
    })
    .then(function(message) {
      message.status = req.body.status;
      return message.save();
    }).then(function() {
      return User.findById(userId);
    }).then(function(user) {
      return user.getMessages({
        where: {
          id: messageId
        }
      });
    }).then(function(message) {
      res.json({
        success: true,
        message: message[0]
      });
    }).catch(function(err) {
      res.json({
        success: false,
        error: {
          message: "Error marking message as read..."
        }
      });
    });
});

router.post('/delete', function(req, res) {
  var userId = parseInt(req.session.user.id);
  var messageId = parseInt(req.body.message_id);

  UserHasMessages.findOne({
      where: {
        MessageId: messageId,
        RecipientId: userId
      }
    }).bind({})
    .then(function(message) {
      this.message = message;
      return message.destroy();
    }).then(function() {
      res.json({
        success: true,
        undo: this.message
      });
    }).catch(function(err) {
      res.json({
        success: false,
        error: {
          message: "Error deleting message"
        }
      });
    });
});

module.exports = router;
