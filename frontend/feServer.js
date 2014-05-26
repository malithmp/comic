var http = require('http');
var sys = require("sys");  
var url = require("url");
var path = require("path");  
var util = require('util');
var querystring = require('querystring');

http.createServer(function (req, res) {
	
	// This is the frontend server, so we need to parse all the incoming requests and appropriately relay it to other servers
	// Get a json representation on url
	var queryData = url.parse(req.url, true).query;
	// get each key value pair of attributes, and take necesssary actions
	// Eventually we will append messages to the end of this string and send a huge ass string as res.end, containing lots of information 
	var responseString;
	
	// We need to review our protocol, first parameter will be 'queryType'
	// Does the queryType exist?
	if(queryData.queryType)
	{
		// Let's handle the signup case first
		// We will be sent a user name and password and email(all plain text at this point), and deserialize this data
		// Example url: http://127.0.0.1:1337/?queryType=signup&username=sampritr&password=hagu2014&email=srshirsho@gmail.com
		if(queryData.queryType == "signup")
		{
			// Take action to communicate with Auth server to take necessary action
    		// Parse the rest of the attributes
    		// Notify client that this is a sign up session
    		console.log('This is a sign up session.............');

    		// In case of any of these else statements, we should report error and QUIT (not doing this apparently it seems)
			if(queryData.username)
			{
				console.log('Username: ' + queryData.username);
				validateUsername(queryData.username);
			}
			else
			{
				errorMessage('no username specified', 400, res);
			}
			
			// Now we may have to do password encryption/decryption here, but for now just check
			if(queryData.password)
			{
				// Not sure if we are actually gonna enforce a password restriction?
				console.log('Password: ' + queryData.password);
			}
			else
			{
				errorMessage('no password specified', 400, res);
			}
			
			// Might wanna check validity of email? Or not....
			if(queryData.email)
			{
				console.log('Email: ' + queryData.email);
			}			
			else
			{
				errorMessage('no email specified', 400, res);
			}

			// If we have made it this far, then the input parameters should be ok, let's issue request to auth server
			// Now we need to communicate with Auth server
    		// Pass on the username, password and email as a post request to Auth server
			var options = {
			    host: '127.0.0.1',
			    port: 1338,
			    path: req.url,
			    method: 'POST'
			};
			// connect to the Auth server
			console.log('Connecting to auth server.....');
			console.log(req.url);
			var authServerRequest = http.request(options, function(authServerResponse) {
				
				// Successfully made connection to auth server				
			});

			//authServerRequest.write("BLAH!");				
			// We MUST ALWAYS terminate request with this method
			authServerRequest.end();

		}
		else if(queryData.queryType == "signin")
		{
    		// Take action to communicate with Auth server to take necessary action
    		// Parse the rest of the attributes
    		// Notify client that this is a sign ip session
    		console.log('This is a sign in session.............');	
		}
		else if(queryData.queryType == "verification")
		{
			console.log('This is a verification session.............');
		}
		else
		{
			errorMessage('queryType is invalid', 400, res);
		}
	}
	else
	{
		errorMessage('no queryType specified', 400, res);
	}
    // Default case if everything goes well
 	res.writeHead(200, {'Content-Type': 'text/plain'});
  	res.end('In the end.... I am the Front End Server\n');
}).listen(1337, '127.0.0.1');
console.log('front end Server running at http://127.0.0.1:1337/');

function errorMessage(message, statusCode, response)
{
	console.log(message);
	response.writeHead(statusCode, {'Content-Type': 'text/plain'});
	response.end(message + '\n');

}

function validateUsername(username, response)
{
	// Need regex to verify validity of username
	// Regex not working properly, damnit!
    var regex = /^[a-z]*[a-z0-9_]*[a-z0-9]$/; //This regex might have to be revised in the future
	var match = username.match(regex);
		
	if(match)
	{
		console.log('Username valid');	
	}
	else
	{	
		errorMessage('Username invalid', 400, response);
	}
}