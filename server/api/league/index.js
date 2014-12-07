'use strict';

var express = require('express');
var controller = require('./league.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/:id/teams', auth.isAuthenticated(), controller.teams);
router.get('/:id/rival_teams', auth.isAuthenticated(), controller.rival_teams);
router.get('/:id/settings', controller.settings);
router.get('/:id/settings/:key', controller.settings);
router.post('/', controller.create);
router.post('/:id/populate', controller.populate);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);


module.exports = router;
