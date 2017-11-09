var express = require('express');
var router = express.Router();
var AuthService = require('../services/AuthService');
var SocketBank = require('../singletons/SocketBank');


router.post('/login', function(req, res, next) {
	var playerId = req.body.playerId;
	var password = req.body.password;

	console.log('Attempting to log in player id: ' + playerId);

	AuthService.validateCredentials(playerId, password)
		.then(AuthService.createToken)
		.then(function(token) {
            SocketBank.loginUser(playerId);
            req.app.io.sockets.emit('client:online', SocketBank.getOnlineClientIds());
			res.json({token: token});
		})
		.catch(next);
});

router.post('/flash', function(req, res, next) {
	var token = req.body.token;

    console.log('Attempting to re-log player.');

    AuthService.validateTokenCredentials(token)
        .then(function(payload) {
            SocketBank.loginUser(payload.playerId);
            req.app.io.sockets.emit('client:online', SocketBank.getOnlineClientIds());
            res.json({token: token});
        })
        .catch(next);
});

router.get('/logins', function(req, res, next) {
    AuthService.getLogins()
        .then(function(logins) {
            res.json({message: logins});
        })
        .catch(next);
});


module.exports = router;