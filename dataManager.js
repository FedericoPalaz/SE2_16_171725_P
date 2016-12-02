//file for managing connection to db and return data as objects
var pg = require('pg');//postgre database

//list of italian universities
var uni_list = ["bolzano","trento","trieste","venezia","verona","brescia","bergamo","varese","milano","pavia","castellanza","aosta","torino","vercelli","genova","parma","modena","ferrara","bologna","padova","udine","pisa","firenze","siena","urbino","ancona","perugia","macerata","camerino","viterbo","l aquila","teramo","chieti","roma","cassino","campobasso","foggia","napoli","sassari","benevento","salerno","potenza","bari","lecce","rende","catanzaro","reggio calabria","messina","palermo","catania","cagliari"];

//list of faculties
var faculties = ["science","engineering","medicina","giurisprudenza","economia","sociologia","lettere"];

/*
if app is run locally you need to have a .env file with a postgres url, like
DATABASE_URL=postgres://postgres:password@localhost:5432/todo
*/
var databaseURL = process.env.DATABASE_URL;

/**
 * @brief Randomly generates a tuple of data for a university or a faculty (without the key).
 For each column data is generated around an average with common sense, those magic numbers can be changed without
 any problem.
 * @return an array of data representing a university or faculty in the following way:
 [#professors/#students float,job after degree in 3 months float, classes in english boolean, average professor age integer,
 average citations per prof integer, total citations integer, annual funding integer, number of laboratories integer,
 avg income of city integer, avg internet speeed of city float, population density of city integer, % of people knowing english in city float]
 */
function generateTuple()
{
	var tuple = [Math.random()*100,Math.random()*100,Math.random()>=0.5,Math.round(Math.random()*40), Math.round(Math.random()*500),Math.round(Math.random()*50000),Math.round(Math.random()*50000000),Math.round(Math.random()*50), Math.round(Math.random()*50000),Math.random()*200,Math.round(Math.random()*800),Math.random()];
	for(var i=0; i < tuple.length;i++)
		if(typeof tuple[i] == 'number')
			tuple[i] = tuple[i].toFixed(2);
	return tuple;
}

/**
 * @brief Given a university name and a list of faculties generate a string to insert them into the db, numerical values are 
 randomly generated. The string is not parametrized since there is no input frome external sources.
 * @param in String name Name of the university to insert.
 * @param in String[] faculties Faculties of the university.
 * @return A string representing the queries needed to insert a university and its
 faculties.
 */
function generateUniversity(name,faculties)
{
	//query to insert a unit
	var uniQuery = "INSERT INTO uni VALUES ('" + name + "'," +generateTuple().toString()+");";
	//query to bulk insert all faculties of a uni
	var facQuery = "INSERT INTO faculties VALUES ";
	for(var i=0;i<faculties.length;i++)
		facQuery += "('" +name+ "','" + faculties[i] + "'," + generateTuple().toString() + "),";
	facQuery = facQuery.replace(/.$/,";");
	//append facQuery to uniQuery and return
	return uniQuery.concat(facQuery);
}

/**
 * @brief Clears the tables and randomly generates universities and faculties data starting from their names and insert it into the app db.
 * @param in String[] unis Universities to insert.
 * @param in String[] faculties List of faculties for each uni.
 * @param in function(object) Callback function that accepts a boolean argument.
 * @return True if data insertion went well, false otherwise.
 */
function generateDbData(unis,faculties,callback)
{
	//generate the query to insert the data
	var query ="";
	for(var i=0;i<unis.length;i++)
		query = query.concat(generateUniversity(unis[i],faculties));
	//connect to db
	pg.connect(databaseURL, function(err, client, done)
	{
		// handle connection errors
		if(err) 
		{
			done();
			console.log(err);
			callback(false);
		}
		else
		{

			//delete previous data from db
			client.query("delete from faculties;delete from uni;", function(err, result) 
			{
				done();
				if (err)
				{
					done();
					console.log(err);
					callback(false);
				}
				else
				{
					//generate the query to insert the data
					var query ="";
					for(var i=0;i<unis.length;i++)
						query = query.concat(generateUniversity(unis[i],faculties));
					//connect to db and bulk insert data
					client.query(query, function(err, result) 
					{
						done();
						if (err)
						{
							done();
							console.log(err);
							callback(false);
						}
						else
						{
							done();
							callback(true);
						}
					});
				}
			});
		}
	});
}
			  

