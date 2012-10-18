
//enum for the different types of layers
var ELEMENT_DOT = 0,
	ELEMENT_PATH = 1;

//function that return a certain amount of tabulation ( \t ) depending on the parameter "times"
function ident( times ){

	var ident = "";
	
	for(var x = 0;x<times;x++){
		ident += "\t";
	}
	
	return ident;
}

//Map prototype
var Map = function(){};
Map.prototype = {

	//name of the map
	_name : null,
	//description
	_description : null, 
	//list of layers on this map
	_layers : new Array(),
	
	//function to add a layer to this map
	addLayer : function( layer ){
	
		this._layers.push(layer);
	},
	
	//function to remove a layer from this map
	removeLayer : function( layer ){
		
		arrayUnset(this._layers, layer);
	},
	
	//function to remove a layer using his index on the array of layers of this map
	removeLayerByIndex : function( layer_index ){
		
		delete this._layers[layer_index];
	},
	
	//function to remove all the layers of this map
	removeAllLayers : function(){
		
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
	
	//function to transduce the map into XML
	toXML : function(){
		
		var xml = "<map>\n";
		xml += ident(1)+"<name>"+this._name+"</name>\n";
		xml += ident(1)+"<description>"+this._description+"</description>\n";
		xml += ident(1)+"<layers>\n";
		
		for( var i = 0 ; i < this._layers.length; i++ ){
			xml += this._layers[i].toXML();
		}
		
		xml += ident(1)+"</layers>\n";
		xml += "</map>";
		
		return xml;
	}
	
}
//Function to create a new map with a name and a description
Map.createMap = function( name, desc ){
	var m = new Map();
	m._name = name;
	m._description = desc;
	return m;
}

//City prototype
var City = function(){};
City.prototype = {

	//name of the city
	_name : null,
	//x position
	_xpos : null, 
	//y position
	_ypos : null,
	
	//function to transduce the city into XML
	toXML : function(){
	
		var xml = ident(3)+"<city>\n";
		xml += ident(4)+"<name>"+this._name+"</name>\n";
		xml += ident(4)+"<xpos>"+this._xpos+"</xpos>\n";
		xml += ident(4)+"<ypos>"+this._ypos+"</ypos>\n";
		xml += ident(3)+"</city>\n";
		return xml;
	}
}
//Function to create a new City with a name and a position (x and y)
City.createCity = function(name, xpos, ypos){
	var c = new City();
	c._name = name;
	c._xpos = xpos;
	c._ypos = ypos;
	return c;
}

//Country prototype
var Country = function(){};
Country.prototype = {

	//name of the country
	_name : null,
	//the border of the country (succesion of points : 5,2;5,3;5,4; ...)
	_path : null,
	
	//Function to transduce the country into xml
	toXML : function(){
	
		var xml = ident(3)+"<country>\n";
		xml += ident(4)+"<name>"+this._name+"</name>\n";
		xml += ident(4)+"<path>"+this._xpos+"</path>\n";
		xml += ident(3)+"</country>\n";
		
		return xml;
		
	}
}
//Function that create a country with a name and borders
Country.createCountry = function( name, path ){
	var c = new Country();
	c._name = name;
	c._path = path;
	return c;
}

//Layer prototype
var Layer = function(){};
Layer.prototype = {

	//name of the layer
	_name : null,
	//description of the layer (his content)
	_description : null,
	//type of layer (dots or paths)
	_type : null,
	//list of elements presents in this layer
	_elements : new Array(),
	
	//function that add an element to this layer
	addElement : function( elem ){
		
		this._elements.push( elem );		
		
	},
	
	//function to remove an element from this layer
	removeElement : function( elem ){
		
		arrayUnset(this._elements, elem);
	},
	
	//function to remove an element using his index on the array of elements of this layer
	removeElementByIndex : function( elem_index ){
		
		delete this._elements[elem_index];
	},
	
	//function to remove all the elements of this layer
	removeAllElements : function(){
		
		this._elements = new Array();
	},
	
	//function to get a particular element on this layer
	getElement : function( elem_index ){
		
		return this._elements[elem_index];
	},
	
	//function that return all the elements on this layer (array)
	getElements : function(){
		return this._elements;
	},
	
	//Function to transduce this layer into XML
	toXML : function(){
	
		var xml = ident(2)+"<layer>\n";
		xml += ident(3)+"<name>"+this._name+"</name>\n";
		xml += ident(3)+"<description>"+this._description+"</description>\n";
		xml += ident(3)+"<type>"+this._type+"</type>\n";
		xml += ident(3)+"<elements>\n";
		
		for(var i = 0; i < this._elements.length; i++){
			
			xml += this._elements[i].toXML();
		}
		
		xml += ident(3)+"</elements>\n";
		xml += ident(2)+"</layer>\n";
		
		return xml;
	}
}
//Function to create a layer with a name, a description and a type
Layer.createLayer = function( name, desc, type ){
	var l = new Layer();
	l._name = name;
	l._description = desc;
	l._type = type;
	return l;
}

