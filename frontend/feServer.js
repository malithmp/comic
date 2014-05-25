var http = require('http');
var sys = require("sys");  
var url = require("url");
var path = require("path");  
var util = require('util');
var querystring = require('querystring');

http.createServer(function (req, res) {
	
	// This is the frontend server, so we need to parse all the incoming requests and appropriately relay it to other servers
	// Let's handle the signup case first
	// We will be sent a user name and password and email(all plain text at this point), and deserialize this data
	// Example url: http://127.0.0.1:1337/?signup=true&username=sampritr&password=hagu2014&email=srshirsho@gmail.com
	/*
	
	querystring.parse('foo=bar&baz=qux&baz=quux&corge')
	// returns
	{ foo: 'bar', baz: ['qux', 'quux'], corge: '' }
	*/

	// Get a json representation on url
	var queryData = url.parse(req.url, true).query;
	// get each key value pair of attributes, and take necesssary actions
	// Eventually we will append messages to the end of this string and send a huge ass string as res.end, containing lots of information 
	var responseString;
	
	for(var key in queryData){
    	var attrName = key;
    	var attrValue = queryData[key];
    	
    	//console.log('Key:' + attrName);
    	//console.log('Value:' + attrValue);
    	// SIGN UP
    	if(attrName == "signup" && attrValue == "true")
    	{
    		// Take action to communicate with Auth server to take necessary action
    		// Parse the rest of the attributes
    		// Notify client that this is a sign up session
    		console.log('This is a sign up session.............');
    		
    		if(queryData.username && queryData.password && queryData.email)
    		{
    			console.log('Username: ' + queryData.username);
    			console.log('Password: ' + queryData.password);
    			console.log('Email: ' + queryData.email);

    			// Need regex to verify validity of username
    			var regex = /^[a-z]*[a-z0-9_]*[a-z0-9]$/; //This regex might have to be revised in the future
				var match = queryData.username.match(regex);
				if(match)
				{
					console.log('Username valid');	
				}
				else
				{
					console.log('Username invalid');
					res.writeHead(400, {'Content-Type': 'text/plain'});
					res.end('Username invalid\n');
					break;
				}
    			
    			// Now we need to communicate with Auth server
    			// Pass on the username, password and email as a post request to Auth server
				var options = {
				    host: '127.0.0.1',
				    port: 1338,
				    path: '/',
				    method: 'POST',
				    headers: {
				        'Content-Type': 'text/plain'
				    }
				};
				// connect to the Auth server
				console.log('Connecting to auth server.....');
				var authServerRequest = http.request(options, function(authServerResponse) {
					
					//Successfully made connection to auth server, now I need to pass in data
				});

				//authServerRequest.write("BLAH!");
				//authServerRequest.end();

				//res.writeHead(200, {'Content-Type': 'text/plain'});
    			//res.end('Login Successful\n');
       		}
    		else
    		{
    			console.log("username/password/email invalid");
    			res.writeHead(400, {'Content-Type': 'text/plain'});
    			res.end('username/password/email invalid \n');	
    		}
    			
    	}

    	// SIGN IN
    	if(attrName == "signin" && attrValue == "true")
    	{
    		// Take action to communicate with Auth server to take necessary action
    		// Parse the rest of the attributes
    		// Notify client that this is a sign up session
    		console.log('This is a sign in session.............');	
    	}

    	console.log('Done dealing with this particular url.....');
    	break;

    }
    // Default case if everything goes well
 	res.writeHead(200, {'Content-Type': 'text/plain'});
  	res.end('In the end.... I am the Front End Server\n');
}).listen(1337, '127.0.0.1');
console.log('front end Server running at http://127.0.0.1:1337/');


