//index.js, stuff to do on server start

//dependencies

var express = require('express');//express library
var path = require('path');//for pathing stuff
var util = require('util');//to inspect stuff
var url = require('url');//parse url
var bodyParser = require('body-parser');//to parse stuff

var data = require("./dataManager.js");
var app = express();

app.all("/db",function(request,response)
{	
	data.generate();
	response.end("k");
});

app.all("/data",function(request,response)
{	
	//set response header
    var headers = {};
    headers["Access-Control-Allow-Origin"] = "*"; //for cross enviroment request
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";//methods allowed to responce
    headers["Access-Control-Allow-Credentials"] = false;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"; //type of headers
    //answer
    headers["Content-Type"] = "application/JSON";//format response
    response.writeHead(200, headers);
	data.getUni(request.query.uni, (data) => 
				{
					response.end(JSON.stringify(data));
				});
});


//setting port
app.set('port', (process.env.PORT || 1337));

//setting parsers for urls and json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//starting to listen on port
app.listen(app.get('port'), function() {
  console.log('app is up on port', app.get('port'));
});



