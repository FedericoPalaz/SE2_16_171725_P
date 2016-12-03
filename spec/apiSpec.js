//test of the APIs, make sure your app is running on the correct url and port (enter your project directory via terminal and use the commando "heroku terminal").

//lib for sending requests
var request = require("request");

//set base URL
var base_url = "http://localhost:5000/";

//simple function to check if a returned string is in JSON format
function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

 //Tests for /data/universities, returns a JSON object {names:String[]} wich contains all university names.
describe("Test /data/universities: ", function() {
	
    it("1 returns status code 200", function(done) {
        request.get(
            base_url + "data/universities", 
            function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
    }); 
	
	it("2 returns a JSON object", function(done) {
        request.get(base_url + "data/universities", 
            function(error, response, body) {
				expect(isJson(response.body)).toEqual(true);
				done();
            });
    }); 
		
	it("3 returns an object with names field", function(done) {
        request.get(
            base_url + "data/universities", 
            function(error, response, body) {
				if(isJson(response.body))
				{
					var obj = JSON.parse(response.body);
					expect(obj.names).toBeDefined();
					expect(typeof obj.names).toEqual(typeof []);
				}
                done();
            });
    }); 
	
	it("4 returns an object with names field wich is an array of string", function(done) {
        request.get(
            base_url + "data/universities", 
            function(error, response, body) {
				if(isJson(response.body))
				{
					var obj = JSON.parse(response.body);
					for(var i = 0; i < obj.names.length; i++)
						expect(typeof obj.names[i]).toEqual(typeof "");
				}
                done();
            });
    }); 
})

//Tests for /data/faculties, returns a JSON object {names:String[]} wich contains all faculty names.
describe("Test /data/faculties: ", function() {
	
    it("1 returns status code 200", function(done) {
        request.get(
            base_url + "data/faculties", 
            function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
    }); 
	
	it("2 returns a JSON object", function(done) {
        request.get(base_url + "data/faculties", 
            function(error, response, body) {
				expect(isJson(response.body)).toEqual(true);
				done();
            });
    }); 
		
	it("3 returns an object with names field", function(done) {
        request.get(
            base_url + "data/faculties", 
            function(error, response, body) {
				if(isJson(response.body))
				{
					var obj = JSON.parse(response.body);
					expect(obj.names).toBeDefined();
					expect(typeof obj.names).toEqual(typeof []);
				}
                done();
            });
    }); 
	
	it("4 returns an object with names field wich is an array of string", function(done) {
        request.get(
            base_url + "data/faculties", 
            function(error, response, body) {
				if(isJson(response.body))
				{
					var obj = JSON.parse(response.body);
					for(var i = 0; i < obj.names.length; i++)
						expect(typeof obj.names[i]).toEqual(typeof "");
				}
                done();
            });
    }); 
})

/*
Tests for /data?uni=<parameter>, returns a JSON object rerpesenting the universty, empty if the parameter doesn't correspond to any university, {error:'error'} if there has been an error.
Status code is 200 if a uni parameter is provided, 406 if it's not provided.
500 in case of internal error.
*/
describe("Test /data?uni=<parameter>: ", function() {
	
    it("1 returns status code 200 if query is correct (parameter exists)", function(done) {
        request.get(
            base_url + "data?uni", 
            function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
    }); 
	
	it("2 returns a JSON object", function(done) {
        request.get(base_url + "data?uni", 
            function(error, response, body) {
				expect(isJson(response.body)).toEqual(true);
				done();
            });
    }); 
		
	it("3 returns an empty object if the university doesn't exist", function(done) {
        request.get(
            base_url + "data?uni=NONEXISTANTNAME", 
            function(error, response, body) {
				if(isJson(response.body))
				{
					var obj = JSON.parse(response.body);
					expect(obj).toEqual({});
				}
                done();
            });
    }); 
	
	it("4 returns an object with containg data about the university if it exists", function(done) {
        request.get(
            base_url + "data?uni=trento", 
            function(error, response, body) {
				expect(body).toContain("trento");
                done();
            });
    }); 
	
	it("5 returns status code 406 if uni parameter is missing", function(done) {
        request.get(
            base_url + "data", 
            function(error, response, body) {
				expect(response.statusCode).toBe(406);
                done();
            });
    }); 
})

/*
Tests for /noscript, both with and without parameter "uni".
*/
describe("Test /noscript: ", function() {
	
    it("1 returns status code 200", function(done) {
        request.get(
            base_url + "noscript", 
            function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
    }); 
	
	it("2 returns status code 200 with uni parameter", function(done) {
        request.get(base_url + "noscript?uni='trento'",
            function(error, response, body) {
				expect(response.statusCode).toBe(200);
				done();
            });
    }); 
		
	//! this test assumes that a university named "trento" exists
	it("3 body has information about queried university", function(done) {
        request.get(
            base_url + "noscript?uni=trento", 
            function(error, response, body) {
				expect(response.body).toContain("trento");
                done();
            });
    }); 
	
})


