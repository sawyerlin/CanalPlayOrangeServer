var path = require('path');
var bodyParser = require('body-parser');
var express = require('express');
var proxy = require('proxy-middleware');
var mongoose = require('mongoose');
var cplRouter = require('../routers/cplRouter');

module.exports = function(app) {

    var atgUrl = 'https://secure-player-mycanal-ws.canal-plus.com/PLCPF/vod/mycanal/esb/ctx/json/infinity/free/xtc';

    var canalRouter = express.Router();

    var api = '/api',
        logapi = '/logapi';

    // Create Express App
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());

    canalRouter.get('/canal', function(req, res) {
        res.json({
            message: 'Logging Canal long test'
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

    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Orign', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept, X-CPGRP-STB, X-Cpgrp-stb');
        next();
    });

    app.use(api, new cplRouter(atgUrl));
    app.use(logapi, canalRouter);
    app.use('/datas', express.static(path.join(__dirname, '../../datas')));

    mongoose.connect('mongodb://localhost:27017/canalplay');
};
