var express = require('express');
var url = require('url');
var path = require('path');
var https = require('https');
var _ = require('underscore');

module.exports = function(atgUrl) {

    var router = express.Router();

    router.get('/', function(req, res) {
        res.json({
            message: 'WebService Center'
        });
    });

    router.route('/login').get(function(req, res) {
        var parsedAtgUrl = url.parse(atgUrl);

        var query = url.parse(req.url, true).query,
            loginUrl = path.join(parsedAtgUrl.pathname, '/rest/authentication/login');

        var data = JSON.stringify({
            "itemType": "device", 
            "type": "Freebox", 
            "login": "1000000001", 
            "msd": "44110653526", 
            "userAgent": "freebox/6.0", 
            "macAdress": "00:07:CB:00:00:01"
        });

        var headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };

        var options = {
            host: parsedAtgUrl.hostname,
            port: 443,
            path: loginUrl,
            method: 'POST',
            headers: headers
        };

        var postRequest = https.request(options, function(postResponse) {
            var result = '';
            postResponse.setEncoding('utf8');
            postResponse.on('data', function(chunk) {
                result += chunk;
            });

            postResponse.on('end', function() {

                var resultJson = JSON.parse(result);

                var uid = _.find(resultJson.userDTO.externalIds, function(id) { return id.type === 'ldapUID'; }).value;

                res.json({
                    'status': postResponse.statusCode,
                    'token': resultJson.token,
                    'loapUID': 'pf:' + uid + ':11820'
                });
            });
        });

        postRequest.on('socket', function(socket) {
            socket.setTimeout(4000);
            socket.on('timeout', function() {
                console.log('login timeout');
                postRequest.abort();
            });
        });

        postRequest.on('error', function(err) {
            console.log(err);
        });

        postRequest.write(data);
        postRequest.end();
    });

    return router;
}
