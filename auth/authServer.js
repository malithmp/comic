var http = require('http');
var httprequester = require('request');
var sys = require("sys");  
var url = require("url");
var path = require("path");  
var util = require('util');
var redis = require('redis');
var redisclient = redis.createClient();

redisclient.select(2);
redisclient.on('error',function(err){
	console.log('Redis Error:'+err);
});

// Load configuration parameters
var conf = parseConfig();	

http.createServer(function (req, res) {
	var queryData = url.parse(req.url, true).query;
	console.log('Auth received a request: '+req.url);
	if(request.method=='POST'){
		var body='';
		request.on('data',function(data){
			body+=data;
			// prevent from attacks (by terminating long messages)
			if(body.length > 10000){// we will never use more than 10k letters
				request.connections.destroy();
			}
		});
		request.on('end',function(){
			//var postdata = JSON.parse(body);
			//console.log('body-->'+postdata[0]+":"+postdata[1]);
			directRequest(querydata.queryType,body,response);
			//console.log('parsed -->'+postdata.key);
		});
	}
	
}).listen(conf.auth_server_port,conf.auth_port_ip);
console.log('auth Server running at http://'+conf.auth_server_ip+":"+conf.auth_server_port);


function directRequest(command,rawdata,res){
        if(command == 'verify'){
        }
        else if(command == 'signin'){
                queryDBSignin("defaultuser","defaultpassword",res);
        }
        else if(command == 'signout'){
        }
        else if(command == 'signup'){
                console.log("signup function calling");
                queryDBSignup("unm1","eml1","pwd1","sec1","sec2","seca1","seca2",res);
        }
        else if(command == 'getToken'){
                queryDBgetToken("username",res);
        }
        else{
                //ignore
                sendResponse(res,"-99","Invalid Protocol request to auth");
        }
        //res.writeHead(200, {'Content-Type': 'text/plain'});
        //res.write('hashed:Sup bruh?\n');
        //res.end('K THX BYE\n');
}

function queryDBsignout(){
	// remove the token from the BE server if it exists.
	// Nothing much this is literally the easist part for the auth server
	httprequester.post('http://'+conf.db_server_ip+":"+conf.db_server_port+"/?queryType=getusertoken",{body:jsonstring},function(error,response,body){
		if(!error){
			var jsondata=JSON.parse(body);
			if(jsondata.status=="true"){
				sendresponse(res,"0","Done");
			}
			else{
				sendresponse(res,"-20","Something went wrong and I dont know what!");
			}
		}
		else{
			sendResponse(res,"-99","Server Internal Error: BE DB Did not respond. Could not get the token");
		}
	});
}

function queryDBgetToken(username,res){
	//relay the message to the database. auth server does nothing here
	httprequester.post('http://'+conf.db_server_ip+":"+conf.db_server_port+"/?queryType=getusertoken",{body:jsonstring},function(error,response,body){
		if(!error){
			var jsondata=JSON.parse(body);
			if(jsondata.status=="true"){
				var jsonstring=JSON.stringify({token:jsondata.token});
				sendresponse(res,"0","tokentoken");
			}
			if(jsondata.status == "false"){
				if(jsondata.message == "expired"){
					// token was expired in the DB. it is now deleted
					sendResponse(res,"-51","Token Expired. Login again");
				}
				else if(jsondata.message == "dne"){
					sendResponse(res,"-50","Token Not Found. Login again");
				}
				else{
					sendResponse(res,"-99","Server Internal Error. Internap protocol issue");
				}
			}
		}
		else{
			sendResponse(res,"-99","Server Internal Error: BE DB Did not respond. Could not get the token");
		}
	});
}

