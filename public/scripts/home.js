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

//point coordinates [x,y,name of university], x and y aren't absolute but a % of the width and height of the map
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
	[0.80,0.8,'catanzaro'],
	[0.72,0.88,'reggio calabria'],
	[0.68,0.87,'messina'],
	[0.51,0.87,'palermo'],
	[0.65,0.94,'catania'],
	[0.13,0.60,'sassari'],
	[0.17,0.75,'cagliari']];

//From arrays are the names of the attributes of the objects received from the server
//To arrays are the names to be displayed
var teachingFrom = ["age_prof","prof_per_stud","job_after_degree","languages_classes"];
var teachingTo = ["average teacher age","professors/students ratio","job after 3 months","classes in english"];
	
var researchFrom = ["cit_prof","total_cit","annual_funding","laboratories"];
var researchTo = ["average citations per teacher","total citations","annual funding(€)","laboratories"];
	
var localFrom = ["avg_income","internet_speeed","pop_density","english_knownledge"];
var localTo = ["average income(€,yearly)","average internet speed(Mb/s)", "population density(per square km)","% of fluent english speakers"];

//will store points with fields dependant on the current window size, it's a processed version of uniPoints
var points = [];

//initially empty, every time the server gets queried for infos about a university the info is stored here in order to not strain the server if the info about that university is requested again
var uniData = {};

//radius of the clickable area around a uni as a % of the total map area
var refRadius = 0.00004;
var c;//canvas
var ctx;//context of the canvas
var img;//img to draw in the canvas
var selected = "";//currently selected uni
//canvas dimensions used at first draw, will be later used to determine where to draw points on resize

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
    //resize canvas and draw image again based on window size
	var ref = Math.min(window.innerHeight,window.innerWidth);
	c.width = ref;
	c.height = c.width * 1.13;
	/*
    c.width = window.innerWidth * 0.3125;
    c.height = window.innerHeight * 0.9375;
	*/
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	processPoints();
	//drawPoints();
	console.log(c.width);
	console.log(c.height);
};


 //Starting from the data in uniPoints create Points objects based on the current window size.
function processPoints()
{
	//empty old points
	points = [];
	//clickable area around a uni
	var refArea = (c.width*c.height)*refRadius;
	//calculate new area and position depending on window size
	for(var i = 0;i <uniPoints.length;i++)
		points.push(new Point(uniPoints[i][2],c.width*uniPoints[i][0],c.height*uniPoints[i][1],refArea));
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
	//display title (<h1> above map)
	updateDisplayTitle();
};

/**
 * @brief Checks against the array of Points if the click on the canvas is in the area of any of these points, to determine if the user is selecting a university.
 If a university has been selected query the server for data about that university only if the data isn't stored locally already.
 * @param in event e Click event passed (passed by the clicked canvas).
 */
function checkClick(e) {
    var clickedX = e.pageX - getOffsetLeft(this);
    var clickedY = e.pageY - getOffsetTop(this);
    for (var i = 0; i < points.length; i++) 
	{
		
		//check if the clicked coordinates area inside any Point area, by checking the
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
									selected = uni.name;
									displayUniInfo(selected);
								});
			}
			else
			{
				selected = points[i].name;
				displayUniInfo(selected);
			}
        }
    }
};

/**
 * @brief Given an element, find its left offset relative to the document.
 * @param in element Element for wich to find the left offset.
 * @return The left offset relative to the document.
 */
function getOffsetLeft( elem )
{
    var offsetLeft = 0;
    do {
      if ( !isNaN( elem.offsetLeft ) )
      {
          offsetLeft += elem.offsetLeft;
      }
    } while( elem = elem.offsetParent );
    return offsetLeft;
}

/**
 * @brief Given an element, find its top offset relative to the document.
 * @param in element Element for wich to find the top offset.
 * @return The top offset relative to the document.
 */
function getOffsetTop( elem )
{
    var offsetTop = 0;
    do {
      if ( !isNaN( elem.offsetTop ) )
      {
          offsetTop += elem.offsetTop;
      }
    } while( elem = elem.offsetParent );
    return offsetTop;
}

//view
//////

//testing purposes
function drawPoints()
{
	//area of the circle around a uni
	var refArea = (c.width*c.height)*refRadius;
	for(var i = 0;i <uniPoints.length;i++)
	{
		ctx.beginPath();
		ctx.arc(c.width*uniPoints[i][0],c.height*uniPoints[i][1], refArea, 0, 2 * Math.PI);
		ctx.fillStyle = "red";
		ctx.fill();
	}
	ctx.stroke();
}

/**
 * @brief Show the informations about the selected university in a panel with #faculties+1 tabs.
 * @param in String selected University to display informations.
 */
