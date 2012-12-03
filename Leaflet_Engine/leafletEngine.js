
/**  @class Prototype for designing the Map
 *
 */
var Map = function(){}
Map.prototype = {

	//the leaflet map
	_lmap : null,
	//name of the map
	_name : null,
	//description
	_desc : null, 
	//list of layers on this map
	_layers : new Array(),
	mp : null,
	
	/** Create a layer, add it to the map and return it
	 *@param {String} name The name of the layer
	 *@param {String} desc A description of the layer
	 *@returns {Layer} The layer created and added to the map
	 */
	createLayer : function( name, desc ){
		var layer = Layer.createLayer(name, desc);
		this.addLayer(layer);
		return layer;
	},
	
	/** Add a layer to this map
	 *@param {Layer} layer the layer to add 
	 */
	addLayer : function( layer ){
	
		this._layers.push(layer);
		layer._llayer.addTo(this._lmap);
	},
	
	/**
	 *Remove a layer from this map
	 * @param {Layer} layer the layer to remove 
	 */
	removeLayer : function( layer ){
		
		arrayUnset(this._layers, layer);
		this._lmap.removeLayer( layer._llayer );
	},
	
	/**
	 *Remove a layer from this map using his index number
	 * @param {int} layer_index Index of the layer
	 * @returns {Layer} the layer removed
	 */
	removeLayerByIndex : function( layer_index ){
		
		var layer = this._layers[layer_index];
		this.removeLayer( layer );
		return layer;
	},
	
	/**
	 *Remove all the layers from this map 
	 */
	removeAllLayers : function(){
		
		for(var i = 0; i< this._layers.length;i++){
			this._lmap.removeLayer( layer );
		}
		this._layers = new Array();
		
	},
	
	/**
	 *Return the layer at the specified index
	 * @param {int} layer_index The index of the layer to get
	 * @returns {Layer} The layer at the specified index
	 */
	getLayer : function( layer_index ){
		
		return this._layers[layer_index];
	},
	
	/**
	 *Returns all the layers on this map
	 * @returns {Layer[]} all the layers on this map
	 */
	getLayers : function(){
		return this._layers;
	},
	
	/**
	 * Set the Layers of this map with the specified array of Layers
	 * @param {Layer[]} layers The array of Layers
	 */
	setLayers : function( layers ){
		
		this._layers = layers;
	},
	
	/**
	 *Return the leaflet map object associated to this Map
	 * @see <a href="http://leafletjs.com/reference.html#map-constructor">Leaflet Map Object</a>
	 * @returns {<a href="http://leafletjs.com/reference.html#map-constructor">L.Map</a>} The leaflet map object associated 
	 */
	getLeafletMap : function(){
		return this._lmap;
	},
	
	/**
	 *Return the name of this map
	 * @returns {String} the name of this map 
	 */
	getName : function(){
		return this._name;
	},
	
	/**
	 *Change the name of this map
	 * @param {String} name New name 
	 */
	setName : function( name ){
		this._name = name;
	},
	/**
	 *Return the description of the map
	 * @returns {String} the description of the map 
	 */
	getDescription : function(){
		return this._desc;
	},
	
	/**
	 *Change the description of this map
	 * @param {String} desc New Description 
	 */
	setDescription : function( desc ){
		this._desc = desc;
	}
	
}

/**
 *Create a map with a name, a description, the div id where to put it and some options
 * @see <a href="http://leafletjs.com/reference.html#map-options">leaflet map options</a>
 * @param {String} name The name of the map
 * @param {String} desc A description of the map
 * @param {String} div_id The div id of the html element where to put this map
 * @param {<a href="http://leafletjs.com/reference.html#map-options">Map_Options</a>} leaflet_map_options Options for the map
 * @returns {Map} A map with a name, a description and some options (when this function is 
 * 	called the map will be automatically drawn on the specified html element) 
 */
Map.createMap = function( name, desc, div_id, leaflet_map_options ){
	var m = new Map();
	m._lmap = new L.Map(div_id, leaflet_map_options);
	m._name = name;
	m._description = desc;
	return m;
}

