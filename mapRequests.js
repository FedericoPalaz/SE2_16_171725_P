/*
This file is used to keep code meant to be run at start (index.js) separated from http requests mapping for the app.
What will follow are a bunch of functions meant to be arguments for app.use,app.get,app.post and a function that will map all these functions
to the app passed as an argument, intended use is mapRequests(app).
*/

var express = require('express');//express library
var path = require('path');//for moving in folders
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
	//to retrieve uni data
	app.use('/data',retrieveUniData);
	
	//allow access to public folder
	app.use(express.static(path.join(__dirname, 'public')));
	
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
	data.getUni(request.query.uni, function(data)
				{
					if(data.error === 'error')
						response.writeHead(500, headers);
					else
						response.writeHead(200, headers);
					response.end(JSON.stringify(data));
				});
}
	
	

exports.map = mapRequests;