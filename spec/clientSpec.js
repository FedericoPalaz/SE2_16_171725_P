//client script testing

//lib to access non exported stuff from a js file in order to test them
var rewire = require("rewire");

//lib for sending requests
var request = require("request");

//rewire file to be tested to access non exported stuff
var client = rewire("../public/scripts/home.js");

//set base URL
//var base_url = "http://localhost:5000/";

//setting mock variables that are used by the file and that should be provided by the html document
	var c = {width:0,height:0};
	client.__set__("window",{innerWidth:1000,innerHeight:1000});
	client.__set__("c",c);
	client.__set__("ctx",{drawImage:function(){},getImageData:function(){},putImageData:function(){},beginPath:function(){},arc:function(){},fill:function(){},stroke:function(){}});
	client.__set__("backup",{});




var Point;
describe("Testing point object: ", function() 
{
	//get Point constructor function
	Point = client.__get__("Point");
	var name = "ayy";
    it("1 correct construction", function() 
	   	{
			expect(Point).toBeDefined();
			var tmp = new Point(name,5,5,10);
			expect(tmp).not.toBeNull();
			expect(tmp.name).toEqual(name);
			expect(tmp.x).toEqual(5);
			expect(tmp.y).toEqual(5);
			expect(tmp.left).toEqual(-5);
			expect(tmp.top).toEqual(-5);
			expect(tmp.right).toEqual(15);
			expect(tmp.bottom).toEqual(15);
			
		}); 
	it("2 x equal to 0", function() 
	   	{
			var tmp = new Point(name,0,5,10);
			expect(tmp).not.toBeNull();
			expect(tmp.name).toEqual(name);
			expect(tmp.x).toEqual(0);
			expect(tmp.y).toEqual(5);
			expect(tmp.left).toEqual(-10);
			expect(tmp.top).toEqual(-5);
			expect(tmp.right).toEqual(10);
			expect(tmp.bottom).toEqual(15);
			
		}); 
	it("3 y equal to 0", function() 
	   	{
			var tmp = new Point(name,5,0,10);
			expect(tmp).not.toBeNull();
			expect(tmp.name).toEqual(name);
			expect(tmp.x).toEqual(5);
			expect(tmp.y).toEqual(0);
			expect(tmp.left).toEqual(-5);
			expect(tmp.top).toEqual(-10);
			expect(tmp.right).toEqual(15);
			expect(tmp.bottom).toEqual(10);
			
		}); 
	it("4 x and y equal to 0", function() 
	   	{
			var tmp = new Point(name,0,0,10);
			expect(tmp).not.toBeNull();
			expect(tmp.name).toEqual(name);
			expect(tmp.x).toEqual(0);
			expect(tmp.y).toEqual(0);
			expect(tmp.left).toEqual(-10);
			expect(tmp.top).toEqual(-10);
			expect(tmp.right).toEqual(10);
			expect(tmp.bottom).toEqual(10);
			
		}); 
	it("5 x and y equal to 0", function() 
	   	{
			var tmp = new Point(name,0,0,10);
			expect(tmp).not.toBeNull();
			expect(tmp.name).toEqual(name);
			expect(tmp.x).toEqual(0);
			expect(tmp.y).toEqual(0);
			expect(tmp.left).toEqual(-10);
			expect(tmp.top).toEqual(-10);
			expect(tmp.right).toEqual(10);
			expect(tmp.bottom).toEqual(10);
			
		}); 
	it("6 radius equal to 0", function() 
	   	{
			var tmp = new Point(name,5,5,0);
			expect(tmp).not.toBeNull();
			expect(tmp.name).toEqual(name);
			expect(tmp.x).toEqual(5);
			expect(tmp.y).toEqual(5);
			expect(tmp.left).toEqual(5);
			expect(tmp.top).toEqual(5);
			expect(tmp.right).toEqual(5);
			expect(tmp.bottom).toEqual(5);
			
		}); 
	it("7 everything equal to 0", function() 
	   	{
			var tmp = new Point(0,0,0,0);
			expect(tmp).not.toBeNull();
			expect(tmp.name).toEqual(0);
			expect(tmp.x).toEqual(0);
			expect(tmp.y).toEqual(0);
			expect(tmp.left).toEqual(0);
			expect(tmp.top).toEqual(0);
			expect(tmp.right).toEqual(0);
			expect(tmp.bottom).toEqual(0);
			
		}); 
});