/**@class Prototype for designing layers. Layers are objects that allows to regroup several Elements.
 **Layers should not contains another layers.
 */
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
	
	/**
	 *Add an element to this Layer
	 * @param {Element} elem The element to add.  
	 */
	addElement : function( elem ){
		
		this._elements.push( elem );
		this._llayer.addLayer( elem );
		//TODO : Add the listeners
		
		
	},
	
	/**
	 *Remove an element from this Layer
	 * @param {Element} elem The element to remove 
	 */
	removeElement : function( elem ){
		
		arrayUnset(this._elements, elem);
		this._llayer.removeLayer( elem );
		
	},
	
	/**
	 *Remove an element at the specified index from this layer
	 * @param {int} elem_index The index of the Element to remove
	 * @returns {Element} The Element removed 
	 */
	removeElementByIndex : function( elem_index ){
		
		var element = this._elements[elem_index];
		this.removeElement( element );
		return element;
	},
	
	/**
	 *Remove all Elements from this Layer 
	 */
	removeAllElements : function(){
		
		this._elements = new Array();
		this._llayer.clearLayers();
	},
	
	/**
	 *Return the Element at the specified index
	 * @param {int} elem_index The index of the Element to get
	 * @returns {Element} The element at the specified index of this Layer 
	 */
	getElement : function( elem_index ){
		
		return this._elements[elem_index];
	},
	
	/**
	 *Return all the Elements of this Layer
	 * @returns {Element[]} Elements of this layer 
	 */
	getElements : function(){
		return this._elements;
	},
	
	/**
	 *Set all the Elements of this Layer with the specified array of Elements
	 * @param {Element[]} elems The array of Elements 
	 */
	setElements : function( elems ){
		this._elements = elems;
	},
	
	/**
	 *Return the leaflet Layer Group object associated to this Layer
	 * @see <a href="http://leafletjs.com/reference.html#layergroup">Leaflet layer group object</a>
	 * @returns {<a href="http://leafletjs.com/reference.html#layergroup">L.LayerGroup</a>} The leaflet ILayer object associated
	 */
	getLeafletLayer : function(){
		return this._llayer;
	},
	
	/**
	 *Return the name of this Layer
	 * @returns {String} The name of this Layer 
	 */
	getName : function(){
		return this._name;
	},
	
	/**
	 *Return the description of this Layer
	 * @returns {String} The description of this Layer 
	 */
	getDescription : function(){
		return this._desc;
	},
	
	/**
	 *Change the name of this Layer
	 * @param {String} name New name 
	 */
	setName : function( name ){
		this._name = name;
	},
	
	/**
	 *Change the description of this Layer
	 * @param {String} desc New Description 
	 */
	setDescription : function( desc ){
		this._desc = desc;
	}
	
}

/**
 *Create a new Layer
 * @param {String} name The name of the Layer
 * @param {String} desc a description of the Layer 
 * @returns {Layer} The Layer created 
 */
Layer.createLayer = function( name, desc ){
	var l = new Layer();
	l._name = name;
	l._description = desc;
	l._llayer = L.LayerGroup();
	return l;
}

/**
 *Create a new Layer from a valid GeoJSON Object
 * @param {String} name The name of the Layer
 * @param {String} desc A description of the Layer
 * @param {<a href="http://geojson.org/geojson-spec.html">GeoJSON</a>} geoJSON_object The GeoJSON object to read
 * @returns {Layer} The layer created
 */
Layer.createLayerFromGeoJSON = function( name, desc, geoJSON_object){
	
	var layer = Layer.createLayer(name, desc);
	var llayer = L.geoJSON(geoJSON_object, {onEachFeature : _onEachFeature, style : _geoJSONStyle});
	
	llayer.onEachLayer(function ( layer ){
		layer.addElement( layer );
	});
	//TODO : test what happens if the geojson object is invalid or unrecognized
	return layer;
	
}

/**
 *@ignore 
 */
function _onEachFeature(feature, layer){
	
	if(feature.geometry == 'Point'){/*add the correct listener*/}
	if(feature.geometry == 'MultiPoint'){/*add the correct listener*/}
	if(feature.geometry == 'LineString'){/*add the correct listener*/}
	if(feature.geometry == 'MultiLineString'){/*add the correct listener*/}
	if(feature.geometry == 'Polygon'){/*add the correct listener*/}
	if(feature.geometry == 'MultiPolygon'){/*add the correct listener*/}
	
}

/**
 *@ignore 
 */
function _geoJSONStyle( feature ){}


/**
 *@ignore 
 * @param {Object} jsondata_style
 */
function _loadStyle( jsondata_style ){}


/**
 *@class Prototype for designing Elements. Elements are object that can be added to a layer, and which can be displayed on the map.
 * Elements object are containers for leaflet Vector layers objects like Marker, Line, PolyLine, Polygon, etc...
 * An Element object SHOULD NOT contains something else than Vector Layers
 * <b>Leaflet Vector Layers objects</b> are defined <a href="http://leafletjs.com/reference.html#path">here</a>
 * 
 */
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
	
	/**
	 *Return the name of this Element
	 * @returns {String} the name of this Element 
	 */
	getName : function(){
		return this._name;
	},
	
	/**
	 *Return the description of this Element
	 * @returns {String} the description of this Element 
	 */
	getDescription : function(){
		return this._desc;
	},
	
	/**
	 *Change the name of this Element
	 * @param {String} name New name 
	 */
	setName : function( name ){
		this._name = name;
	},
	
	/**
	 *Change the description of this Element
	 * @param {String} desc New Description 
	 */
	setDescription : function( desc ){
		this._desc = desc;
	},
	
	/**
	 *@ignore 
	 * return the properties of this element (json like e.g : _properties.color = 'red')
	 */
	getProperties : function(){
		return this._properties;
	},
	
	/**
	 *Return the leaflet ILayer associated to this Element
	 * @see <a href="http://leafletjs.com/reference.html#path">Leaflet Vector layers</a>
	 * @returns {<a href="http://leafletjs.com/reference.html#path">L.Path</a>} the leaflet Vector layer associated 
	 */
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

