'use strict';

var router = require('express').Router(),
  models = require('../../../models'),
  Promise = require('bluebird'),
  config = require('../../../config').cvent,
  CVENT = Promise.promisifyAll(require('../../../services/soap')),
  User = models.User;

var cvent_session = {
  client: null,
  timestamp: new Date(),
  CventSessionHeader: ""
}

router.use('*', function(req,res,next){
  if(cvent_session.timestamp.getTime() - (new Date()).getTime() > 3000000 || cvent_session.client === null){
    CVENT.getClientAsync()
    .then(function(client){
      cvent_session.client = client;

      var Login = {
        AccountNumber: config.account_number,
        UserName: config.username,
        Password: config.password
      }
      client.Login(Login, function(err, result){
        if(err) throw err;
        cvent_session.CventSessionHeader = result.LoginResult.attributes.CventSessionHeader
        var header = "<ns:CventSessionHeader><ns:CventSessionValue>" + cvent_session.CventSessionHeader + "</ns:CventSessionValue></ns:CventSessionHeader>"
        cvent_session.client.addSoapHeader(header)
        cvent_session.timestamp = new Date();
        cvent_session.client.setEndpoint(result.LoginResult.attributes.ServerURL);
        next();
      })
    }).catch(function(err){
      console.log("Error", err);
      res.json({success:false, error: err});
    })
  } else {
    next();
  }
})

router.get('/', function(req,res){
  var userId = parseInt(req.session.user_id);

  User.findById(userId).bind({})
  .then(function(user){
    this.user = user;
    var search_input = {
      "s1:CvObjectType": "Event",
      "s1:CveSearcyObject":{
        attributes: {SearchType: "AndSearch"},
        Filter:{
          Field: "EventTitle",
          Operator: "Equals",
          Value: "2016 Shingo Manufacturing Summit",
          ValueArray:{
            Value:[],
            "targetNSAlias": "s1",
            "targetNamespace": "http://schemas.cvent.com/api/2006-11"
          },
          "targetNSAlias": "s1",
          "targetNamespace": "http://schemas.cvent.com/api/2006-11"
        },
        "targetNSAlias": "s1",
        "targetNamespace": "http://schemas.cvent.com/api/2006-11"
      },
      "targetNSAlias": "s1",
      "targetNamespace": "http://schemas.cvent.com/api/2006-11"
    }
    // console.log("Search input", JSON.stringify(cvent_session.client.describe().V200611.V200611Soap.Search.input,null,4));
    cvent_session.client.Search(search_input, function(err,result){
      if(err) throw err;
      res.json({search_result: result})
    });
  }).catch(function(err){
    console.log("Throwing error");
    res.json({error: err});
  })
})

module.exports = router;
