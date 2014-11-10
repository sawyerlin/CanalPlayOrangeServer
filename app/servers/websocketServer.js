var _ = require('underscore');
var WebSocketServer = require('websocket').server;

module.exports = function(server) {
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
};
