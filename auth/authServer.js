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

	// Default value of the JSON to be returned
	var JSONresponse = {
		"statusCode": 0,
		"message": "success"
	}

	if(queryData.queryType == "signup")
	{
		console.log('This is a signup session');
		console.log('Username: ' + queryData.username);
		console.log('Password: ' + queryData.password);
		console.log('Email: ' + queryData.email);

		/*
		// RESPONSE: success/fail  and message (int Error Code)

		// Insert code to check if signup was successful of not

		// if fail (probably username taken), then add the following
		//JSONresponse.statusCode = -10;
		JSONresponse.message = "username taken";
		
		// Insert checks for 404 NOT FOUND errors if you think they may occur
		// In the end return JSON string as response
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write(JSON.stringify(JSONresponse));
		res.end();
		*/
	}
	
	if(queryData.queryType == "signout")
	{
		console.log('This is a signout session');
		console.log('Username: ' + queryData.username);
		/*
		// if signout fail
		JSONresponse.statusCode = -40;
		JSONresponse.message = "signout fail";
		// Insert checks for 404 NOT FOUND errors if you think they may occur
		// In the end return JSON string as response
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write(JSON.stringify(JSONresponse));
		res.end();
		*/
	}

	if(queryData.queryType == "signin")
	{
		console.log('This is a signin session');
		console.log('Password: ' + queryData.password);
		
		/*
		
		// if fail
		JSONresponse.statusCode = -30;
		JSONresponse.message = "signin fail";
		// Insert checks for 404 NOT FOUND errors if you think they may occur
		// In the end return JSON string as response
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write(JSON.stringify(JSONresponse));
		res.end();
		*/
	}

	if(queryData.queryType == "verification")
	{
		console.log('This is a verification session');
		console.log('Secret Key: ' + queryData.secretkey);
		/*
		// if username doesn't exist
		JSONresponse.statusCode = -40;
		JSONresponse.message = "username doesn't exist";
		
		// if username/password mismatch
		JSONresponse.statusCode = -41;
		JSONresponse.message = "username password mismatch";
		// Insert checks for 404 NOT FOUND errors if you think they may occur
		// In the end return JSON string as response
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write(JSON.stringify(JSONresponse));
		res.end();
		*/
	}
  	
  	// Disable them for now
  	//res.writeHead(200, {'Content-Type': 'text/plain'});
  	//res.end('I am the auth server\n');
}).listen(1338, '127.0.0.1');
console.log('auth Server running at http://127.0.0.1:1338/');

function errorMessage(message, statusCode, response)
{
	console.log(message);
	response.writeHead(statusCode, {'Content-Type': 'text/plain'});
	response.end(message + '\n');

}