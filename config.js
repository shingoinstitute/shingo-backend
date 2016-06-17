// General Configurations
var config = {
  name           : process.env.NAME,
  force_drop     : (process.env.FORCE_DROP || false),
  cookie_security: (process.env.COOKIE_SEC || true),
  port           : (process.env.PORT || 5000)
}

// MySQL Configurations
config.mysql_connection = {
  host    : (process.env.MYSQL_URL || "localhost"),
  user    : process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB
}

// SF API Configurations
config.sf               = {
  client_id    : process.env.CLIENT_ID_SF,
  client_secret: process.env.CLIENT_SECRET_SF,
  redirect_uri : process.env.REDIRECT_URI_SF,
  environment  : process.env.ENVIRONMENT_SF,
  username     : process.env.USERNAME_SF,
  password     : process.env.PASSWORD_SF
}


module.exports = config;
