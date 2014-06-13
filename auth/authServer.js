var http = require('http');
var sys = require("sys");  
var url = require("url");
var path = require("path");  
var util = require('util');
var querystring = require('querystring');
<<<<<<< HEAD
var crypto = require('crypto');
var generate_key = function() {
		    var sha = crypto.createHash('sha256');
		    sha.update(Math.random().toString());
		    return sha.digest('hex');
		};
		
=======
var mysql = require('mysql');
>>>>>>> 899350a5d335c6e751b6bd0283f46f65f86ced12

// Load configuration parameters
var conf = parseConfigFile('config.txt');	
//for (var k in conf){
//	if(conf.hasOwnProperty(k)){
//		console.log("key is: "+k+" Value is: "+conf[k]);
//	}
//}
var mysqlconnection = mysql.createConnection({host:conf.host,user:conf.username,password:conf.password,database:conf.database});
mysqlconnection.connect();

//TODO mysqlconnection.escape to protect from sqlinjection
// http://www.thegeekstuff.com/2014/01/mysql-nodejs-intro/

http.createServer(function (req, res) {
	var queryData = url.parse(req.url, true).query;
	console.log('Auth received a request: '+req.url);
	if(queryData.querytype == 'verify'){
	}
	else if(queryData.querytype == 'signin'){
		queryDBSignin("defaultuser","defaultpassword",res);
	}
	else if(queryData.querytype == 'signout'){
        }
        else if(queryData.querytype == 'signup'){
        }
	else{
		//ignore
	}
	//res.writeHead(200, {'Content-Type': 'text/plain'});
	//res.write('hashed:Sup bruh?\n');
	//res.end('K THX BYE\n');
	
}).listen(1337, '127.0.0.1');
//listen(1337,'192.168.0.150');
//listen(1337, '127.0.0.1');
console.log('auth Server running at http://127.0.0.1:1337/');