describe("Testing correct *From and *To data(top level variables):", function()
{
	it("1 teaching existance and length", function()
	  	{
			var from =  client.__get__("teachingFrom");
			var to = client.__get__("teachingTo");
			expect(from).toBeDefined();
			expect(to).toBeDefined();
			expect(from.length).toEqual(to.length);
		});
	it("2 research existance and length", function()
	  	{
			var from =  client.__get__("researchFrom");
			var to = client.__get__("researchTo");
			expect(from).toBeDefined();
			expect(to).toBeDefined();
			expect(from.length).toEqual(to.length);
		});
	it("3 local life existance and length", function()
	  	{
			var from = client.__get__("localFrom");
			var to = client.__get__("localTo");
			expect(from).toBeDefined();
			expect(to).toBeDefined();
			expect(from.length).toEqual(to.length);
		});
});

describe("Testing selected,sX,sY (top level variables):", function()
{
	var sel = client.__get__("selected");
	var sX = client.__get__("sX");
	var sY = client.__get__("sY");	
	it("1 existance", function()
	  	{
			expect(sel).toBeDefined();
			expect(sX).toBeDefined();
			expect(sY).toBeDefined();	
		});
	it("2 expected value", function()
	  	{
			expect(sel).toEqual("");
			expect(sX).toEqual(0);
			expect(sY).toEqual(0);
		});
});



describe("Testing refresh(event) function: ", function()
{
	var refresh = client.__get__("refresh");
	var uniP = client.__get__("uniPoints");
	
	
	it("1 existance", function()
	  	{
			expect(refresh).toBeDefined();
		});
	it("2 canvas width and height modified", function()
	  	{
			var oldW = c.width;
			var oldH = c.height;
			refresh();
			expect(c.width).not.toEqual(oldW);
			expect(c.height).not.toEqual(oldH);
		});
	
});

describe("Testing processPoints() function: ", function()
{
	var processPoints = client.__get__("processPoints");
	var uniP = client.__get__("uniPoints");
	it("1 existance", function()
	  	{
			expect(processPoints).toBeDefined();
		});
	it("2 points get processed", function()
	  	{
			client.__set__("points","");
			processPoints();
			var tmp = client.__get__("points");
			expect(tmp).not.toEqual("");
			expect(tmp.length).toBeDefined();
			//there must be a point for each uniPoint
			expect(tmp.length).toEqual(uniP.length);
		});
	it("3 sX and sY updated", function()
	  	{
			client.__set__("selected",uniP[0][2]);
			processPoints();
			expect(client.__get__("sX")).toEqual(uniP[0][0] * c.width);
			expect(client.__get__("sY")).toEqual(uniP[0][1] * c.height);
			
		});
});

