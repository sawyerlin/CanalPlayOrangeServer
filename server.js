var http = require('http');
var fs = require('fs');
var _ = require('underscore');
var express = require('express');
var WebSocketServer = require('websocket').server;
var WebSocketClient = require('websocket').client;
var mongoose = require('mongoose');
var Log = require('./app/models/log.js');
var SemanticLogging = require('./app/libs/semanticlogging.js');
var PlainText = require('./app/libs/sinks/plaintext.js');
var restRouter = require('./app/routers/restRouter.js');

var app = express();
var logger = new SemanticLogging();
var loggerText = new PlainText('/var/log/canalplay/orange/error.log');
var port = process.env.PORT || 5000;

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
}).on('httpResponse', function(response, webSocketClient) {
	console.log(response);
	console.log(webSocketClient);
});

restRouter(app);

mongoose.connect('mongodb://localhost:27017/canalplay');

console.log('Port ' + port + ' is listened');
