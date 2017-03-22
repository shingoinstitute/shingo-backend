'use strict';

var router = require('express').Router(),
    passwordHash = require('password-hash'),
    cleaner = require('deep-cleaner'),
    path = require('path'),
    Logger = require(path.join(appRoot, 'Logger.js')),
    logger = new Logger().logger,
    User = require(path.join(appRoot, 'models/mobile')).User;

module.exports = function (passport) {
    router.post('/login', passport.authenticate('local',{
            session: process.env.NODE_ENV === 'production'
        }), function (req, res) {
        res.status(200);
        req.session.user = req.user;
        cleaner(req.session.user.toJSON(), ['password']);
        res.json({
            success: true,
            user: req.session.user
        });
    });

    router.post('/create', function (req, res) {
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
            .spread(function (user, created) {
                if (created) {
                    req.session.user = user;
                    res.json({
                        success: true,
                        user: user
                    });
                } else {
                    throw new Error("User with email, " + req.body.email + ", already exists");
                }
            }).catch(function (err) {
                res.json({
                    success: false,
                    error: {
                        message: "User with email, " + req.body.email + ", already exists"
                    }
                });
            })
    });

    return router;
}