describe("Testing checkClick(event) function: ", function()
{
	var checkClick = client.__get__("checkClick");
	//mockup points[] to be used to check clickable areas
	var points = [];
	for(var i = 0; i < client.__get__("uniPoints").length; i++)
		points.push(new Point(i,i,i,0.1));
	//defining all uniData fields since httpGetAsync isn't meant to be tested here
	var uniData = {};
	for(var i = 0; i < points.length; i++)
		uniData[points[i].name] = "";
	client.__set__("uniData",uniData);
	//mockup displayUniInfo to avoid calling document etc and non existing DOM elements
	client.__set__("displayUniInfo",function(){});
	
	it("1 existance", function()
	{
		expect(checkClick).toBeDefined();
	});
	
	it("2 sX and sY updated", function()
	{
		client.__set__("selected","");
		client.__set__("points",points);
		var event = {};
		event.pageX = points[0].x;
		event.pageY = points[0].y;
		checkClick(event);
		expect(client.__get__("sX")).toEqual(points[0].x);
		expect(client.__get__("sY")).toEqual(points[0].y);
	});
	
	it("3 no point clicked, selected stays the same", function()
	{
		client.__set__("selected","ayy");
		var event = {};
		event.pageX = -500000;
		event.pageY = -500000;
		checkClick(event);
		expect(client.__get__("selected")).toEqual("ayy");
	});
	
	it("4 right selections with no previous selection", function()
	{
		for(var i = 0; i < points.length; i++)
		{
			client.__set__("selected","");
			var event = {};
			event.pageX = points[i].x;
			event.pageY = points[i].y;
			checkClick(event);
			expect(client.__get__("sX")).toEqual(points[i].x);
			expect(client.__get__("sY")).toEqual(points[i].y);
			expect(client.__get__("selected")).toEqual(points[i].name);
		}
	});
	
	it("5 right selections with previous selection and previous selection stays the same", function()
	{
		client.__set__("selected","ss");
		client.__set__("sX",4);
		client.__set__("sY",4);
		for(var i = 0; i < points.length; i++)
		{
			var event = {};
			event.pageX = points[i].x;
			event.pageY = points[i].y;
			checkClick(event);
			expect(client.__get__("sX2")).toEqual(points[i].x);
			expect(client.__get__("sY2")).toEqual(points[i].y);
			expect(client.__get__("selected2")).toEqual(points[i].name);
			
			expect(client.__get__("sX")).toEqual(4);
			expect(client.__get__("sY")).toEqual(4);
			expect(client.__get__("selected")).toEqual("ss");
		}
	});
	
	it("6 no selections because clicking on border", function()
	{
		client.__set__("selected","ayy");
		client.__set__("selected2","ayy2");
		for(var i = 0; i < points.length; i++)
		{
			var event = {};
			event.pageX = points[i].left;
			event.pageY = points[i].top;
			checkClick(event);
			expect(client.__get__("selected")).toEqual("ayy");
			expect(client.__get__("selected2")).toEqual("ayy2");
		}
	});
	
});

describe("Testing getOffsetLeft function: ", function()
{
	var off = client.__get__("getOffsetLeft");
	var element = {};
	it("1 existance", function()
	{
		expect(off).toBeDefined();
	});
	it("2 no parent", function()
	{	
		expect(off(element)).toEqual(0);
	});
	
	it("3 1 parent with no offset", function()
	{
		//adding a parent but no offset between the 2
		var parent = {};
		element.offsetLeft = 0;
		element.offsetParent = parent;
		expect(off(element)).toEqual(0);
	});
	
	it("4 1 parent with offset", function()
	{
		//adding offset between the 2
		element.offsetLeft = 5.2;
		expect(off(element)).toEqual(5.2);
	});
	
	it("5 2 ancestors with offset, 1 positive 1 negative", function()
	{
		var el = {offsetLeft: 5, 
				  offsetParent: {
					  offsetLeft: -5, 
					  offsetParent: {}
				  }
				 };
		expect(off(el)).toEqual(0);
	});
	
	it("6 4 ancestors with offset ", function()
	{
		var el = {offsetLeft: 5, 
				  offsetParent: {
					  offsetLeft: 3, 
					  offsetParent: {
	   					offsetLeft: 3,
	   					offsetParent: {}
	   				}
				  }
				 };
		expect(off(el)).toEqual(11);
	});
	
});

