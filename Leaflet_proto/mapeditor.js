//the map
var map = new L.Map('map');

//the current selected tool
var actual_tool;
//the current selected color
var actual_color;
//usefull to draw lines and rectangle to know if the user clicked one time or two times
var nb_clicks = 0;

//Array containing points coordinates for creating a line
var linePoints = new Array();
//Array containing points coordinates for creating a rectangle
var rectanglePoints = new Array();

//function that change the current selected tool
function selectTool(toolname){
	actual_tool = toolname;
	//reset the array to avoid probs
	linePoints = new Array();
	nb_clicks = 0;
	//update the current tool
	$('#ctool').html('Current tool : '+actual_tool);
}

//function that change the current selected color
function selectColor(colorname){
	actual_color = colorname;
	$('#ccolor').html('Current color : '+actual_color);
}

//function which will be called each time the user click on the element of the map
function click(e){

	//if the current tool is marker
	if(actual_tool == "marker")L.marker(e.latlng).addTo(map);
	//if the current tool is color
	if(actual_tool == "color"){
		//we get the layer user clicked on
		var layer = e.target;
		//we color it with the current color, by modifying his style
		layer.setStyle({color: actual_color});
	}
	//if the current tool is line
	if(actual_tool == "line"){
		//if the user click for the first time on the map
		if(nb_clicks == 0){
			nb_clicks++;
			//we save coordinates where he clicked
			linePoints[0] = e.latlng;
		}
		//if the user already clicked one time
		else if(nb_clicks == 1){
			nb_clicks = 0;
			//we save the coordinates where he clicked
			linePoints[1] = e.latlng;
			//we draw the line between the two points where the user clicked
			L.polyline(linePoints, {color: actual_color}).addTo(map);
		}
	}
	//if the current tool is rectangle
	//we proceed as same as line
	//we save the two points user clicked and we create a rectangle with these two points
	if(actual_tool == 'rectangle'){
		if(nb_clicks == 0){
			nb_clicks++;
			rectanglePoints[0] = e.latlng;
		}
		else if(nb_clicks == 1){
			nb_clicks = 0;
			rectanglePoints[1] = e.latlng;
			L.rectangle(rectanglePoints, {color: actual_color}).addTo(map);
		}
	}
	//if the current tool is text
	if(actual_tool == 'text'){
		//we ask to user which text to display
		var text = prompt('Text :');
		//we create a marker (with no icon) containing the text he gave at the coordinates where he clicked on the map
		var text = L.divIcon({className: "t", html:"<b>"+text+"</b>"});
		L.marker(e.latlng, {icon: text}).addTo(map);
	}
}

//Function that will be called on each created feature layer
//For each "feature" of the geoJSON data, we add a mouse event listener
//each time the user will click on a geoJSON data generated on the map, the "click" function will be called
function onEachFeature(feature, layer){
	layer.on({click: click});
}

//we "center" the view
map.fitWorld();
//we load geoJSON data to draw on the map and attach the function onEachFeature which indicate that
//for each "feature" of the geoJSON object, the function "onEachFeature" will be called
L.geoJson(den, {onEachFeature: onEachFeature}).addTo(map);






