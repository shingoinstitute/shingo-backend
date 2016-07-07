require('dotenv').load();
var db = require('./models/lean-educator'),
  config = require('./config'),
  Promise = require('bluebird'),
  Converter = require('csvtojson').Converter,
  converter = new Converter({}),
  fs = require('fs');

var parsed = new Promise(function(resolve) {
  converter.on('end_parsed', resolve)
})

db.sequelize.sync({
    force: config.force_drop
  })
  .then(function() {
    console.log("Beginning migration...");

    /* Logic to create/populate data goes here */

    fs.createReadStream('./educators.csv').pipe(converter);

    return parsed;
  }).then(function(educators) {
    return db.Educator.bulkCreate(educators);
  }).then(function() {
    console.log("Migration completed successfully!");
    process.exit(0);
  })
  .catch(function(err) {
    console.log(err);
    process.exit(1);
  });