describe("Testing getOffsetTop function: ", function()
{
	var off = client.__get__("getOffsetTop");
	var element = {};
	
	it("1 existance", function()
	{
		expect(off).toBeDefined();
	});
	
	it("2 no parent", function()
	{	
		expect(off(element)).toEqual(0);
	});
	
	it("3 1 parent with no offset", function()
	{
		//adding a parent but no offset between the 2
		var parent = {};
		element.offsetTop = 0;
		element.offsetParent = parent;
		expect(off(element)).toEqual(0);
	});
	
	it("4 1 parent with offset", function()
	{
		//adding offset between the 2
		element.offsetTop = 5.2;
		expect(off(element)).toEqual(5.2);
	});
	
	it("5 2 ancestors with offset, 1 positive 1 negative", function()
	{
		var el = {offsetTop: 5, 
				  offsetParent: {
					  offsetTop: -5, 
					  offsetParent: {}
				  }
				 };
		expect(off(el)).toEqual(0);
	});
	
	it("6 4 ancestors with offset ", function()
	{
		var el = {offsetTop: 5, 
				  offsetParent: {
					  offsetTop: 3, 
					  offsetParent: {
	   					offsetTop: 3,
	   					offsetParent: {}
	   				}
				  }
				 };
		expect(off(el)).toEqual(11);
	});
	
});

describe("Testing removeSelection(id): ", function()
{
	//replacing with mockup function to avoid calls to document and DOM element
	client.__set__("displayUniInfo",function(){});
	client.__set__("closeTab",function(){});
	
	var rm = client.__get__("removeSelection");
	
	it("0 existance", function()
	{
		expect(rm).toBeDefined();
	});
	
	it("1 Remove 1", function()
	{
		client.__set__("selected","test");
		client.__set__("sX",5);
		client.__set__("sY",5);
		client.__set__("selected2","");
		rm(1);
		expect(client.__get__("selected")).toEqual("");
		expect(client.__get__("sX")).toEqual(0);
		expect(client.__get__("sY")).toEqual(0);
	});
	
	it("2 Remove 2", function()
	{
		client.__set__("selected2","test");
		client.__set__("sX2",5);
		client.__set__("sY2",5);
		rm(2);
		expect(client.__get__("selected2")).toEqual("");
		expect(client.__get__("sX2")).toEqual(0);
		expect(client.__get__("sY2")).toEqual(0);
	});
	
	it("3 Don't do anything on wrong id", function()
	{
		client.__set__("selected","test");
		client.__set__("sX",5);
		client.__set__("sY",5);
		client.__set__("selected2","test");
		client.__set__("sX2",5);
		client.__set__("sY2",5);
		rm(0);
		rm(3);
		rm(1.5);
		expect(client.__get__("selected")).toEqual("test");
		expect(client.__get__("sX")).toEqual(5);
		expect(client.__get__("sY")).toEqual(5);
		expect(client.__get__("selected2")).toEqual("test");
		expect(client.__get__("sX2")).toEqual(5);
		expect(client.__get__("sY2")).toEqual(5);
	});
	
	it("4 Don't do anything on wrong id", function()
	{
		client.__set__("selected","test");
		client.__set__("sX",5);
		client.__set__("sY",5);
		client.__set__("selected2","test");
		client.__set__("sX2",5);
		client.__set__("sY2",5);
		rm(0);
		rm(3);
		rm(1.5);
		expect(client.__get__("selected")).toEqual("test");
		expect(client.__get__("sX")).toEqual(5);
		expect(client.__get__("sY")).toEqual(5);
		expect(client.__get__("selected2")).toEqual("test");
		expect(client.__get__("sX2")).toEqual(5);
		expect(client.__get__("sY2")).toEqual(5);
	});
	
	it("5 Overwrite select with select2", function()
	{
		client.__set__("selected","test");
		client.__set__("sX",5);
		client.__set__("sY",5);
		client.__set__("selected2","test2");
		client.__set__("sX2",50);
		client.__set__("sY2",50);
		rm(1);
		expect(client.__get__("selected")).toEqual("test2");
		expect(client.__get__("sX")).toEqual(50);
		expect(client.__get__("sY")).toEqual(50);
	});
});

/*
Functions that just manipulate the DOM or the canvas aren't tested because either:
-there are no means to test if the results are what we expected
-they are just a sequence of DOM calls, i.e. appendChild(~~); appendChild(~~);
*/
