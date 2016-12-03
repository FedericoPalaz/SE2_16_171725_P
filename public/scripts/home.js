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
	[0.38808373590982287,0.05135520684736091,'bolzano'],
	[0.3752012882447665,0.0912981455064194,'trento'],
	[0.30,0.14,'brescia'],
	[0.23832528180354268,0.11697574893009986,'bergamo'],
	[0.178743961352657,0.12268188302425106,'varese'],
	[0.18840579710144928,0.1326676176890157,'castellanza'],
	[0.20,0.17,'milano'],
	[0.19806763285024154,0.19258202567760344,'pavia'],
	[0.14492753623188406,0.1768901569186876,'vercelli'],
	[0.08,0.19,'torino'],
	[0.08,0.12,'aosta'],
	[0.35,0.15,'verona'],
	[0.41,0.19,'padova'],
	[0.46,0.17,'venezia'],
	[0.5217391304347826,0.10128388017118402,'udine'],
	[0.5523349436392915,0.14550641940085593,'trieste'],
	[0.28019323671497587,0.23537803138373753,'parma'],
	[0.32367149758454106,0.24679029957203993,'modena'],
	[0.39,0.24,'ferrara'],
	[0.357487922705314,0.2582025677603424,'bologna'],
	[0.17391304347826086,0.25392296718972895,'genova'],
	[0.2898550724637681,0.30813124108416545,'pisa'],
	[0.35104669887278583,0.32667617689015693,'firenze'],
	[0.36553945249597425,0.38088445078459343,'siena'],
	[0.46859903381642515,0.34522111269614836,'urbino'],
	[0.5281803542673108,0.3537803138373752,'ancona'],
	[0.5394524959742351,0.3751783166904422,'macerata'],
	[0.5040257648953301,0.39514978601997147,'camerino'],
	[0.45,0.40,'perugia'],
	[0.4025764895330113,0.4550641940085592,'viterbo'],
	[0.44605475040257647,0.5235378031383737,'roma'],
	[0.55,0.56,'cassino'],
	[0.5169082125603864,0.456490727532097,'l aquila'],
	[0.5668276972624798,0.4607703281027104,'teramo'],
	[0.59,0.48,'chieti'],
	[0.6038647342995169,0.5378031383737518,'campobasso'],
	[0.6328502415458938,0.5848787446504993,'benevento'],
	[0.5877616747181964,0.6062767475035663,'napoli'],
	[0.6360708534621579,0.62339514978602,'salerno'],
	[0.71,0.62,'potenza'],
	[0.7085346215780999,0.536376604850214,'foggia'],
	[0.8373590982286635,0.5962910128388017,'bari'],
	[0.9210950080515298,0.6462196861626248,'lecce'],
	[0.7552334943639292,0.7375178316690443,'rende'],
	[0.80,0.8,'catanzaro'],
	[0.72,0.88,'reggio calabria'],
	[0.68,0.87,'messina'],
	[0.51,0.87,'palermo'],
	[0.6586151368760065,0.9386590584878745,'catania'],
	[0.13687600644122383,0.5991440798858774,'sassari'],
	[0.17,0.75,'cagliari']];

//From arrays are the names of the attributes of the objects received from the server
//To arrays are the names to be displayed
var teachingFrom = ["age_prof","prof_per_stud","job_after_degree","languages_classes"];
var teachingTo = ["average teacher age","professors/students ratio","job after 3 months","classes in english"];
	
var researchFrom = ["cit_prof","total_cit","annual_funding","laboratories"];
var researchTo = ["average citations per teacher","total citations","annual funding(€)","laboratories"];
	
var localFrom = ["avg_income","internet_speeed","pop_density","english_knownledge"];
var localTo = ["average income(€,yearly)","average internet speed(Mb/s)", "population density(people/km2)","% of fluent english speakers"];

//will store points with fields dependant on the current window size, it's a processed version of uniPoints
var points = [];

//initially empty, every time the server gets queried for infos about a university the info is stored here in order to not strain the server if the info about that university is requested again
var uniData = {};

//radius of the clickable area around a uni as a % of the total map area
var refRadius = 0.000010;
var c;//canvas
var ctx;//context of the canvas
var backup;//backup image data to avoid calling the function refresh() on points deselection, it's a "clean" map, with no points selected
var img;//img to draw in the canvas


