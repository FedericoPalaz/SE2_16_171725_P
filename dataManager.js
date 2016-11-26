//file for managing connection to db and return data as objects
var pg = require('pg');//postgre database

//list of italian universities
uni_list = ["bolzano","trento","udine","trieste","venezia","padova","verona","brescia","bergamo","varese","milano","pavia","castellanza","aosta","torino","vercelli","genova","parma","modena","ferrara","bologna","padova","venezia","udine","trieste","pisa","firenze","siena","s.marino","urbino","ancona","perugia","macerata","camerino","viterbo","l aquila","teramo","chieti","roma","cassino","campobasso","foggia","benevento","napoli","sassari","benevento","foggia","salerno","potenza","bari","lecce","rende","catanzaro","reggio calabria","messina","palermo","catania","cagliari"];

//list of faculties
faculties = ["science","engineering","medicina","giurisprudenza","economia","sociologia","lettere"];

/**
 * @brief Randomly generates a tuple of data for a university or a faculty (without the key).
 * @return an array of data representing a university or faculty in the following way:
 [#professors/#students float,job after degree in 3 months float, classes in english boolean, average professor age integer,
 average citations per prof integer, total citations integer, annual funding integer, number of laboratories integer,
 avg income of city integer, avg internet speeed of city float, population density of city integer, % of people knowing english in city float]
 */
function generateTuple()
{
	return
	[Math.random()*100,Math.random()*100,Math.random()>=0.5,Math.round(Math.random()*40),
	 Math.round(Math.random()*500),Math.round(Math.random()*50000),Math.round(Math.random()*50000000),Math.round(Math.random()*50),
	 Math.round(Math.random()*50000),Math.random()*200,Math.round(Math.random()*800),Math.random()];
}

/**
 * @brief Given a university name and a list of faculties generate a string to insert them into the db, numerical values are 
 randomly generated.
 * @param in String name Name of the university to insert.
 * @param in String[] faculties Faculties of the university.
 * @return A string representing the queries needed to insert a university and its faculties.
 */
function generateUniversity(name,faculties)
{
	//query to insert a unit
	var uniQuery = "INSERT INTO uni VALUES ('" + name + "'," +generateTuple().toString()+");";
	//query to bulk insert all faculties of a uni
	var facQuery = "INSERT INTO faculties VALUES ";
	for(var i=0;i<faculties.length;i++)
		facQuery += "('" +name+ "','" + faculties[i] + "'," + generateTuple().toString() + "),";
<<<<<<< HEAD
=======
	facQuery = facQuery.replace(/.$/,";");
	//append facQuery to uniQuery and return
	return uniQuery.concat(facQuery);
>>>>>>> ac63e76... setting up heroku db
}

/**
 * @brief Randomly generates universities and faculties data starting from their names and insert it into the app db.
 * @param in String[] unis Universities to insert.
 * @param in String[] faculties List of faculties for each uni.
 * @return Description of returned value.
 */
function generateDbData(unis,faculties)
{
	//generate the query to insert the data
	var query ="";
	for(var i=0;i<unis.length;i++)
		query = query.concat(generateUniversity(unis[i],faculties));
	//connect to db and bulk insert data
	console.log(query);
<<<<<<< HEAD
	/*
=======
>>>>>>> ac63e76... setting up heroku db
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(query, function(err, result) 
	{
      done();
      if (err)
      	console.error(err);res=false;
    })});
	*/
}

exports.generate = function(){generateDbData(uni_list,faculties)};