
var fs = require('fs');
var requester = require('request');
var feTestsFile = "./feTests.json";
 // This is the url that will be sent to feServer
var url = {};
 // This is the POST data in HTTP body that will be sent to feServer
var body = {};
// This array will load all the JSON test cases
var testArray = [];

//var JSONbuffer 
var feTests = {};
feTests["tests"] = JSON.parse(fs.readFileSync(feTestsFile, 'utf8'));
var signUpTests = feTests.tests.signUp;

//console.log(signUpTests);

/*
for(var i in feTests)
{
	body = JSON.stringify(testArray[i]);

	requester.post(
	        'http://localhost:1337/?queryType=signin',
	        {body:body}, 
	        function(err, res, body){
	                if(!err){
	                        console.log(body);
	                }else{
	                        console.log('Error:', err);
	                        console.log('Response:', res);
	                        console.log('Body:', body);
	                }
	        }
	);

}
*/
//////////////////////////////////////


/*
"username":"sampritr"
"signinToken":"0"
"email":"srshirsho@gmail.com"
"password":"hagu2014"
*/
/*
requester.post(
        'http://localhost:1337/?queryType=signup',
        {body:JSON.stringify({
			"username":"sampritr",
			"email":"srshirsho@gmail.com",
			"password":"hagu2014"
			})	
    	}, 
        function(err, res, body){
                if(!err){
                        console.log(body);
                }else{
                        console.log('Error:', err);
                        console.log('Response:', res);
                        console.log('Body:', body);
                }
        }
);

requester.post(
        'http://localhost:1337/?queryType=signin',
        {body:JSON.stringify({
			"username":"sampritr",
			"signinToken":"0",
			"password":"hagu2014"
			})	
    	}, 
        function(err, res, body){
                if(!err){
                        console.log(body);
                }else{
                        console.log('Error:', err);
                        console.log('Response:', res);
                        console.log('Body:', body);
                }
        }
);
*/

requester.post(
        'http://localhost:1337/?queryType=signout',
        {body:JSON.stringify({
			"username":"sampritr",
			"signinToken":
            "1dafb415a9778840ee06a9b5b1847be8cff6dcfeeb6f914e1b21cd781e184a2d"
			})	
    	}, 
        function(err, res, body){
                if(!err){
                        console.log(body);
                }else{
                        console.log('Error:', err);
                        console.log('Response:', res);
                        console.log('Body:', body);
                }
        }
);