//currently selected uni and its coordinates
var selected = "";
var sX = 0;
var sY = 0;
//second selection and its coordinates
var selected2 = "";
var sX2 = 0;
var sY2 = 0;


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
	ctx.drawImage(img, 0, 0, c.width, c.height);
	//backup clean map with no selections
	backup = ctx.getImageData(0,0,c.width,c.height);
	processPoints();
};


 //Starting from the data in uniPoints create Points objects based on the current window size.
function processPoints()
{
	//empty old points
	points = [];
	//clickable area around a uni
	var refArea = (c.width*c.height)*refRadius;
	//calculate new area and position depending on window size
	for(var i = 0; i < uniPoints.length; i++)
	{
		points.push(new Point(uniPoints[i][2],c.width*uniPoints[i][0],c.height*uniPoints[i][1],refArea));
		//if the point refers to a selected university show the selection on the map
		if(points[i].name === selected)
		{
			sX = points[i].x;
			sY = points[i].y;
		}
		else if(points[i].name === selected2)
		{
			sX2 = points[i].x;
			sY2 = points[i].y;
		}
	}
	//show selected universities if they exist
	showSelection();
}

//stuff to do on window load
 function onLoad() {
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
	var found = false;
    for (var i = 0; i < points.length && !found; i++) 
	{
		//check if the clicked coordinates area inside any Point area, by checking the
		//boundaries of each area
        if (clickedX < points[i].right && clickedX > points[i].left
			&& clickedY > points[i].top && clickedY < points[i].bottom)
		{
			found = true;
			//if no unis are currently selected
			if(selected === "")
			{
				selected = points[i].name;
				sX = points[i].x;
				sY = points[i].y;
			}
			else if(selected != points[i].name)
			{
				//if there is already a uni selected add this selection as a second selection
				selected2 = points[i].name;
				sX2 = points[i].x;
				sY2 = points[i].y;
			}
			//if a university has been selected query the server only if the information hasn't already been stored locally
			if(typeof uniData[points[i].name] == 'undefined')
			{
				httpGetAsync('/data?uni='+points[i].name, function(data)
							 	{
									var uni = JSON.parse(data);
									//store info locally
									uniData[uni.name] = uni;
									displayUniInfo(selected);
								});
			}
			else
				displayUniInfo();
			//cant put displayUniInfo(selected) here due to the async nature of the http req
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


/**
 * @brief Clears the selection of a university, depending on the id passed.
 Id 1 -> clear first selection.
 Id 2 -> clear second selection.
 * @param in int id Id to identify wich selection to remove.
 */
function removeSelection(id)
{
	if(id==1)
	{
		if(selected2 !== "")
		{
			selected = selected2;
			sX = sX2;
			sY = sY2;
			selected2 = "";
			sX2 = 0;
			sY2 = 0;
		}
		else
		{
			selected = "";
			sX = 0;
			sY = 0;
		}
	}
	else if(id==2)
	{
		selected2 = "";
		sX2 = 0;
		sY2 = 0;
	}
	refresh({});
	if(selected != "")
		displayUniInfo();
	else
		closeTab();
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
 */
function displayUniInfo()
{
	var head = document.getElementById("tabHead");
	var body = document.getElementById("tabContent");
	assembleTabHead(head);
	assembleTabContent(body);
	document.getElementById("tabs").style.display = "block";
	updateDisplayTitle();
	//draw a circle around the selected uni
	showSelection();
}

/**
 * @brief Assembles the tab header with #faculties + 1 menus.
 The first menu is for the average of the university, the other ones are one for each faculty.
 * @param in div head A nav(div html element withc lass nav nav-pills) to fill with content.
 */
function assembleTabHead(head)
{
	//remove all previous children
	while(head.firstChild)
		head.removeChild(head.firstChild);
	//create a first, selected element and add it to the head
	var firstEl = document.createElement("li");
	firstEl.innerHTML = '<a data-toggle="pill" href="#home">average between faculties</a>';
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
	head.appendChild(makeExitButton("red",1));
	//if 2 universities are selected add a second exit button
	if(selected2 != "")
		head.appendChild(makeExitButton("blue",2));
}

/**
 * @brief Given a color and an id make an exit button wich if clicked will lead to the deselection of the first/second selected university. If a university remains selected (i.e. you have 2 selected universities and you click the exit button related to the first one) the tab won't close but will show infos about the remaining selected university.
 * @param in String color A string representing the color of the button, in css format.
 * @param in int id Id to select wich of the selected universities this button is related to (1 for selected, 2 for selected2).
 * @return Description of returned value.
 */
function makeExitButton(color,id)
{
	var exit = document.createElement("li");
	exit.innerHTML = '<a data-toggle="pill"> X </a>';
	exit.style.backgroundColor = color;
	//passing function(){~~~~} instead of passing the function directly and having it to check id with this.id makes removeSelection easier to test
	exit.addEventListener("click",function(){removeSelection(id);});
	return exit;
}

/**
 * @brief Fills the passed tab-content(a div) with tab-panes describing the data of a university. The number of panes will be #faculties+1.
 If two universities are selected the tab will contain information to describe both universities, and tables to compare the two.
 * @param in div body Div element to fill with content.
 */
function assembleTabContent(body)
{
	//remove all previous children
	while(body.firstChild)
		body.removeChild(body.firstChild);
	var firstTab = document.createElement("div");
	//so that the link in the head gets to this element
	firstTab.setAttribute("id","home");
	firstTab.className = "tab-pane fade in active";
	//assemble first tab, if only 1 university is selected no need for comparison
	if(selected2 === "")
	{
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
	else
	{
		assembleSingleTab(firstTab,uniData[selected],uniData[selected2]);
		body.appendChild(firstTab);
		//for each faculty create tab content and add it to the body
		for(var i = 0; i < uniData[selected].faculties.length;i++)
		{
			//make new tab, assemble it and add it to body
			var tmp = document.createElement("div");
			//so that the faculty link in the head gets to this element
			tmp.setAttribute("id","menu"+i);
			tmp.className = "tab-pane fade";
			assembleSingleTab(tmp,uniData[selected].faculties[i],uniData[selected2].faculties[i]);
			body.appendChild(tmp);
		}
	}
}

/**
 * @brief Fills the passed tab(div) with content to show the user information about the selected university (universities), and comparse them if 2 are selected.
 * @param in div element Div html element to be filled with content.
 * @param in objet dataObj1 Object to get data from to make content, relative to the first selection.
 * @param in objet dataObj2 Object to get data from to make content, relative to the second selection.
 */
function assembleSingleTab(element,dataObj1,dataObj2)
{
	//name of the uni and circle with color associated with the selected university
	var name = document.createElement("h2");
	//needed because even if the dataObj is a faculty we want to show the uni_name and not the faculty name
	if(typeof dataObj1.uni_name === 'undefined')
		name.innerHTML = dataObj1.name;
	else
		name.innerHTML = dataObj1.uni_name;
	var circle = document.createElement("div");
	circle.className += "circle red";
	//set up 3 text elements describing the tables
	var did = document.createElement("h3");
	did.innerHTML = "teaching";
	var research = document.createElement("h3");
	research.innerHTML = "research";
	var local = document.createElement("h3");
	local.innerHTML = "local life";
	
	var div1 = document.createElement("div");
	element.appendChild(div1);
	//append text elements and tables created on the fly
	div1.appendChild(name);
	div1.appendChild(circle);
	div1.appendChild(did);
	div1.appendChild(makeTable(dataObj1,teachingFrom,teachingTo));
	div1.appendChild(research);
	div1.appendChild(makeTable(dataObj1,researchFrom,researchTo));
	div1.appendChild(local);
	div1.appendChild(makeTable(dataObj1,localFrom,localTo));
	
	//if 2 university selected add second uni's info and compare them
	if(typeof dataObj2 != 'undefined')
	{
		//add row to contain the 3 divs of data
		var container = document.createElement("div");
		container.className += "row";
		//remove div1 from element because div1 will be appended to container, wich will be appended to element
		element.removeChild(div1);
		container.appendChild(div1);
		div1.className += "col-sm-5";
		
		//make div2 will contains informations about second selection
		var div2 = document.createElement("div");
		div2.className += "col-sm-5";
		container.appendChild(div2);
		
		//name of the uni and circle with color associated with the selected university
		var name2 = document.createElement("h2");
		//needed because even if the dataObj is a faculty we want to show the uni_name and not the faculty name
		if(typeof dataObj2.uni_name === 'undefined')
			name2.innerHTML = dataObj2.name;
		else
			name2.innerHTML = dataObj2.uni_name;
		var circle2 = document.createElement("div");
		circle2.className += "circle blue";
		
		
		
		//append text elements and tables created on the fly
		div2.appendChild(name2);
		div2.appendChild(circle2);
		div2.appendChild(did.cloneNode(true));
		div2.appendChild(makeTable(dataObj2,teachingFrom,teachingTo));
		div2.appendChild(research.cloneNode(true));
		div2.appendChild(makeTable(dataObj2,researchFrom,researchTo));
		div2.appendChild(local.cloneNode(true));
		div2.appendChild(makeTable(dataObj2,localFrom,localTo));
		
		//make div3 wich contains the comparison between uni1 and uni2
		var div3 = document.createElement("div");
		div3.className += "col-sm-2";
		container.appendChild(div3);
		
		//name of the uni and circle with color associated with the selected university
		var name3 = document.createElement("h2");
		name3.innerHTML = "comparison";
		name3.style.visibility = "hidden";
		var circle3 = document.createElement("div");
		circle3.className += "circle gray";
		
		var did3 = document.createElement("h3");
		did3.innerHTML = "teaching";
		did3.style.visibility = "hidden";	
		var research3 = document.createElement("h3");
		research3.innerHTML = "research";
		research3.style.visibility = "hidden";
		var local3 = document.createElement("h3");
		local3.style.visibility = "hidden";
		local3.innerHTML = "local";
		
		//append text elements and tables created on the fly
		div3.appendChild(name3);
		div3.appendChild(did3);
		div3.appendChild(makeComparisonTable(dataObj1,dataObj2,teachingFrom,teachingTo));
		div3.appendChild(research3);
		div3.appendChild(makeComparisonTable(dataObj1,dataObj2,researchFrom,researchTo));
		div3.appendChild(local3);
		div3.appendChild(makeComparisonTable(dataObj1,dataObj2,localFrom,localTo));
		
		//append container containing all 3 divs to the element
		element.appendChild(container);
	}
}
	
/**
 * @brief Makes a table element with data taken from the dataObj, using fields specified by the from[].
 * @param in {} dataObj Data object containg informations about the university to be displayed.
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
 * @brief Makes a table element where each row is colored depending on wich university wins in comparison for each statistic, red if the first wins, blue if the second wins, gray if they draw.
 * @param in {} dataObj1 Data object containg informations about the first university.
 * @param in {} dataObj2 Data object containg informations about the second university.
 * @param in String[] from Name of the fields of the object to use for the table.
 * @param in String[] to Names to describe the data, to avoid using the ones in "from".
 * @return A table element with a row for each element of "from", colored depending on who wins a comparison between the 2 universities.
 */
function makeComparisonTable(dataObj1,dataObj2,from,to)
{
	var table = document.createElement("table");
	for(var i = 0;i < from.length;i++)
	{
		var row = document.createElement("tr");
		var td = document.createElement("td");
		//add whitespace to give them form
		td.innerHTML="&nbsp;&nbsp;&nbsp;&nbsp;";
		//red if 1 is better than 2, blue if 2 is better than 1, gray otherwise
		if(dataObj1[from[i]] > dataObj2[from[i]])
			td.className += "red";
		else if(dataObj1[from[i]] < dataObj2[from[i]])
			td.className += "blue";
		else
			td.className += "gray";
		row.appendChild(td);
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
	else if(selected2 === "")
		display.innerHTML = "Currently selected: " + selected + ", select another university to compare them.";
	else 
		display.innerHTML = "Currently comparing: " + selected + " and " + selected2;
}

/**
 * @brief To make the tab with information about a university "close" (it gets hidden). The page title gets updated.
 */
function closeTab()
{
	document.getElementById("tabs").style.display = "none";
	updateDisplayTitle();
}

/**
 * @brief Shows the selected university(universities) on the map drawing a circle on it.
 */
function showSelection()
{
	ctx.putImageData(backup, 0, 0);
	//area of the circle around a uni
	var refArea = (c.width*c.height)*refRadius;
	if(selected != "")
	{
		ctx.beginPath();
		ctx.arc(sX,sY, refArea, 0, 2 * Math.PI);
		ctx.fillStyle = "red";
		ctx.fill();
		ctx.stroke();
		if(selected2 != "")
		{
			ctx.beginPath();
			ctx.arc(sX2,sY2, refArea, 0, 2 * Math.PI);
			ctx.fillStyle = "blue";
			ctx.fill();
			ctx.stroke();
		}
	}
}