<<<<<<< HEAD
	if(queryData.queryType == "signup")
	{
		console.log('This is a signup session');
		console.log('Username: ' + queryData.username);
		console.log('Password: ' + queryData.password);
		console.log('Email: ' + queryData.email);

		///*
		// RESPONSE: success/fail  and message (int Error Code)
=======
function queryBDSignup(username,email,password,secq1,secq2,seca1,seca2,res){
	// Ask DB server (actual one) to create the usename. If it fails, it means the usename is already taken. send ero to user
	// else, compute the hash and salt and add this new tiplet to the auth esrver's use_hash_salt table
	
	//TODO mock DB call: this should be a http request to the Backend Database
	setTimeout(funtion(){
		//mock http reuqest
		var status=tue; // lets assume the username was accepted
		if(status==true){
			var crypto=require('crypto');
			var salt = crypto.randomBytes(32).toString('hex'); // 64 chars = 256 bits
			var hash=crypto.createHash('whirlpool').update(salt+password).digest('hex');
			// add user credentials to the user_hash_salt table
			queryString="insert into user_hash_salt values(null,\""+username+"\",\""+hash+"\",\""+salt+"\");";
			mysqlconnection.query(queryString,function(err,rows){
				if(){
				}
			}
		}
		else{
			sendResponse(res,"-10","Username already taken");
		}
	},300);
}
>>>>>>> 899350a5d335c6e751b6bd0283f46f65f86ced12

function queryDBSignin(username,password,res){
	// get hash, salt combination for username provided
	// if username does not exist return failure, else success`
	var queryString = "select id,hash,salt from user_hash_salt where id=1;";
	var crypto = require('crypto');	
	mysqlconnection.query(queryString,function(err,rows){
		if(err){
			console.log("sql error!");
		}else{
			console.log(rows);
			if(rows.length==1){
				// We have a valid entry
				// TODO Inorder to support multiple devices per user we need to add separate token entries to user_tokens table.  
				// now hash the user's given password with the salt from db and compare against the hash in the db
				// var listofhash=require('crypto').getHashes();
				var generatedhash = crypto.createHash('whirlpool').update(rows[0].salt+password).digest('hex');
				// TODO We should use a secure-random generator to generate a random token
				// For now we will use the one provided by crypto assuming it IS secure (im not really sure)
				if(generatedhash==rows[0].hash){
					// signin succeeded. send token
					try {
						var buf = crypto.randomBytes(128);
						var token = buf.toString('hex');
						//console.log('Aww Yiss: '+ token);
						// add the token to user_tokens table. drop if one exist currently (TODO not the case for multiple devices)
						// for that case, we only update that token. for that we need more information suck as device mac address
						queryString = "insert into user_tokens(userid,token)  values("+rows[0].id+",\""+token+"\") on duplicate key update token=values(token);";
						console.log(queryString);
						mysqlconnection.query(queryString,function(err,rows){
							// Ok. new old token replaced by the new one
							console.log("done adding token to user_tokens");
							sendResponse(res,"30",token);
						});
					} catch (ex) {
						console.log(ex);
						// TODO: could not acquire a token. lie to user?
						// most likely, entropy sources are drained
						sendResponse(res,"-32","Server Internal Error: Entrophy sources depleted!");
					}
				}else{
					//signin failed. Incorrect password 
					console.log("Incorrect password");
					sendResponse(res,"-30","Check username and password");
				}
			}else{
				console.log("User not in database");
				sendResponse(res,"-30","Check username and password!");
			}
		}
	});
}

<<<<<<< HEAD
		// if fail (probably username taken), then add the following
		JSONresponse.statusCode = -10;
		JSONresponse.message = "username taken";
		
		// Insert checks for 404 NOT FOUND errors if you think they may occur
		// In the end return JSON string as response
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write(JSON.stringify(JSONresponse));
		res.end();
		//*/
	}
	
	if(queryData.queryType == "signout")
	{
		console.log('This is a signout session');
		console.log('Username: ' + queryData.username);
		///*
		// if signout fail
		JSONresponse.statusCode = -40;
		JSONresponse.message = "signout fail";
		// Insert checks for 404 NOT FOUND errors if you think they may occur
		// In the end return JSON string as response
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write(JSON.stringify(JSONresponse));
		res.end();
		//*/
	}

	if(queryData.queryType == "signin")
	{
		console.log('This is a signin session');
		console.log('Password: ' + queryData.password);
		
		///*
		
		// if fail
		//JSONresponse.statusCode = -30;
		//JSONresponse.message = "signin fail";
		JSONresponse.message = generate_key(); 
		// Insert checks for 404 NOT FOUND errors if you think they may occur
		// In the end return JSON string as response
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write(JSON.stringify(JSONresponse));
		res.end();
		//*/
	}

	if(queryData.queryType == "verification")
	{
		console.log('This is a verification session');
		console.log('Secret Key: ' + queryData.secretkey);
		///*
		// if username doesn't exist
		//JSONresponse.statusCode = -40;
		//JSONresponse.message = "username doesn't exist";
		
		// if username/password mismatch
		JSONresponse.statusCode = -41;
		JSONresponse.message = "username password mismatch";
		// Insert checks for 404 NOT FOUND errors if you think they may occur
		// In the end return JSON string as response
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write(JSON.stringify(JSONresponse));
		res.end();
		//*/
=======

function sendResponse(res, responseCode, responseString){
	// end point of all requesti
	// create a JSON like string with the above info and send it to user
	res.writeHead(200, {'Content-Type': 'text/plain'});
	//res.write('hashed:Sup bruh?\n');
        res.end("{\"status\":\""+responseCode+"\",\"message\":"+responseString+"\"}");	
}

function parseConfigFile(filename){
	// since config file readinf is in the initialization procedure, we do it synchronously
	// synchronous and asynchronous fileIO : http://stackoverflow.com/questions/6831918/node-js-read-a-text-file-into-an-array-each-line-an-item-in-the-array
	var fs = require('fs');
	var conf = new Array();
	var array = fs.readFileSync(filename).toString().split('\n');
	for(i in array){
		//console.log(array[i]);
		var kv = array[i].split('=');
		conf[kv[0]]=kv[1];
>>>>>>> 899350a5d335c6e751b6bd0283f46f65f86ced12
	}
	return conf;
}

