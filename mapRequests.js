/*
This file is used to keep code meant to be run at start (index.js) separated from http requests mapping for the app.
What will follow are a bunch of functions meant to be arguments for app.use,app.get,app.post and a function that will map all these functions
to the app passed as an argument, intended use is mapRequests(app).
*/

var express = require('express');//express library
var path = require('path');//for moving in folders
var bind = require('bind');//compiling tpl templates

var data = require('./dataManager.js');//Employee class and employees

//path to main page file
var filePath = __dirname+'/public/index.html';
//path to error file
var errorFilePath = __dirname+'/content/error.html';

/**
 * @brief Passing an express app to this function maps the function with various GET/POST
 requests. It's used to keep everything in place and clean.
 * @param in expressAppInstance app App to map with requests.
 */
function mapRequests(app)
{
	//to reset db
	app.use('/db',resetDb);
	
	//to retriveve all uni names
	app.use('/data/universities',retrieveUniNames);
	
	//to retriveve all uni names
	app.use('/data/faculties',retrieveFacultyNames);
	
	//to retrieve uni data
	app.use('/data',retrieveUniData);
	
	//allow access to public folder
	app.use(express.static(path.join(__dirname, 'public')));
	
	//no script page
	app.use("/noscript",noScript);
	
	//all requests different from above will be redirected to index 
	app.use('*', express.static(filePath)); 
}

 //Utility function to (re)generate db data. Just for developing purposes.
function resetDb(request,response)
{
	var headers = {};
	data.generate(function(res)
	   {
			if(res)
				response.sendFile(filePath);
			else
				response.sendFile(errorFilePath);
		});
}

 /*
 Given a uni query parameter retrieve data about that uni (its stats and its faculties stats) and send it in the response in JSON format. For more details about the nature of the object returned
 see getUniversityData descriptino in the dataManager.js module. If uni query parameter is missing 
 or its nonsense an empty object is returned.
 */
function retrieveUniData(request,response)
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
	if(typeof request.query.uni != 'undefined')
	{
		data.getUni(request.query.uni, function(data)
				{
					if(data.error === 'error')
						response.writeHead(500, headers);
					else
						response.writeHead(200, headers);
					response.end(JSON.stringify(data));
				});
	}
	else
	{
		response.writeHead(406, headers);
		response.end(JSON.stringify({}));
	}
}

 /*
 Retrieves all univesities names, and returns them in a json format as an object in the form of:
 {names:String[]}, or {error:'error'} if there has been an error.
 */
function retrieveUniNames(request,response)
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
	data.getUniNames(function(data)
				{
					if(data.error === 'error')
						response.writeHead(500, headers);
					else
						response.writeHead(200, headers);
					response.end(JSON.stringify(data));
				});
}


/*
 Retrieves all faculties names, and returns them in a json format as an object in the form of:
 {names:String[]}, or {error:'error'} if there has been an error.
 */
function retrieveFacultyNames(request,response)
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
	data.getFacNames(function(data)
				{
					if(data.error === 'error')
						response.writeHead(500, headers);
					else
						response.writeHead(200, headers);
					response.end(JSON.stringify(data));
				});
}

 /*
 Functionality for users without javascript, compiles a tpl that either has a list of links (one for each university) or informations about a single university; if no uni parameter in the query is specified the list of links is provided, otherwise university information is displayed.
 */
function noScript(request,response)
{
	//set response header
    var headers = {};
    headers["Access-Control-Allow-Origin"] = "*"; //for cross enviroment request
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";//methods allowed to responce
    headers["Access-Control-Allow-Credentials"] = false;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"; //type of headers
    //answer
    headers["Content-Type"] = "text/html";//format response
	
	//if no uni is specified show all the universities link
	if(typeof request.query.uni === 'undefined')
	{
		data.getUniNames(function(data)
		{
			if(data.error === 'error')
				response.writeHead(500, headers);
			else
				response.writeHead(200, headers);
			var uniNames = [];
			for( var i = 0; i < data.names.length; i++)
				uniNames.push({name:data.names[i]});
			bind.toFile("tpl/home.tpl",
						{
							names:uniNames,
							showNames: "block"
						}, function callback(data) 
						{ 
							response.end(data);
						});
		});
	}
	else//if a uni is specified display infos about a university
	{
		data.getUni(request.query.uni, function(data)
		{
			if(data.error === 'error')
				response.writeHead(500, headers);
			else
				response.writeHead(200, headers);
			//bind library seems unable to deal with true/false, remapping one field to a string
			data.languages_classes = ((data.languages_classes)? "Yes":"No");
			bind.toFile("tpl/home.tpl",
						{
							uni:data,
							showUni: "block"
						}, function callback(data) 
						{ 
							response.end(data);
						});
		});
	}
}
		
		
		
	
	

exports.map = mapRequests;