/**
 * @brief Given a university name query the db to get data for it and pass the object to a callback function.
 The object passed to the callback has fields named after the db uni table fields and an extra field called "faculties", this field maps to an array of objects, where each object represent a faculty of the university, with fields named after the db faculties table. {uniFields : data, faculties : arrayOfFaculties}.
 In case of error an object {'error':'error'} gets passed to the callback function.
 * @param in String uni Name of the university to retrieve data about.
 * @param in function(object) Callback function that accepts an object argument.
 */
function getUniversityData(uni,callback)
{
	var uniRes = [];
	var facResults = [];
	//connect to db
	pg.connect(databaseURL, function(err, client, done)
	{
		//check for errors on connection
		if(err) 
		{
			done();
			console.log(err);
		}
		else
		{
				//get single uni data
			    uniQuery = client.query("SELECT * FROM uni WHERE NAME = $1;",[uni],
									   function(error)
										{
											if(error)
											{
												console.log(err);
												callback({'error':'error'});
											}
										});
											
				uniQuery.on("row", function(row)
				{
					uniRes.push(row);
				});
			
				//get data about faculties of the university
				facQuery = client.query("SELECT * FROM faculties f WHERE f.uni_name = $1",[uni], 			function(error)
										{
											if(error)
											{
												console.log(err);
												callback({'error':'error'});
											}
										});
				//get results 1 row at a time and push it to facResults
				facQuery.on("row", function(row)  
				{
					facResults.push(row);
				});
			
			    //close connection after getting data and pass object to callback
				facQuery.on('end', function() 
				{
					done();
					//if data has been found assemble the object
					if(uniRes.length > 0)
					{
						uniRes = uniRes[0];//because uniRes it's an array, but it will always have a single item
						uniRes.faculties = facResults;//assign the array of faculties as a property to uniRes
					}
					else
						callback({});//pass to callback
				});
		}
	});
}
	

/**
 * @brief Finds all university names and returns them in an object in the form {names:String[]}, ordered lexically.
 In case of error an object {'error':'error'} gets passed to the callback function.
 * @param in function(object) Callback function that accepts an object argument.
 */
function getUniversityNames(callback)
{
	//connect to db
	pg.connect(databaseURL, function(err, client, done)
	{
		//check for errors on connection
		if(err) 
		{
			done();
			console.log(err);
			callback({'error':'error'});
		}
		else
		{
				var results = [];
				//get data about faculties of the university
				var query = client.query("SELECT DISTINCT(name) FROM uni ORDER BY NAME", function(error)
				{
					if(error)
					{
						done();
						callback({'error':'error'});
					}
				});
				//get results 1 row at a time and push it to results
				query.on("row", function(row)  
				{
					results.push(row);
				});
			
			    //close connection after getting data and pass object to callback
				query.on('end', function() 
				{
					//doing {names:results} would result in names being an array of objects {name:<uniName>}, trasforming it in an array of names
					var res = []
					for(var i = 0;i < results.length; i++)
						res.push(results[i].name);
					done();
					callback({names:res});//pass to callback
				});
		}
	});
}

/**
 * @brief Finds all faculty names and returns them in an object in the form {names:String[]}, ordered lexically.
 In case of error an object {'error':'error'} gets passed to the callback function.
 * @param in function(object) Callback function that accepts an object argument.
 */
function getFacultyNames(callback)
{
	//connect to db
	pg.connect(databaseURL, function(err, client, done)
	{
		//check for errors on connection
		if(err) 
		{
			done();
			console.log(err);
		}
		else
		{
				var results = [];
				//get data about faculties of the university
				var query = client.query("SELECT DISTINCT(name) FROM faculties ORDER BY NAME", function(error)
				{
					if(error)
					{
						done();
						callback({'error':'error'});
					}
				});
				//get results 1 row at a time and push it to results
				query.on("row", function(row)  
				{
					results.push(row);
				});
			
			    //close connection after getting data and pass object to callback
				query.on('end', function() 
				{
					//doing {names:results} would result in names being an array of objects {name:<facultyName>}, trasforming it in an array of names
					var res = []
					for(var i = 0;i < results.length; i++)
						res.push(results[i].name);
					done();
					callback({names:res});//pass to callback
				});
		}
	});
}

exports.generate = function(callback){generateDbData(uni_list,faculties,callback);};
exports.getUni = getUniversityData;
exports.getUniNames = getUniversityNames;
exports.getFacNames = getFacultyNames;
