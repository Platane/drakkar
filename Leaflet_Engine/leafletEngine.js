//enum for the different types of layers - UNUSED
/*
var ELEMENT_DOT = 0,
	ELEMENT_PATH = 1;
*/

//function that return a certain amount of tabulation ( \t ) depending on the parameter "times" - UNUSED
/*function ident( times ){

	var ident = "";
	
	for(var x = 0;x<times;x++){
		ident += "\t";
	}
	
	return ident;
}*/

/** @class Prototype for designing the Map
*/
var Map = function(){};
Map.prototype = {

	//the leaflet map
	_lmap : null,
	//name of the map
	_name : null,
	//description
	_desc : null, 
	//list of layers on this map
	_layers : new Array(),
	
	//function that create a layer, add it to the map and return it
	createLayer : function( name, desc ){
		var layer = Layer.createLayer(name, desc);
		this.addLayer(layer);
		return layer;
	},
	
	//function to add a layer to this map
	addLayer : function( layer ){
	
		this._layers.push(layer);
		layer._llayer.addTo(this._lmap);
	},
	
	//function to remove a layer from this map
	removeLayer : function( layer ){
		
		arrayUnset(this._layers, layer);
		this._lmap.removeLayer( layer._llayer );
	},
	
	//function to remove a layer using his index on the array of layers of this map
	removeLayerByIndex : function( layer_index ){
		
		var layer = this._layers[layer_index];
		this.removeLayer( layer );
	},
	
	//function to remove all the layers of this map
	removeAllLayers : function(){
		
		for(var layer : this._layers){
				this._lmap.removeLayer( layer );
		}
		this._layers = new Array();
		
	},
	
	//function to get a particular layer on this map
	getLayer : function( layer_index ){
		
		return this._layers[layer_index];
	},
	
	//function that return all the layers on this map (array)
	getLayers : function(){
		return this._layers;
	},
	//function that return the leaflet map object associated to this Map
	getLeafletMap : function(){
		return this._lmap;
	},
	//function that return the name of the map
	getName : function(){
		return this._name;
	},
	//function that return the description of the map
	getDescription : function(){
		return this._desc;
	}
	
}
//Function to create a new map with a name, a description and the div id of the element where we display the map
//for map options see : http://leafletjs.com/reference.html#map-constructor
Map.createMap = function( name, desc, div_id, leaflet_map_options ){
	var m = new Map();
	m._lmap = new L.Map(div_id, leaflet_map_options);
	m._name = name;
	m._description = desc;
	return m;
}

/*###########################################################################################################################*/

//Layer prototype
//It contains the name of the layer, his description, an array of 'elements'
//and a LayerGroup objects of leaflet Library
//'elements' should only be leaflet layers (not layerGroup if possible to avoid Layer containing Layer containing other layers and so on...)
//To add an Elements, just call the function addElement(elem) where elem is a leaflet layer like : L.marker([55, 54])
var Layer = function(){};
Layer.prototype = {

	//name of the layer
	_name : null,
	//description of the layer (his content)
	_desc : null,
	//type of layer (dots or paths)
	//_type : null,
	//The leaflet LayerGroup associated
	_llayer : null,
	//list of elements presents in this layer
	_elements : new Array(),
	
	//function that add an element to this layer
	addElement : function( elem ){
		
		this._elements.push( elem );
		this._llayer.addLayer( elem );
		//we need to add here the correct listener to the element
		//so we don't need to do it directly in the editor
		
	},
	
	//function to remove an element from this layer
	removeElement : function( elem ){
		
		arrayUnset(this._elements, elem);
		this._llayer.removeLayer( elem );
		
	},
	
	//function to remove an element using his index on the array of elements of this layer
	removeElementByIndex : function( elem_index ){
		
		var element = this._elements[elem_index];
		this.removeElement( element );
	},
	
	//function to remove all the elements of this layer
	removeAllElements : function(){
		
		this._elements = new Array();
		this._llayer.clearLayers();
	},
	
	//function to get a particular element on this layer
	getElement : function( elem_index ){
		
		return this._elements[elem_index];
	},
	
	//function that return all the elements on this layer (array)
	getElements : function(){
		return this._elements;
	},
	//return the leaflet layer associated to this 'layer'
	getLeafletLayer : function(){
		return this._llayer;
	},
	//return the name of the layer
	getName : function(){
		return this._name;
	},
	//return the description of the layer
	getDescription : function(){
		return this._desc;
	}
	
}

