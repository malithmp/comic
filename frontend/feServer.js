var http = require('http');
var sys = require("sys");  
var url = require("url");
var path = require("path");  
var util = require('util');
var express = require('express');
var querystring = require('querystring');
var crypto = require('crypto');
var redis = require("redis");
var fs = require('fs');
var serverConfigFile = "../serverConfigFile.json";
var config = {};
// Read the config file SYNCHRONOUSLY to get server configuration info into config object, for use all throughout
config["servers"] = JSON.parse(fs.readFileSync(serverConfigFile, 'utf8'));
var servers = config.servers.Servers;

http.createServer(function (req, res) {
	
	// This is the frontend server, so we need to parse all the incoming requests and appropriately relay it to other servers
	// Get a json representation on url
	var queryData = url.parse(req.url, true).query;

	// Parse HTTP body to get all required info
	var feServerChunk = {};
	req.on('data', function (feServerChunk) {					
		feServerChunk = JSON.parse(feServerChunk);
		

		var redisClient = redis.createClient();

		var JSONresponse = {
			"statusCode": 0,
			"message": "success"
		}
		var signinToken = null;
		// Print the incoming URL
		console.log(req.url);
		// Does the queryType exist?
		if(queryData.queryType)
		{

			// Example url: http://127.0.0.1:1337/?queryType=signup
			// BODY username=sampritr password=hagu2014 email=srshirsho@gmail.com
			if(queryData.queryType == "signup")
			{
	    		// Notify client that this is a sign up session
	    		console.log('This is a sign up session.............');
				checkSignUpParams(feServerChunk, res);
				// If we have made it this far, then the input parameters should be ok, let's issue request to auth server
	    		// Pass on the username, password and email as a post request to Auth server
				var options = {
				    host: servers.authServer.host,
				    port: servers.authServer.port,
				    path: req.url,
				    method: 'POST'
				};
				var postData = JSON.stringify(feServerChunk); 
				console.log('Connecting to auth server.....');
				var authServerRequest = http.request(options, function(authServerResponse) {
					
	  				displayResponse(authServerResponse); 
	  				
	  				if(authServerResponse.statusCode == 200)
	  				{
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
				authServerRequest.write(postData);	
				authServerRequest.end();
			}
			
			// Example url: http://127.0.0.1:1337/?queryType=signin
			// BODY username=sampritr password=hagu2014 signinToken=0
			
			else if(queryData.queryType == "signin")
			{
	    		console.log('This is a sign in session.............');
				console.log('CHUNK IS:', feServerChunk);
				checkSignInParams(feServerChunk, res, redisClient, JSONresponse);
	    				
				var options = {
				    host: servers.authServer.host,
				    port: servers.authServer.port,
				    path: req.url,
				    method: 'POST'
				};
				var postData = JSON.stringify(feServerChunk);
				console.log('Connecting to auth server.....');
				var authServerRequest = http.request(options, function(authServerResponse) {
					
					displayResponse(authServerResponse);

	  				// We will get a token back in the body, which we cache in redis
	  				// And also write to HTTP response to the client 
	   				if(authServerResponse.statusCode == 200)
	  				{
						authServerResponse.on('data', function (chunk) {
							
							chunk = JSON.parse(chunk);
							if(chunk.statusCode == 0)
	   						{
	   							console.log('signin successful');
	   							// Get signinToken from auth server
	   							// Upon success, we are expecting a hex token from authServer
	   							signinToken = chunk.message;
									
								// TODO Cache the signinToken in redis
	                            redisClient.set(feServerChunk.username, signinToken, function(error, result) {
	                                if (error) console.log('Error: ' + error);
	                                else console.log('Successfully cached username and signinToken in redis');
	                            });
	                            
	                            // TODO Expire after 900 seconds (15 minutes)
	                            redisClient.expire(feServerChunk.username, 900, function(error, didSetExpiry){
	                            	if(didSetExpiry)
	                            		console.log('Successfully set expiry time on redis for key ', feServerChunk.username);
	                            	else if(!didSetExpiry)
	                            		console.log('Key', feServerChunk.username, 'does not exist on redis server');
	                            	else if(error)
	                            		console.log('Error: ' + error);
	                            });
	                            // TODO check to see if we can get it, will remove it later
	                            redisClient.get(feServerChunk.username, function(error, result) {
	                                if (error) console.log('Error: '+ error);
	                                else console.log('username:' + feServerChunk.username + ', signinToken: ' + result);
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
				authServerRequest.write(postData);	
				authServerRequest.end();
			}
			// We will be sent a secret key (all plain text at this point), and deserialize this data
			// Example url: http://127.0.0.1:1337/?queryType=verification
			// BODY secretkey=abcd
			
			else if(queryData.queryType == "verification")
			{
				console.log('This is a verification session.............');
				
				if(feServerChunk.secretkey)
				{
					console.log('Secret Key: ' + feServerChunk.secretkey);
					// Pass this key to the auth server
					var options = {
					    host: servers.authServer.host,
					    port: servers.authServer.port,
					    path: req.url,
					    method: 'POST'
					};
					var postData = JSON.stringify(feServerChunk);
					// connect to the Auth server
					console.log('Connecting to auth server.....');
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
					authServerRequest.write(postData);
					authServerRequest.end();
				}
				else
				{
					errorMessage('no secretkey specified', 400, res);
				}
			}

			// Example url: http://127.0.0.1:1337/?queryType=signout
			// BODY username=sampritr token=1234
			else if(queryData.queryType == "signout")
			{
				console.log('This is a signout session.....');		
				checkSignOutParams(feServerChunk, res, redisClient);
				//signinToken = checkToken(feServerChunk, res, redisClient, JSONresponse); 
				checkToken(feServerChunk, res, redisClient, JSONresponse, function(error, result){
					
					signinToken = result;			
					console.log('signinToken is:', signinToken);
					// Won't come here if signinToken is 0, since that is clearly invalid
					if(signinToken == null)
					{
						// fuck off
						JSONresponse.statusCode = -50;
						JSONresponse.message = "invalid signinToken: The signinToken doesn't exist";
						writeResponse(res, 200, JSONresponse);
					}
				});
				var options = {
				    host: servers.authServer.host,
				    port: servers.authServer.port,
				    path: req.url,
				    method: 'POST'
				};
				var postData = JSON.stringify(feServerChunk);
				// connect to the Auth server
				console.log('Connecting to auth server.....');
				var authServerRequest = http.request(options, function(authServerResponse) {
	  				
	  				displayResponse(authServerResponse); 
	  				if(authServerResponse.statusCode == 200)
	  				{
	  					authServerResponse.on('data', function (chunk) {
							chunk = JSON.parse(chunk);
	   						if(chunk.statusCode == 0)
	   						{
	   							console.log('signout successful');
	   							// TODO Remove the session id from redis (Not tested yet)
	                            redisClient.del(feServerChunk.username, function(error, result) {
	                                if (error) console.log('Error: '+ error);
	                                else console.log('username:' + feServerChunk.username + ', signinToken: ' + result);
	                            });

	   							// TODO check to see if we can get it, (THIS IS SUPPOSED TO FAIL) will remove it later
	                            redisClient.get(feServerChunk.username, function(error, result) {
	                                if (error) console.log('Error: '+ error);
	                                else console.log('username:' + feServerChunk.username + ', signinToken: ' + result);
	                            });
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
				authServerRequest.write(postData);
				authServerRequest.end();
				
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


	});
    // Default case if everything goes well
 	//res.writeHead(200, {'Content-Type': 'text/plain'});
  	//res.end('In the end.... I am the Front End Server\n');
}).listen(servers.feServer.port, servers.feServer.host);
console.log('front end Server running at', servers.feServer.host + ':' + servers.feServer.port);

function errorMessage(message, statusCode, response)
{
	console.log(message);
	response.writeHead(statusCode, {'Content-Type': 'text/plain'});
	response.end(message + '\n');

}

function validateUsername(username, response)
{
	// Need regex to verify validity of username
	// TODO Regex doesn't work
    var regex = /^[a-z]*[a-z0-9_]*[a-z0-9]$/;
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

function checkSignInParams(body, response, JSONresponse)
{
	if(body.username)
	{
		console.log('Username: ' + body.username);
		validateUsername(body.username);
	}
	else
	{
		errorMessage('no username specified', 400, response);
	}
	
	if(body.password)
	{
		console.log('Password: ' + body.password);
	}
	else
	{
		errorMessage('no password specified', 400, response);
	}

	if(body.signinToken)
	{
		// Check if signinToken is 0, if so, this is user is signing in, so in this function, it must be zero
		if(body.signinToken == 0)
		{
			console.log('Since this is a signin session, we have correctly received a signinToken:', body.signinToken);
		}
		else
		{
			// Tell the user to fuck off
			JSONresponse.statusCode = -50; // Let's say -50 is for invalid token
			JSONresponse.message = "invalid signinToken";
			console.log(JSONresponse);
			writeResponse(response, 200, JSONresponse);
		}
	}
	else
	{
		errorMessage('no signinToken specified', 400, response);
	}

}
function checkSignOutParams(body, response, redisClient)
{
	if(body.username)
	{
		console.log('Username: ' + body.username);
	}
	else
	{
		errorMessage('no username specified', 400, response);
	}
	if(body.signinToken)
	{
		console.log('signinToken: ' + body.signinToken);
	}
	else
	{
		errorMessage('no signinToken specified', 400, response);
	}
}

function checkSignUpParams(body, response)
{
	if(body.username)
	{
		console.log('Username: ' + body.username);
		validateUsername(body.username);
	}
	else
	{
		errorMessage('no username specified', 400, response);
	}
	if(body.password)
	{
		// TODO Not sure if we are actually gonna enforce a password restriction?
		console.log('Password: ' + body.password);
	}
	else
	{
		errorMessage('no password specified', 400, response);
	}
	
	// Might wanna check validity of email? Or not....
	if(body.email)
	{
		console.log('Email: ' + body.email);
	}
	else
	{
		errorMessage('no email specified', 400, response);
	}

}

// Only call this this when it is NOT a sign in session, but one that is likely to sustain
function checkToken(body, response, redisClient, JSONresponse, callback)
{
	console.log('In checktoken, initial body signinToken is:', body.signinToken);
	console.log('Initial value of JSONresponse');
	console.log('-------------------');
	console.log(JSONresponse.statusCode); 
	console.log(JSONresponse.message);
	console.log('-------------------');
	if(body.signinToken == 0)
	{	
		console.log('Body signinToken is:', body.signinToken);
		JSONresponse.statusCode = -50;
		JSONresponse.message = "invalid signinToken: Cannot have signinToken 0 for this queryType";
		writeResponse(response, 200, JSONresponse);
	}
	else
	{
		// Look in redis to match with username
		redisClient.get(body.username, function(error, result) {
			if(error) 
			{
				// if it doesn't, ask auth server to look it up in MySQL
				console.log('Error: '+ error);
				console.log('Token not found in Redis, will look at authServer');				
				// TODO We might have to go check MySQL here instead of directly reporting error
				return getTokenFromAuth(body.username, body.signinToken, redisClient);
            }
            else 
            { 
           	  	console.log('username:' + body.username + ', signinToken: ' + result);
           	  	// It matches, maybe reset expiry time for redis token?
           	  	redisClient.expire(body.username, 900, function(error, didSetExpiry){
                	if(didSetExpiry)
                		console.log('Successfully set expiry time on redis for key ', body.username);
                	else if(!didSetExpiry)
                		console.log('Key', body.username, 'does not exist on redis server');
                	else if(error)
                		console.log('Error: ' + error);


                });
                // and allow to proceed
                console.log('Result is', result);
				console.log('-------------------');
				console.log(JSONresponse.statusCode); 
				console.log(JSONresponse.message);
				console.log('-------------------');
               	callback(null, result);
               	//return result;
            }
        });
	}
}

function getTokenFromAuth(username, signinToken, redisClient)
{
	var options = {
	    host: servers.authServer.host,
	    port: servers.authServer.port,
	    path: '?queryType=getToken',
	    method: 'POST'
	};
	var postData = JSON.stringify(username);
	// connect to the Auth server
	console.log('Connecting to auth server.....');
	console.log(path);
	var authServerRequest = http.request(options, function(authServerResponse) {
		// Print contents of the response received
		displayResponse(authServerResponse); 
		if(authServerResponse.statusCode == 200) 
		{
			authServerResponse.on('data', function (chunk) {
				chunk = JSON.parse(chunk);
				if(chunk.statusCode == 0) 
				{
			   		if(chunk.message) 
			   		{
			   			console.log('Successfully fetched token ', chunk.message, 'from authServer');
			   			// TODO cache it in redis
			   			redisClient.set(username, chunk.message, function(error, result) {
                            if (error) console.log('Error: ' + error);
                            else console.log('Successfully cached username and signinToken in redis');
                        });
			   			// TODO update expiration time on redis by 15 minutes
			   			redisClient.expire(username, 900, function(error, didSetExpiry){
		                	if(didSetExpiry)
		                		console.log('Successfully set expiry time on redis for key ', body.username);
		                	else if(!didSetExpiry)
		                		console.log('Key', body.username, 'does not exist on redis server');
		                	else if(error)
		                		console.log('Error: ' + error);
		                });
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
	authServerRequest.write(postData);
	authServerRequest.end();
}


			
				