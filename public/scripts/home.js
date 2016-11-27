//model
///////

//point object, represents an area around a university wich will be clickable
var Point = function(name,x,y,radius)
{
	this.name = name;
	this.x = x;
	this.y = y;
	this.left = x - radius;
    this.top = y - radius;
    this.right = x + radius;
    this.bottom = y + radius;
};

//point coordinates [x,y,name of university], x and y aren't absolute but relative to
//refX and refY when the image had x and y equal to refX and refY, so every point will have 
// x  = absolute X/refX and y = absoluteY/refY
var uniPoints = [
	[0.38,0.05,'bolzano'],
	[0.37,0.09,'trento'],
	[0.30,0.14,'brescia'],
	[0.23,0.12,'bergamo'],
	[0.17,0.12,'varese'],
	[0.18,0.13,'castellanza'],
	[0.20,0.17,'milano'],
	[0.19,0.19,'pavia'],
	[0.14,0.18,'vercelli'],
	[0.08,0.19,'torino'],
	[0.08,0.12,'aosta'],
	[0.35,0.15,'verona'],
	[0.41,0.19,'padova'],
	[0.46,0.17,'venezia'],
	[0.51,0.10,'udine'],
	[0.55,0.14,'trieste'],
	[0.28,0.23,'parma'],
	[0.32,0.24,'modena'],
	[0.39,0.24,'ferrara'],
	[0.35,0.26,'bologna'],
	[0.17,0.25,'genova'],
	[0.29,0.30,'pisa'],
	[0.35,0.32,'firenze'],
	[0.47,0.32,'s. marino'],
	[0.36,0.38,'siena'],
	[0.46,0.34,'urbino'],
	[0.52,0.35,'ancona'],
	[0.54,0.37,'macerata'],
	[0.51,0.39,'camerino'],
	[0.45,0.40,'perugia'],
	[0.40,0.45,'viterbo'],
	[0.44,0.52,'roma'],
	[0.55,0.56,'cassino'],
	[0.51,0.45,'l aquila'],
	[0.56,0.46,'teramo'],
	[0.59,0.48,'chieti'],
	[0.60,0.53,'campobasso'],
	[0.63,0.58,'benevento'],
	[0.58,0.60,'napoli'],
	[0.63,0.62,'salerno'],
	[0.71,0.62,'potenza'],
	[0.70,0.53,'foggia'],
	[0.83,0.6,'bari'],
	[0.91,0.64,'lecce'],
	[0.75,0.73,'rende'],
	[0.78,0.8,'catanzaro'],
	[0.72,0.88,'reggio calabria'],
	[0.68,0.87,'messina'],
	[0.51,0.87,'palermo'],
	[0.65,0.94,'catania'],
	[0.13,0.60,'sassari'],
	[0.17,0.75,'cagliari']];

//will store points with fields dependant on the current window size, it's a processed version of uniPoints
var points = [];

//initially empty, every time the server gets queried for infos about a university the info is stored here in order to not strain the server if the info about that university is requested again
var uniData = {};

var c;//canvas
var ctx;//context of the canvas
var img;//img to draw in the canvas
var selected;//currently selected uni
//canvas dimensions used at first draw, will be later used to determine where to draw points on resize


//reference x, y and radius (radius of the clickable area around a university) used to calculate new position on resize
var refX = 337;
var refY = 410;
var refRadius = 5;


//control
/////////

/**
 * @brief Does an http get request to the specified url, the response text is passed to
 the callback function.
 * @param in string url Url for get request.
 * @param in function callback Callback function that receives the response text.
 * @return Description of returned value.
 */
function httpGetAsync(url,callback)	
{
	var xhr = new XMLHttpRequest();
	var response = {};
	xhr.onreadystatechange = function() 
	{
		//when response arrives pass it to callback
		if (xhr.readyState == XMLHttpRequest.DONE)
			callback(xhr.responseText);
	}
	xhr.open('GET', url, true);
	xhr.send(null);
}

/**
 * @brief Calculate new canvas dimension and new clickable areas (Points) positions based on current window size.
 * @param in event event The resize event passed by the window resizing.
 */
function refresh(event) {
    //resize canvas and draw image again
    c.width = window.innerWidth / 4 * 1.3;
    c.height = window.innerHeight / 1.5;
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	processPoints();
	//drawPoints();
};


 //Starting from the data in uniPoints create Points objects based on the current window size.
function processPoints()
{
	//empty old points
	points = [];
	//proportion to use to determine the area around a university wich is clickable
	var refArea = (c.width*c.height)/(refX*refY);
	//calculate new area and position depending on window size
	for(var i = 0;i <uniPoints.length;i++)
		points.push(new Point(uniPoints[i][2],c.width*uniPoints[i][0],c.height*uniPoints[i][1],refRadius*refArea));
}

//stuff to do on window load
window.onload = function() {
	//hide the img since it's used in the canvas
	img = document.getElementById("map");
	//get canvas and its context
    c=document.getElementById("canvas");
    ctx=c.getContext("2d");
	//use refresh to draw the canvas
	refresh();
	//make it clickable
	c.addEventListener("click",checkClick);
	//refresh every time the window is resized
	window.onresize = refresh;
};

/**
 * @brief Checks against the array of Points if the click on the canvas is in the area of any of these points, to determine if the user is selecting a university.
 If a university has been selected query the server for data about that university only if the data isn't stored locally already.
 * @param in event e Click event passed (passed by the clicked canvas).
 */
function checkClick(e) {
    var clickedX = e.pageX - this.offsetLeft;
    var clickedY = e.pageY - this.offsetTop;
    for (var i = 0; i < points.length; i++) 
	{//check if the clicked coordinates area inside any Point area, by checking the
	 //boundaries of each area
        if (clickedX < points[i].right && clickedX > points[i].left
			&& clickedY > points[i].top && clickedY < points[i].bottom)
		{
			//if a university has been selected query the server only if the information hasn't already been stored locally
			if(typeof uniData[points[i].name] == 'undefined')
			{
				httpGetAsync('http://127.0.0.1:1337/data?uni='+points[i].name,						function(data)
							 	{
									var uni = JSON.parse(data);
									//store info locally
									uniData[uni.name] = uni;
								});
			}
			selected = points[i].name;
			displayUniInfo(selected);
        }
    }
};



//view
//////

//testing purposes
function drawPoints()
{
	//proportion to use to determine the area around a university wich is clickable
	var refArea = (c.width*c.height)/(refX*refY);
	for(var i = 0;i <uniPoints.length;i++)
	{
		ctx.beginPath();
		ctx.arc(c.width*uniPoints[i][0],c.height*uniPoints[i][1], refRadius*refArea, 0, 2 * Math.PI);
		ctx.fillStyle = "red";
		ctx.fill();
	}
	ctx.stroke();
}

function displayUniInfo(selected)
{
	;
}
//testing tab creation
function openCity(evt, cityName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}