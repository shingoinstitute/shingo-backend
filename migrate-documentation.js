require('dotenv').load();
var db = require('./models/documentation'),
  config = require('./config')

db.sequelize.sync({
    force: config.force_drop
  })
  .then(function() {
    console.log("Beginning migration...");

    /* Logic to create/populate data goes here */

    console.log("Migration completed successfully!");
    process.exit(0);
  })
  .catch(function(err) {
    console.log(err);
    process.exit(1);
  })