function queryDBSignup(username,email,password,secq1,secq2,seca1,seca2,res){
	// Ask DB server (actual one) to create the usename. If it fails, it means the usename is already taken. send error to user
	// else, compute the hash and salt and add this new tiplet to the auth esrver's use_hash_salt table
	var jsonstring=JSON.stringify({username:username});
	httprequester.post('http://'+conf.db_server_ip+":"+conf.db_server_port+"/?queryType=adduser",{body:jsonstring},function(error,response,body){
		// request to DB server asking it to reserve a username
		if(!error){
			var jsondata=JSON.parse(body);
			console.log("first requuest done");
			var jsonsdata=JSON.parse(body);
			if(jsondata.status == "false"){
				// Username already taken
				sendResponse(res,"-99","TODO. SOME ERROR");//TODO
			}
			else{
				console.log("qdbs1 DB worked");
				var crypto=require('crypto');
				var salt = crypto.randomBytes(32).toString('hex'); // 64 chars = 256 bits
				var hash=crypto.createHash('whirlpool').update(salt+password).digest('hex');
				// add user credentials to the user_hash_salt table
				// send this information to the DB
				JSON.stringify({username:username,hash:hash,salt:salt});
				httprequester.post(conf.backend_db+"/?queryType=adduserpass",{body:jsonstring},function(error,response,body){
					// send the BE DB login credentials (username, hash, salt)
					if(!error){
						// username, hash, salt is now in DB
						// add this information to the redis cache, Make it so that it expires in an hour TODO
						redisclient.set(username,JSON.stringify([hash,salt]),function(){
							redisclient.expire(username,3600,function(){
								sendResponse(res,"0","Done");
							});
						});
					}
					else{
						sendResponse(res,"-99","Could not insert computed Hash and Salt to Database");
					}		
				});
			}	
		}
		else{
			sendResponse(res,"-99","Server Internal Error: BE DB Did not respond");
		}
	});
}

function queryDBSignin(username,password,res){
	// check for hash/salt pair for given username in redis
	// if they DNE, then check Backend DB
	// TODO Inorder to support multiple devices per user we need to add separate token entries 
	var crypto = require('crypto');
	var jsonstring=JSON.stringify({username:username});
	redisclient.get(username,function(err,reply){
		// mock redis query step for hash/salt pair for username given
		if(reply!=null){
			// in redis. easy from herei
			console.log("redis reply:"+reply);
			var data = JSON.parse(reply);
			var generatedHash = crypto.createHash('whirlpool').update(data[1]+password).digest('hex');
			if(generatedHash==data[0]){
				// passwords match
				var buf = crypto.randomBytes(128);
				var token = buf.toString('hex');
				console.log('Aww Yiss: '+ token);
				sendResponse(res,"0","Login Success");
			}
			else{
				// passwords dont match
				sendResponse(res,"-30","Username Password Mismatch");
			}
		}
		else{
			// not in redis, check DB
			httprequester.post('http://'+conf.db_server_ip+":"+conf.db_server_port+"/?queryType=getuserinfo",{body:jsonstring},function(error,response,body){
				// mock http request to BE DB for hash,salt par for given username
				if(!error){
					// found info. compute hash/salt and compare
					var jsondata=JSON.parse(body);
					if(jsondata.status == "true"){
						salt = jsondata.salt;
						hash = jsondata.hash;
						console.log("h=>"+hash+"  s=>"+salt);
						// var listofhash=require('crypto').getHashes();
						var generatedHash = crypto.createHash('whirlpool').update(salt+password).digest('hex');
						if(hash==generatedHash){
							// successful login. generate token
							try{
								var buf = crypto.randomBytes(128);
								var token = buf.toString('hex');
								console.log('Aww Yiss: '+ token);
								//add the token to the redis databsae
								redisclient.set(username,JSON.stringify([hash,salt]),function(){
									// auth good. added to redis so future request will be accepted
									sendResponse(res,"0","Login Success");
									// now time to add it to the BE database and set the expiration times
									redisclient.expire(username,3600,function(){
										// set expiration time for that entry for 1 hour???? TODO
									});
									jsonstring=JSON.stringify({username:username,token:token});
									httprequester.post('http://'+conf.db_server_ip+":"+conf.db_server_port+"/?queryType=addusertoken",{body:jsonstring},function(error,response,body){
										// set expiration tim efor the toke (persistant version) for 24 hours?
									});
								});
							}
							catch (ex){
								// could not create salt.. maybe entropy sources drained. consider this as a sever internal isse. FE can lie to the user
								sendResponse(res,"-99","Could not generate random string for token");
							}
						}
						else{
							sendResponse(res,"-30","Username Password Mismatch");
						}
					}
					else{
						sendResponse(res,"-30","User not in database");
					}
				}
				else{
					// username not in DB, invalid user
					sendResponse(res,"-99","Internal Server Internal Error: BE DB Did not respond");
				}
			});
		}
	});
}


function sendResponse(res, responseCode, responseString){
	// end point of all requesti
	// create a JSON like string with the above info and send it to user
	res.writeHead(200, {'Content-Type': 'text/plain'});
	//res.write('hashed:Sup bruh?\n');
        res.end("{\"status\":\""+responseCode+"\",\"message\":\""+responseString+"\"}");	
}

function parseConfig(){
        var fs=require('fs');
        var rawdata = fs.readFileSync("../config.txt").toString();
        var conf = JSON.parse(rawdata);
        return conf;
}
