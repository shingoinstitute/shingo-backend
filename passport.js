'use strict';

var LocalStrategy = require('passport-local').Strategy,
    LinkedInStrategy = require('passport-linkedin-oauth2').Strategy,
    User = require(path.join(appRoot, 'models/mobile')).User,
    config = require(path.join(appRoot, 'config.js')),
    Logger = require(path.join(appRoot, 'Logger.js')),
    logger = new Logger().logger;

module.exports = function (passport) {
    passport.use('local', new LocalStrategy(
        config.LocalStrategyConfig,
        function (email, password, done) {
            User.findOne({ where: { email: email }})
                .then(function (user) {
                    if (!user) return done(null, false);
                    if (!user.verifyPassword(password)) return done(null, false);
                    user.lastLogin = new Date();
                    return user.save();
                })
                .then(function(user){
                    return done(null, user);
                })
                .catch(function (err) {
                    return done(err, false);
                });
        }
    ));

    passport.use('linkedin', new LinkedInStrategy(
        config.LinkedInStrategyConfig,
        function (accessToken, refreshToken, profile, done) {
            var json = profile._json;
            var query = {};
            query.linkedinId = json.id;
            query.email = json.emailAddress;
            query.firstname = json.firstname;
            query.lastname = json.lastname;
            query.pictureUrl = json.pictureUrl;
            query.bio = json.summary;

            User.findOne({
                    where: {
                        email: query.email
                    }
                })
                .then(function (user) {
                    if (!user) {
                        return User.create(query);
                    } else {
                        user.email = query.email;
                        user.pictureUrl = query.pictureUrl;
                        user.lastLogin = new Date();
                        return user.save();
                    }
                })
                .then(function (user) {
                    if (!user) return done(null, false);
                    return done(null, user);
                })
                .catch(function (err) {
                    return done(err, false);
                });
        }))

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
}