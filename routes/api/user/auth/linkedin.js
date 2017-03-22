'use strict';

var router = require('express').Router(),
    path = require('path'),
    cleaner = require('deep-cleaner');

module.exports = function (passport) {
    router.use('/login', passport.authenticate('linkedin'));
    router.use('/callback', function (req, res, next) {
        passport.authenticate('linkedin', {
            failureRedirect: '/login',
            session: process.env.NODE_ENV === 'production'
        })(req, res, next, function (err) {
            if (err) {
                return next(err);
            }

            if (!req.user) return next(Error("No user from LinkedInStrategy"));
            req.session.user = req.user;

            cleaner(req.session.user.toJSON(), ['password']);

            return res.json({
                success: true,
                user: req.session.user
            });
        })
    });

    return router;
}