//Function to create a layer with a name, a description and a leaflet Layer
//if there is no leaflet layer, it automatically create an empty leaflet LayerGroup
Layer.createLayer = function( name, desc, llayer ){
	var l = new Layer();
	l._name = name;
	l._description = desc;
	l._llayer = L.LayerGroup();
	if(llayer)l._llayer.addLayer(llayer);
	return l;
}

//Function that create a layer with a name and a description using a geoJSON Object
//The function create A LayerGroup and add to it the geoJSON Layer corresponding to geoJSON Object in parameter
//Parameter f_style : a function that will describe 
Layer.createLayerFromGeoJSON = function( name, desc, geoJSON_object, jsondata_style ){
	
	var layer = Layer.createLayer(name, desc);
	var llayer = L.geoJSON(geoJSON_object, {onEachFeature : _onEachFeature, style : _geoJSONStyle});
	
	llayer.onEachLayer(function ( layer ){
		layer.addElement( layer );
	});
	
	return layer;
	
}

//private function which will be called when we create a layer using geoJSON data to add correct listeners to each features
//should never be called directly
function _onEachFeature(feature, layer){
	
	if(feature.geometry == 'Point'){/*add the correct listener*/}
	if(feature.geometry == 'MultiPoint'){/*add the correct listener*/}
	if(feature.geometry == 'LineString'){/*add the correct listener*/}
	if(feature.geometry == 'MultiLineString'){/*add the correct listener*/}
	if(feature.geometry == 'Polygon'){/*add the correct listener*/}
	if(feature.geometry == 'MultiPolygon'){/*add the correct listener*/}
	
}
//private function that modify style of each feature of a geoJSON layer
//Should never be called directly
function _geoJSONStyle( feature ){}

/*#################################################################################################################################################*/

//Function that allow to read a file that contains json data relative to 'style' (color, stroke, opacity, ...)
//return an object containing style properties
function _loadStyle( jsondata_style ){}


//Describe every elements on the map
//it contains several properties and also the leaflet layer associated (because leaflet elements like markers, polygon etc... are also layers)
var Element = function(){};
Element.prototype = {

	//name of the element
	_name : null,
	//description of the element
	_desc : null,
	//properties of the element (json like e.g : _properties.color = 'red')
	_properties : null,
	//the leaflet layer associated (e.g : Marker, Polyline, Polygon, ...)
	_lelement : null,
	
	//return the name of this element
	getName : function(){
		return this._name;
	}
	//return the description of this element
	getDescription : function(){
		return this._desc;
	}
	
	//return the properties of this element (json like e.g : _properties.color = 'red')
	getProperties : function(){
		return this._properties;
	}
	//return the associated Leaflet layer to this element
	getLeafletElement : function(){
		return this._lelement;
	}
	
}
// City prototype
// var City = function(){};
// City.prototype = {

	//name of the city
	// _name : null,
	//x position
	// _xpos : null, 
	//y position
	// _ypos : null,
	
	//function to transduce the city into XML
	// toXML : function(){
	
		// var xml = ident(3)+"<city>\n";
		// xml += ident(4)+"<name>"+this._name+"</name>\n";
		// xml += ident(4)+"<xpos>"+this._xpos+"</xpos>\n";
		// xml += ident(4)+"<ypos>"+this._ypos+"</ypos>\n";
		// xml += ident(3)+"</city>\n";
		// return xml;
	// }
// }
//Function to create a new City with a name and a position (x and y)
// City.createCity = function(name, xpos, ypos){
	// var c = new City();
	// c._name = name;
	// c._xpos = xpos;
	// c._ypos = ypos;
	// return c;
// }

//Country prototype
// var Country = function(){};
// Country.prototype = {

	//name of the country
	// _name : null,
	//the border of the country (succesion of points : 5,2;5,3;5,4; ...)
	// _path : null,
	
	//Function to transduce the country into xml
	// toXML : function(){
	
		// var xml = ident(3)+"<country>\n";
		// xml += ident(4)+"<name>"+this._name+"</name>\n";
		// xml += ident(4)+"<path>"+this._xpos+"</path>\n";
		// xml += ident(3)+"</country>\n";
		
		// return xml;
		
	// }
// }
//Function that create a country with a name and borders
// Country.createCountry = function( name, path ){
	// var c = new Country();
	// c._name = name;
	// c._path = path;
	// return c;
// }