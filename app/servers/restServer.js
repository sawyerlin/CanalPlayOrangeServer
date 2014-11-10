var url = require('url');
var path = require('path');
var bodyParser = require('body-parser');
var express = require('express');
var proxy = require('proxy-middleware');
var mongoose = require('mongoose');

module.exports = function(app) {
	var router = express.Router();
	var canalRouter = express.Router();
  var api = '/api',
    logapi = '/logapi';

	// Create Express App
	app.use(bodyParser.urlencoded({
		extended: true
	}));

	app.use(bodyParser.json());

	router.get('/', function(req, res) {
		res.json({
			message: 'Logging Center'
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

	app.use(function(req, res, next) {
    req.headers.host = 'canalplay-r7.hubee.tv';
		//if (req.headers.origin != 'http://localhost') res.setHeader('Access-Control-Allow-Orign', '*');
    res.setHeader('Access-Control-Allow-Orign', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept, X-CPGRP-STB, X-Cpgrp-stb');
		next();
	});

	app.use(api, proxy(url.parse('http://canalplay-r7.hubee.tv/')));
	app.use(express.static(path.join(__dirname, 'datas')));
	app.use(logapi, router);
	app.use(logapi, canalRouter);

  mongoose.connect('mongodb://localhost:27017/canalplay');
};
