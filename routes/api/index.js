'use strict';

var router = require('express').Router(),
  path = require('path'),
  user_api = require('./user'),
  sf_api = require('./salesforce'),
  support_api = require('./support'),
  lean_api = require('./lean-educator'),
  admin_api = require('./admin'),
  doc_api = require('./documentation'),
  config = require('../../config'),
  Promise = require('bluebird'),
  request = Promise.promisifyAll(require('request'));

router.use('/user', user_api);
router.use('/salesforce', sf_api);
router.use('/support', support_api);
router.use('/lean-educator', lean_api);
router.use('/admin', admin_api);
router.use('/documentation', doc_api);

router.get('/auth', function(req, res){
  console.log("query", req.query);
  if(!req.session.access_token){
    res.redirect(config.sf.environment + "/services/oauth2/authorize?response_type=code&client_id=" + config.sf.client_id + "&redirect_uri=https://api." + config.sf.redirect_uri + "&state=" + req.query.state);
  } else {
    res.redirect(req.query.state + '#/auth?authed=true');
  }
});

router.get('/auth_callback', function(req, res) {
    console.log("auth_callback");
    var post_data = {
        grant_type: 'authorization_code',
        code: req.query.code,
        client_id: config.sf.client_id,
        client_secret: config.sf.client_secret,
        redirect_uri: 'https://api.' + config.sf.redirect_uri,
    }

    var options = {
        url: config.sf.environment + '/services/oauth2/token',
        form: post_data
    }

    request.postAsync(options).then(function(body) {
        if(body.error){
          throw new Error(error.error_description);
        }
        if (!body.statusCode || body.statusCode != 200) {
          throw new Error((body.statusCode ? "status_code:" + body.statusCode : "error:" + body.error_description));
        }

        var response = JSON.parse(body.body);
        req.session.access_token = response.access_token;

        return res.redirect(req.query.state + '#/auth?authed=true');
    }).catch(function(err) {
        console.log(err);
        return res.redirect(req.query.state);
    });
});

router.use('/', function(req, res){
  res.redirect('docs.shingo.org');
});

module.exports = router;
