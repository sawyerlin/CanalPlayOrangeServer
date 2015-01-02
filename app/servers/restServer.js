var url = require('url');
var https = require('https');
var path = require('path');
var bodyParser = require('body-parser');
var express = require('express');
var proxy = require('proxy-middleware');
var mongoose = require('mongoose');

module.exports = function(app) {
    var wsRouter = express.Router(),
        canalRouter = express.Router();

    var api = '/api',
        logapi = '/logapi';

    var atgUrl = 'https://secure-player-mycanal-ws.canal-plus.com/PLCPF/vod/mycanal/esb/ctx/json/infinity/free/xtc';

    // Create Express App
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());

    wsRouter.get('/', function(req, res) {
        res.json({
            message: 'WebService Center'
        });
    });

    wsRouter.route('/login').get(function(req, res) {
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
                'Accept': 'application/json',
                'Transfer-Encoding': '',
                'Except': ''
            };

        var options = {
            host: parsedAtgUrl.hostname,
            port: '443',
            path: loginUrl,
            method: 'POST',
            headers: headers
        };

        var postRequest = https.request(options, function(postResponse) {
            postResponse.setEncoding('utf8');
            postResponse.on('data', function(chunk) {
                console.log('body: ' + chunk);
            
            });
        });

        postRequest.on('socket', function (socket) {
            socket.setTimeout(4000);
            socket.on('timeout', function() {
                postRequest.abort();
            });
        });

        postRequest.on('error', function(err) {
            console.log(err);
        });

        postRequest.write(data);
        postRequest.end();

        res.json({
            "query": query,
            "loginUrl": loginUrl
        });
    });

    canalRouter.get('/canal', function(req, res) {
        res.json({
            message: 'Logging Canal'
        });
    });

    canalRouter.route('/canal/logs').post(function(req, res) {
        logger.logInformation('', req.body, function(err) {
            if (err) res.send(err);

            res.json({
                message: 'Log created!'
            });
        });
        loggerText.logInformation('', req.body, function(err) {
            if (err) res.send(err);
        });
    }).get(function(req, res) {
        Log.find(function(err, logs) {
            if (err) res.send(err);

            res.json(logs);
        });
    }).delete(function(req, res) {
        Log.find().remove(function(err, logs) {
            if (err) res.send(err);

            res.json({
                'logs': logs,
                'message': 'all logs are removed.'
            });
        });
    });

    canalRouter.route('/api/login').get(function(req, res) {
        console.log('test');
        //console.log(req.body);
    });

    app.use(function(req, res, next) {
        //req.headers.host = 'canalplay-r7.hubee.tv';
        //if (req.headers.origin != 'http://localhost') res.setHeader('Access-Control-Allow-Orign', '*');
        res.setHeader('Access-Control-Allow-Orign', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept, X-CPGRP-STB, X-Cpgrp-stb');
        next();
    });

    app.use(api, wsRouter);
    app.use(logapi, canalRouter);
    app.use('/datas', express.static(path.join(__dirname, '../../datas')));

    mongoose.connect('mongodb://localhost:27017/canalplay');
};
