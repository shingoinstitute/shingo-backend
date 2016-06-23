var router = require('express').Router(),
  educator_routes = require('./educator'),
  config = require('../../../config');

router.get('/auth', function(req, res) {
    if(!req.session.access_token){
      res.redirect(config.sf.environment + "/services/oauth2/authorize?response_type=code&client_id=" + config.sf.client_id + "&redirect_uri=" + config.sf.redirect_uri +"&state=" + req.protocol + "://lean.shingo.org");
    } else {
      res.redirect('/#/admin?authed=true');
    }
});

router.use('/educators', educator_routes);

module.exports = router;