function displayUniInfo(selected)
{
	var head = document.getElementById("tabHead");
	var body = document.getElementById("tabContent");
	assembleTabHead(head,selected);
	assembleTabContent(body,selected);
	document.getElementById("tabs").style.display = "block";
	updateDisplayTitle();
}

/**
 * @brief Assembles the tab header with #faculties + 1 menus.
 The first menu is for the average of the university, the other ones are one for each faculty.
 * @param in div head A nav(div html element withc lass nav nav-pills) to fill with content.
 * @param in String selected The university to use to get data.
 */
function assembleTabHead(head,selected)
{
	//remove all previous children
	while(head.firstChild)
		head.removeChild(head.firstChild);
	//create a first, selected element and add it to the head
	var firstEl = document.createElement("li");
	firstEl.innerHTML = '<a data-toggle="pill" href="#home">' + uniData[selected].name +'</a>';
	//set class so that its selected by default
	firstEl.className = "active";
	head.appendChild(firstEl);
	//for each faculty of the uni add a tab on the header
	for(var i =0; i < uniData[selected].faculties.length;i++)
	{
		var tmp = document.createElement("li");
		tmp.innerHTML = '<a data-toggle="pill" href="#menu' + i + '">' + 
			uniData[selected].faculties[i].name +'</a>';
		head.appendChild(tmp);
	}
	//add an exit button to the tab
	var exit = document.createElement("li");
	exit.innerHTML = '<a data-toggle="pill"> X </a>';
	exit.style.backgroundColor = "#595959";
	head.appendChild(exit);
	exit.addEventListener("click",closeTab);
}

/**
 * @brief Fills the passed tab-content(a div) with tab-panes describing the data of a university. The number of panes will be #faculties+1.
 * @param in div body Div element to fill with content.
 * @param in String selected The university to use to get data.
 */
function assembleTabContent(body,selected)
{
	//remove all previous children
	while(body.firstChild)
		body.removeChild(body.firstChild);
	var firstTab = document.createElement("div");
	//so that the link in the head gets to this element
	firstTab.setAttribute("id","home");
	firstTab.className = "tab-pane fade in active";
	//assemble first tab
	assembleSingleTab(firstTab,uniData[selected]);
	body.appendChild(firstTab);
	//for each faculty create tab content and add it to the body
	for(var i = 0; i < uniData[selected].faculties.length;i++)
	{
		//make new tab, assemble it and add it to body
		var tmp = document.createElement("div");
		//so that the faculty link in the head gets to this element
		tmp.setAttribute("id","menu"+i);
		tmp.className = "tab-pane fade";
		assembleSingleTab(tmp,uniData[selected].faculties[i]);
		body.appendChild(tmp);
	}
}

/**
 * @brief Fills the passed tab(div) with content.
 * @param in div element Div html element to be filled with content.
 * @param in objet dataObj Object to get data from to make content.
 */
function assembleSingleTab(element,dataObj)
{
	//set up 3 text elements describing the tables
	var did = document.createElement("h3");
	did.innerHTML = "teaching";
	var research = document.createElement("h3");
	research.innerHTML = "research";
	var local = document.createElement("h3");
	local.innerHTML = "local life";
	
	//append text elements and tables created on the fly
	element.appendChild(did);
	element.appendChild(makeTable(dataObj,teachingFrom,teachingTo));
	element.appendChild(research);
	element.appendChild(makeTable(dataObj,researchFrom,researchTo));
	element.appendChild(local);
	element.appendChild(makeTable(dataObj,localFrom,localTo));
}
	
/**
 * @brief Makes a table element with data taken from the dataObj, using fields specified by the from[].
 * @param in String[] from Name of the fields of the object to use for the table.
 * @param in String[] to Names to describe the data, to avoid using the ones in "from".
 * @return A table element with a row for each element of "from". Each row has 2 td, the first is a string from "to", the second is dataObj[from[i]].
 */
function makeTable(dataObj,from,to)
{
	var table = document.createElement("table");
	for(var i = 0;i < from.length;i++)
	{
		var row = document.createElement("tr");
		var td1 = document.createElement("td");
		var td2 = document.createElement("td");
		//name of the data
		td1.innerHTML = to[i];
		//data from the obj
		td2.innerHTML = dataObj[from[i]];
		row.appendChild(td1);
		row.appendChild(td2);
		table.appendChild(row);
	}
	return table;
}

/**
 * @brief Changes the text at the top of the page to tell the user what to do or what he's currently doing.
 */
function updateDisplayTitle()
{
	var display = document.getElementById("display");
	if(selected === "")
		display.innerHTML = "Select a university to get information about it.";
	else
		display.innerHTML = "Currently selected: " + selected + ".";
}

function closeTab()
{
	selected = "";
	document.getElementById("tabs").style.display = "none";
	updateDisplayTitle();
}