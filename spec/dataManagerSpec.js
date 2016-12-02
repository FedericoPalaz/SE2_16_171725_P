/*
data manager module tests
To run these tests you need to have a local postgres database and specify its url:
*/
var url = "postgres://postgres:password@localhost:5432/todo";

/*
Functions used to  generate the database content aren't tested because they aren't part of the application.
*/

var rewire = require("rewire");
var pg = require('pg');//postgre database

var data = rewire("../dataManager.js");

data.__set__("databaseURL",url);


describe("Testing for getUniversityNames(callback) function: ", function()
{
	var get = data.__get__("getUniversityNames");
	
	it("1 existence", function()
	{
		expect(get).toBeDefined();
	});
	
	it("2 returns an object", function(done)
	{
		get(function(data)
		{
			done();
			expect(data).toBeDefined;
			expect(data).not.toBe(null);
			expect(typeof data).toEqual("object");
		});
	});
	
	it("3 object has a name field", function(done)
	{
		get(function(data)
		{
			done();
			expect(data.names).toBeDefined;
			expect(data.names).not.toBe(null);
		});
	});
	
	it("4 object has a names field wich is an array", function(done)
	{
		get(function(data)
		{
			done();
			expect(typeof data.names).toEqual(typeof []);
			
		});
	});
});

describe("Testing for getFacultyNames(callback) function: ", function()
{
	var get = data.__get__("getFacultyNames");
	
	it("1 existence", function()
	{
		expect(get).toBeDefined();
	});
	
	it("2 returns an object", function(done)
	{
		get(function(data)
		{
			done();
			expect(data).toBeDefined;
			expect(data).not.toBe(null);
			expect(typeof data).toEqual("object");
		});
	});
	
	it("3 object has a names field", function(done)
	{
		get(function(data)
		{
			done();
			expect(data.names).toBeDefined;
			expect(data.names).not.toBe(null);
		});
	});
	
	it("4 object has a name field wich is an array", function(done)
	{
		get(function(data)
		{
			done();
			expect(typeof data.names).toEqual(typeof []);
		});
	});
});

describe("Testing for getUniversityData(uni,callback) function: ", function()
{
	var get = data.__get__("getUniversityData");
	
	it("1 existence", function()
	{
		expect(get).toBeDefined();
		
	});
	
	it("2 returns an object", function(done)
	{
		get("anything",function(data)
		{
			done();
			expect(data).toBeDefined;
			expect(data).not.toBe(null);
			expect(typeof data).toEqual("object");
		});
	});
	
	it("3 object of non existing university is empty", function(done)
	{
		get("thisUniNameDoesntExistHopefully", function(data)
		{
			done();
			expect(data).toEqual({});
		});
	});
	
	it("4 sql injection", function(done)
	{
		//if the uni argument isn't parametrized the query "MAKE AN ERROR" will follow, since that syntax surely isn't accept it will lead to a psql error
		//if the uni argument is parametrized we can expect to have an empty result since no uni with that name exists
		get("test;MAKE AN ERROR;",function(data)
		{
			done();
			expect(data).toBeDefined;
			expect(data).not.toBe(null);
			expect(data).toEqual({});
		});
		
	});
	
});