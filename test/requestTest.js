var http = require('http');

var options = {
  host: 'localhost',
  path: 'canalplay-r7.hubee.tv/login',
	method: 'POST',
	headers: {
		'X-Cpgrp-Stb': 'MSD:2492575534768 NUID:0xDEADBEEF CASN:0x69BC5769'
	}
};

var req = http.request(options);

req.on('connect', function(res, socket, head){
  console.log('got connected!');
  /*console.log(res);*/
  //console.log(socket);
  /*console.log(head);*/
});


req.end();
