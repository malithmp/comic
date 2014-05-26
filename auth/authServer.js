var http = require('http');
var sys = require("sys");  
var url = require("url");
var path = require("path");  
var util = require('util');
var querystring = require('querystring');

http.createServer(function (req, res) {
	console.log('I am auth Server and I just received a request');
	console.log('URL received is:' + req.url);

	// Let's start parsing data
	var queryData = url.parse(req.url, true).query;

	if(queryData.queryType == "signup")
	{
		console.log('Username: ' + queryData.username);
		console.log('Password: ' + queryData.password);
		console.log('Email: ' + queryData.email);	
	}
	

  	res.writeHead(200, {'Content-Type': 'text/plain'});
  	res.end('I am the auth server\n');
}).listen(1338, '127.0.0.1');
console.log('auth Server running at http://127.0.0.1:1338/');