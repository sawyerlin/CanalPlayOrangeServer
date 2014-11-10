var http = require('http');
var fs = require('fs');
var _ = require('underscore');
var express = require('express');
var WebSocketClient = require('websocket').client;
var Log = require('./app/models/log.js');
var SemanticLogging = require('./app/libs/semanticlogging.js');
var PlainText = require('./app/libs/sinks/plaintext.js');
var restServer = require('./app/servers/restServer.js');
var websocketServer = require('./app/servers/websocketServer.js');

var app = express();
var logger = new SemanticLogging();
var loggerText = new PlainText('/var/log/canalplay/orange/error.log');
var port = process.env.PORT || 5000;

// Create http Server
var server = http.createServer(app).listen(port);

// Create web socket Server
websocketServer(server);

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

// Create Rest Router
restServer(app);

console.log('Port ' + port + ' is listened');
