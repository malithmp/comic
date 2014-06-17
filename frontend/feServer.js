var http = require('http');
var sys = require("sys");  
var url = require("url");
var path = require("path");  
var util = require('util');
var express = require('express');
var querystring = require('querystring');
var crypto = require('crypto');
var redis = require("redis");

 
var generate_key = function() {
    var sha = crypto.createHash('sha256');
    sha.update(Math.random().toString());
    return sha.digest('hex');
};


http.createServer(function (req, res) {
	
	// This is the frontend server, so we need to parse all the incoming requests and appropriately relay it to other servers
	// Get a json representation on url
	var queryData = url.parse(req.url, true).query;
	// get each key value pair of attributes, and take necesssary actions
	// Eventually we will append messages to the end of this string and send a huge ass string as res.end, containing lots of information 
	var responseString;
	var redisClient = redis.createClient();

	var JSONresponse = {
		"statusCode": 0,
		"message": "success"
	}
	var signinToken = null;
	// We need to review our protocol, first parameter will be 'queryType'
	// Does the queryType exist?

	console.log(JSONresponse.statusCode);
	// FE will look for the login token before proceeding with anything	
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
						chunk = JSON.parse(chunk);
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
		// Example url: http://127.0.0.1:1337/?queryType=signin&username=sampritr&password=hagu2014&signinToken=0
		
		else if(queryData.queryType == "signin")
		{
    		// Take action to communicate with Auth server to take necessary action
    		// Parse the rest of the attributes
    		// Notify client that this is a sign in session
    		// TODO Now I really need to refactor the URL param thing

    		console.log('This is a sign in session.............');

    		// Now we may have to do password encryption/decryption here, but for now just check
			if(queryData.username)
			{
				console.log('Username: ' + queryData.username);
				validateUsername(queryData.username);
			}
			else
			{
				errorMessage('no username specified', 400, res);
			}
			///////////////////////////////////////////////////////////
			if(queryData.signinToken)
			{
				// If first time sign in, signinToken is assigned 0
				// If not, we try getting in from redis
				// TODO If we can't find it, then we ask the user to fuck off, or look for it in MySQL?
				signinToken = getToken(queryData.username, queryData.signinToken, redisClient);
				// Error check
				if(signinToken == null)
				{
					// Tell the user to fuck off
					//function writeResponse(response, statusCode, JSONresponse)
					//console.log(JSONresponse.statusCode);
					JSONresponse.statusCode = -50; // Let's say -50 is for invalid token
					JSONresponse.message = "invalid signinToken";
					writeResponse(res, JSONresponse.statusCode, JSONresponse);
				}
				// if we've made it here, we can later get signinToken from auth server and cache in redis
			}
			else
			{
				errorMessage('no signinToken specified', 400, res);
			}

			//////////////////////////////////////////////////////////
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
	  				//console.log(authServerResponse);
	  				displayResponse(authServerResponse);

	  				// We will get a token back in the body, which we cache in redis
	  				// And also write to HTTP response to the client 
	  				
	  				if(authServerResponse.statusCode == 200)
	  				{
	  					// Great
	  					
						authServerResponse.on('data', function (chunk) {
							
							chunk = JSON.parse(chunk);
							if(chunk.statusCode == 0)
	   						{
	   							console.log('signin successful');
	   							// Get signinToken from auth server
	   							// Upon success, we are expecting a hex token from authServer
	   							signinToken = chunk.message;
 								
 								// TODO Cache the signinToken in redis, we might have to check expiration later (make a separate function)
                                redisClient.set(queryData.username, signinToken, function(error, result) {
                                    if (error) console.log('Error: ' + error);
                                    else console.log('Successfully cached username and signinToken in redis');
                                });

                                // TODO check to see if we can get it, will remove it later
                                redisClient.get(queryData.username, function(error, result) {
                                    if (error) console.log('Error: '+ error);
                                    else console.log('username:' + queryData.username + ', signinToken: ' + result);
                                });
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
	   						chunk = JSON.parse(chunk);
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
			}
			else
			{
				errorMessage('no username specified', 400, res);
			}
			if(queryData.signinToken)
			{
				// If first time sign in, signinToken is assigned 0
				// If not, we try getting in from redis
				// If we can't find it, then we ask the user to fuck off
				signinToken = getToken(queryData.username, queryData.signinToken, redisClient);
				// Error check
				if(signinToken == 0)
				{
					JSONresponse.statusCode = -50; // Let's say -50 is for invalid token
					JSONresponse.message = "invalid signinToken: Cannot have signinToken 0 for signout";
					writeResponse(res, JSONresponse.statusCode, JSONresponse);
				}
				else if(signinToken == null)
				{
					// TODO Tell the user to fuck off, or look for it in MySQL
					//function writeResponse(response, statusCode, JSONresponse)
					//console.log(JSONresponse.statusCode);
					JSONresponse.statusCode = -50; // Let's say -50 is for invalid token
					JSONresponse.message = "invalid signinToken";
					writeResponse(res, JSONresponse.statusCode, JSONresponse);
				}
				// If token exists, move on
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
							chunk = JSON.parse(chunk);
	   						if(chunk.statusCode == 0)
	   						{
	   							console.log('signout successful');
	   							//TODO: Remove the session id from redis
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
				// We MUST ALWAYS terminate request with this method
				authServerRequest.end();
			}
			else
			{
				errorMessage('no signinToken specified', 400, res);
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


function getToken(username, signinToken, redisClient) 
{
	if(signinToken == 0) 
	{
		console.log('signinToken is 0, first time entry');
		return signinToken;
	}
	else 
	{
		// compare with redis store, if not available, ask auth Server 
		redisClient.get(username, function(error, result) {
			if(error) 
			{
				console.log('Error: '+ error);
				console.log('Token not found in Redis, will look at authServer');
				// If not found in redis, we will ask authServer to look for it in backend database
				// TODO We might have to go check MySQL here instead of directly reporting error
				return getTokenFromAuth(username, signinToken);
            }
            else 
            { 
           	  	console.log('username:' + username + ', signinToken: ' + result);
               	return result;
            }
        });
	}
}


function getTokenFromAuth(username, signinToken)
{

	var options = {
	    host: '127.0.0.1',
	    port: 1338,
	    path: '?queryType=getToken&username=' + username + '&signinToken=' + signinToken,
	    method: 'POST'
	};

				// connect to the Auth server
	console.log('Connecting to auth server.....');
	console.log(path);
	var authServerRequest = http.request(options, function(authServerResponse) {
		// Print contents of the response received
		displayResponse(authServerResponse); 
		if(authServerResponse.statusCode == 200) 
		{
				// Great
			authServerResponse.on('data', function (chunk) {
				chunk = JSON.parse(chunk);
				if(chunk.statusCode == 0) 
				{
			   		if(chunk.message != null) 
			   		{
			   			console.log('Successfully fetched token from authServer');
			   			return chunk.message;
			   		}
			   	}
			   	else 
			   	{
			   		console.log('Failed to fetch token from authServer');
			   		return null;	
			   	}
			});
		} 
		else 
		{
		  	console.log('auth Server didnt respond correctly');
		 	return null;
		}				
	});
	authServerRequest.end();
}


			
				