var fs = require('fs');
var url = require('url');
var http = require('http');
var bodyParser = require('body-parser');
var _ = require('underscore');
var express = require('express');
var proxy = require('proxy-middleware');
var WebSocketServer = require('websocket').server;
var WebSocketClient = require('websocket').client;
var mongoose = require('mongoose');
var Log = require('./app/models/log.js');
var SemanticLogging = require('./app/libs/semanticlogging.js');
var PlainText = require('./app/libs/sinks/plaintext.js');

var app = express();
var logger = new SemanticLogging();
var loggerText = new PlainText('/var/log/canalplay/orange/error.log');
var port = process.env.PORT || 5000;
var router = express.Router();
var canalRouter = express.Router();

// Create Server
var server = http.createServer(app).listen(port);

// Create WebSocket App
var connections = [];

var wsServer = new WebSocketServer({
	httpServer: server,
	autoAcceptConnections: false,
	maxReceivedFrameSize: '5Mib',
	maxReceivedMessageSize: '50Mib'
});

wsServer.on('request', function(request) {
	var connection = request.accept(request.origin);
	connections.push(connection);
	_.each(connections, function(con) {
		console.log(con.remoteAddress + ' Connected: ' + con.connected);
	});

	console.log((new Date()) + ' Connection accepted.');

	connection.on('message', function(message) {
		console.log(message);
	});

	connection.on('close', function(code, description) {
		connections.splice(connections.indexOf(this), 1);
		console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected. ' + 'Reason: ' + code + '. Description ' + description);
	});
});

// Create WebSocket Client
var clientConnection;
var client = new WebSocketClient();
client.connect('ws://localhost' + ':' + port, null);
client.on('connect', function(con) {
	clientConnection = con;
}).on('connectFailed', function(description) {
	console.log(description);
}).on('httpResponse', function(response, webSocketClient){
  console.log(response);
  console.log(webSocketClient);
});

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
  loggerText.logInformation('', req.body, function(err){
    if(err) res.send(err);
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

app.use(function(req, res, next){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');
  res.setHeader('Access-Control-Allow-Credentials', true); 
  next();
});

app.use('/api', proxy(url.parse('http://canalplay-r7.hubee.tv/')));
app.use('/logapi', router);
app.use('/logapi', canalRouter);

mongoose.connect('mongodb://localhost:27017/canalplay');

console.log('Port ' + port + ' is listened');
