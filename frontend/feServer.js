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
				// Print contents of the response received
  				displayResponse(authServerResponse); 
  				
  				if(authServerResponse.statusCode == 200)
  				{
  					// Great
					authServerResponse.on('data', function (chunk) {
   						if(chunk.statusCode == 0)
   						{
   							console.log('signup successful');
   						}
   						else
   						{
   							console.log('signup failed');	
   						}
						// append the JSON string to the end of the feServer response
   						writeResponse(res, authServerResponse.statusCode, chunk);
	  				});
  				}
  				else
  				{
  					console.log('auth Server didnt respond correctly');
  					writeResponse(res, authServerResponse.statusCode, chunk);
  				}
			});				
			// We MUST ALWAYS terminate request with this method
			authServerRequest.end();

		}

		// We will be sent a password (all plain text at this point), and deserialize this data
		// Example url: http://127.0.0.1:1337/?queryType=signin&password=hagu2014
		
		else if(queryData.queryType == "signin")
		{
    		// Take action to communicate with Auth server to take necessary action
    		// Parse the rest of the attributes
    		// Notify client that this is a sign in session

    		console.log('This is a sign in session.............');

    		// Now we may have to do password encryption/decryption here, but for now just check
			if(queryData.password)
			{
				console.log('Password: ' + queryData.password);
				// Pass this password to the auth server
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
					// Now we check the response to see if it is a valid password
					// if so, notify user about successful login
					// if not, notify about failure

					// Print contents of the response received
	  				displayResponse(authServerResponse); 
	  				
	  				if(authServerResponse.statusCode == 200)
	  				{
	  					// Great
						authServerResponse.on('data', function (chunk) {
	   						if(chunk.statusCode == 0)
	   						{
	   							console.log('signin successful');
	   						}
	   						else
	   						{
	   							console.log('signin failed');	
	   						}
							// append the JSON string to the end of the feServer response
	   						writeResponse(res, authServerResponse.statusCode, chunk);
		  				});
	  				}
	  				else
	  				{
	  					console.log('auth Server didnt respond correctly');
	  					writeResponse(res, authServerResponse.statusCode, chunk);
	  				}

				});			
				// We MUST ALWAYS terminate request with this method
				authServerRequest.end();

			}
			else
			{
				errorMessage('no password specified', 400, res);
			}
		}
		// We will be sent a secret key (all plain text at this point), and deserialize this data
		// Example url: http://127.0.0.1:1337/?queryType=verification&secretkey=abcd
		
		else if(queryData.queryType == "verification")
		{
			
			// Take action to communicate with Auth server to take necessary action
    		// Parse the rest of the attributes
    		// Notify client that this is a sign in session
			console.log('This is a verification session.............');

    		// Now we may have to do password encryption/decryption here, but for now just check
			if(queryData.secretkey)
			{
				console.log('Secret Key: ' + queryData.secretkey);
				// Pass this key to the auth server
				// NOT SURE IF THIS IS POST/GET
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
					// Now we check the response to see if the emailed link has expired or not
					// if it didn't, the user is officially IN
					// if not, notify about failure, and ask him to sign up again
					// In either case, we might have to do some stuff in MySQL/Redis

					// Print contents of the response received
	  				displayResponse(authServerResponse); 

	  				if(authServerResponse.statusCode == 200)
	  				{
	  					// Great
						authServerResponse.on('data', function (chunk) {
	   						if(chunk.statusCode == 0)
	   						{
	   							console.log('verification successful');
	   						}
	   						else
	   						{
	   							console.log('verification failed');	
	   						}
							// append the JSON string to the end of the feServer response
	   						writeResponse(res, authServerResponse.statusCode, chunk);
		  				});
	  				}
	  				else
	  				{
	  					console.log('auth Server didnt respond correctly');
	  					writeResponse(res, authServerResponse.statusCode, chunk);
	  				}				
				});			
				// We MUST ALWAYS terminate request with this method
				authServerRequest.end();
			}
			else
			{
				errorMessage('no secretkey specified', 400, res);
			}

		}

		// We will be sent a secret key (all plain text at this point), and deserialize this data
		// Example url: http://127.0.0.1:1337/?queryType=signout&username=sampritr&token=1234
		
		else if(queryData.queryType == "signout")
		{
			console.log('This is a signout session.....');
			// In reality, we will have a username and a token as params (but let's skip token for now)
			if(queryData.username)
			{
				console.log('Username: ' + queryData.username);
				// Pass this key to the auth server
				// NOT SURE IF THIS IS POST/GET
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
					// Might have to do something here for signout?
					// Print contents of the response received
	  				displayResponse(authServerResponse); 
	  				if(authServerResponse.statusCode == 200)
	  				{
	  					// Great
						authServerResponse.on('data', function (chunk) {
	   						if(chunk.statusCode == 0)
	   						{
	   							console.log('signout successful');
	   						}
	   						else
	   						{
	   							console.log('signout failed');	
	   						}
							// append the JSON string to the end of the feServer response
	   						writeResponse(res, authServerResponse.statusCode, chunk);
		  				});
	  				}
	  				else
	  				{
	  					console.log('auth Server didnt respond correctly');
	  					writeResponse(res, authServerResponse.statusCode, chunk);
	  				}				
				});
				//authServerRequest.write("BLAH!");				
				// We MUST ALWAYS terminate request with this method
				authServerRequest.end();
			}
			else
			{
				errorMessage('no username specified', 400, res);
			}
		}
		else if(queryData.queryType == "uploadPicture")
		{
			console.log('This is a picture upload session.....');
			// This is not implemented yet since we need to determine a protocol to communicate with Python FTP server
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
 	//res.writeHead(200, {'Content-Type': 'text/plain'});
  	//res.end('In the end.... I am the Front End Server\n');
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

function writeResponse(response, statusCode, JSONresponse)
{
	response.writeHead(statusCode, {'Content-Type': 'text/plain'});
	response.write(JSON.stringify(JSONresponse));
	response.end();	
}

function displayResponse(response)
{
	console.log('--------------');
	console.log('Contents of the response:');
	console.log('STATUS: ' + response.statusCode);
	console.log('HEADERS: ' + JSON.stringify(response.headers));
  	response.setEncoding('utf8');
  	response.on('data', function (chunk) {
   		console.log('BODY: ' + chunk);
   		console.log('--------------');
  	});
}