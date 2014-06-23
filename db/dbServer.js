var http = require('http');
var qs = require('querystring');
var url = require('url');
var mysql = require('mysql');
var date=new Date();



var conf=parseConfig();
var mysqlconnection = mysql.createConnection({host:conf.mysql_host,user:conf.mysql_username,password:conf.mysql_password,database:conf.mysql_database});
mysqlconnection.connect();

var server = http.createServer(function (request, response) {
	var querydata = url.parse(request.url, true).query;
	console.log("quertType:"+querydata.queryType);

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
}).listen(conf.db_server_port,conf.db_server_ip);

// Put a friendly message on the terminal
console.log("Server running at http://"+conf.db_server_ip+":"+conf.db_server_port);


function directRequest(command, rawdata,res){
	console.log("rawdata:"+rawdata);
	var data = JSON.parse(rawdata);
	if(command == "adduser"){
		console.log("TODO, stub add user function invoked");
		adduser(data.username,res);
	}
	else if(command == "adduserpass"){
		console.log("TODO, stub add userpass function invoked");
                adduserpass(data.username,data.hash,data.salt,res);
	}
	else if(command == "adduserinfo"){
		console.log("");
	}
	else if(command == "addusertoken"){
		console.log("TODO, stub add usertoken function invoked");
		addusertoken(data.username,data.token,res);
        }
	else if(command == "getusertoken"){
		// we need to check if the token is not expired, if not extend expiration time
                console.log("TODO, stub getusertoken function invoked");
                getusertoken(data.username, res);
        }
	else if(command == "getuserinfo"){
                console.log("TODO, stub add getuserinfo function invoked");
                getuserinfo(data.username, res);
        }
	else{
		sendResponse(res,{"status":"false","message":"Invalid Command"});
	}
}

function getuserinfo(username,res){
        console.log("got:"+username);
        // mock add user to the database and send the ok resposen send pre defined response of hash or salt
        // TODO actual implementatuib
	// retutn salt: defaultsalt
	// and hash for defaultsalt+defaultpassword ==> defaultsaltdefaultpassword
        var responseSet={"status":"true","hash":"42f4ec866fc13f66e67e1ee01798a287c49680e24ebf81662d48559ae6fd9fbbfe2ce45f0f001f41fad2c7d5ca4082cc78543d7cf2da25403d35aba9971312e0","salt":"defaultsalt"};
        sendResponse(res,responseSet);
}


function addusertoken(username, token, res){
        console.log("got:"+username+" and "+token);
        // mock add user to the database and send the ok resposen
        // TODO actual implementation
	// Add the token and the expiration time to the db
	var querystring = "";
        var responseSet={"status":"true","userid":"9001"};
        sendResponse(res,responseSet);
}

function getusertoken(username,res){
	// we need to check if the token is not expired, if not extend expiration time
	// if it is, return false to the user. delete the entry from the DB
	var responseSet={"status":"true","token":"TOKEN"};
	var queryString = "select username,token,expiry from user_tokens where username=\""+username+"\";";
	console.log(queryString);
	mysqlconnection.query(queryString,function(err,rows){
		if(err){
			responseSet={"status":"false","message":"SQLERR"};
			sendResponse(res,responseSet);
			console.log("sql error!"+err);
		}else{
			console.log(rows);
			if(rows.length==1){
				var time = (date.getTime()/1000).toFixed();	// POSIX time in seconds (unix epoch time in seconds)
				// check if expired
			 	console.log(time +" vs "+rows[0].expiry);			
				if(time<rows[0].expiry){
					// token is not expired yet, we will return it and then update the new time
					console.log(time);
					time= parseInt(time)+parseInt(conf.db_server_token_expiry);
					console.log(time);
					// send the user the reponse, adnt hen ipdate the time
					responseSet={"status":"true","token":rows[0].token};
					sendResponse(res,responseSet);
					queryString = "update user_tokens set expiry="+time+" where username=\""+username+"\";";
					mysqlconnection.query(queryString,function(err,rows){});
				}else{
					console.log("expired");
					// remove the entry from the db
					responseSet={"status":"false","code":-51,"message":"Token expired"};
                                        sendResponse(res,responseSet);
					queryString = "delete from user_tokens where username=\""+username+"\";";
					mysqlconnection.query(queryString,function(err,rows){});
				}	
			}
			else{
				// can NOT have more than 1 entry for a user.. This would be a huge issue
				responseSet={"status":"false","message":"DB server sent more than 1 result"};
				sendResponse(res,responseSet);
			}
		}

	});
}

function adduser(username,res){
	var queryString = "insert into user_hash_salt(username,hash,salt) values(\""+username+"\",\"temp\",\"temp\");";
	console.log(queryString);
        mysqlconnection.query(queryString,function(err,rows){
		if(err){
			responseSet={"status":"false","message":"Duplicate entry"};
                        sendResponse(res,responseSet);
                        console.log("sql error!"+err);
		}
		else{
			responseSet={"status":"true","message":"Username Reserved"};
                        sendResponse(res,responseSet);
		}
	});
}

function adduserpass(username, hash, salt ,res){
	// It is required that a username has been reserved prior to calling this function. If the username does not exis, we let the user knw
	console.log("got:"+username+" and "+hash+" and "+salt);
	var responseSet={"status":"true","token":"TOKEN"};
        var queryString = "update user_hash_salt set hash=\""+hash+"\", salt=\""+salt+"\" where username=\""+username+"\";";
	mysqlconnection.query(queryString,function(err,rows){
                if(err){
                        responseSet={"status":"false","message":"Unknown error"};
                        sendResponse(res,responseSet);
                        console.log("sql error!"+err);
                }
                else{
			console.log(rows);
			if(rows.affectedRows==1){
                        	responseSet={"status":"true","message":"Credentials updated"};
                        	sendResponse(res,responseSet);
			}
			else{
				responseSet={"status":"false","message":"Critical error. Sqp updated hash,slat for 2 rows!! This should never happen"};
                                sendResponse(res,responseSet);
			}
                }
        });
}

function sendResponse(res, responseSet){
	console.log("sending response");
        // end point of all requesti
	// create a json string from the response key value pairs
	var jsonstring = JSON.stringify(responseSet);
	res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(jsonstring);
	console.log("response sent"+jsonstring);
}

function parseConfig(){
	var fs=require('fs');
	var rawdata = fs.readFileSync("../config.txt").toString();
	var conf = JSON.parse(rawdata);
	return conf;
}
