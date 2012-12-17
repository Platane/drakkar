
//just ignore the line above
//java -jar jsrun.jar app\run.js -a -t=templates\jsdoc D:\workspace\Historical-map-enhanced-authoring-tool\Leaflet_Engine\lib\leafletEngine.js -d=D:\workspace\Historical-map-enhanced-authoring-tool\Leaflet_Engine\doc

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
	//properties of this map
	_properties : null,
	//list of layers on this map
	_layers : new Array(),
	
	
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
	 * @param {Number} layer_index Index of the layer
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
	 * @param {Number} layer_index The index of the layer to get
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
	},
	
	
	/**
	 *Return this map in geoJSON format
	 *Actually, a map is an Array of GeoJSON objects.
	 *@returns {geoJSON} this map in a geoJSON format
	 */
	saveAsGeoJSON : function(){
		var geojson = new Array();
		
		for(i = 0;i<this.getLayers().length;i++){
			geojson.push(this.getLayer(i).saveAsGeoJSON());
		}
		return geojson;
	}
	
}

/**
 *Create a map with a name, a description, the div id where to put it and some options
 * @see <a href="http://leafletjs.com/reference.html#map-options">leaflet map options</a>
 * @param {String|HTMLElement} div_id The div id of the html element, or the html element itself where to put this map
 * @param {<a href="http://leafletjs.com/reference.html#map-options">Map_Options</a>} leaflet_map_options Options for the map
 * @param {String} name The name of the map
 * @param {String} desc A description of the map
 * @returns {Map} A map with a name, a description and some options (when this function is 
 * 	called the map will be automatically drawn on the specified html element) 
 */
Map.createMap = function( div_id, leaflet_map_options, name, desc  ){
	var m = new Map();
	m._lmap = new L.Map(div_id, leaflet_map_options);
	if(typeof(name) == 'undefined' || name == null)m.setName("Map");
	else m.setName(name);
	if(typeof(desc) == 'undefined' || desc == null)m.setDescription("");
	else m.setDescription(desc);
	return m;
}

/**
 *Create a map using a geoJSON object
 *the geoJSON object must be an Array of geoJSON object
 * @param {String} div_id The div id of the html element where to put this map
 * @param {<a href="http://leafletjs.com/reference.html#map-options">Map_Options</a>} leaflet_map_options Options for the map
 * @param {<a href="http://geojson.org/geojson-spec.html">GeoJSON[]</a>} geoJSON_objects An array of geoJSON objects
 * @param {String} name The name of the map
 * @param {String} desc A description of the map
 * @returns {Map} A map with a name, a description and some options (when this function is 
 * 	called the map will be automatically drawn on the specified html element)
 * @throws {InvalidGeoJSONObject} if the geoJSON object is not an Array it can't be read to be converted as a Map
 */
Map.createMapFromGeoJSON = function(div_id, leaflet_map_options, geoJSON_objects, name, desc ){
	
	var map = Map.createMap(name, desc, div_id, leaflet_map_options);
	if(geoJSON_objects instanceof Array){
		for(i = 0;i<geoJSON_objects.length;i++){
			var layer = Layer.createLayerFromGeoJSON(geoJSON_objects[i]);
			map.addLayer(layer);
		}
	}
	else throw 'invalid geoJSON object. Should be an Array';
};

/**@class Prototype for designing layers. Layers are objects that allows to regroup several Elements.
 **Layers should not contains another layers.
 */
var Layer = function(){};
Layer._i = 0;
Layer.prototype = {

	//properties of this layer. Its an object containing each property as an attribute
	_properties : null,
	//Style properties of this layer. Its an object containg each style property as an attribute
	_style : null,
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
	 * @param {Number} elem_index The index of the Element to remove
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
	 * @param {Number} elem_index The index of the Element to get
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
	 *Add a property to this layer
	 *If the property already exists his value is overwrited with the new one
	 *@param {String} name the name of the property to add
	 *@param {Object} value the value of the property to add
	 */
	addProperty : function( name, value ){
		this._properties[name] = value;	
	},
	
	/**
	 *Return the value of the specified property on this layer
	 *If the property doesn't exist, 'undefined' is returned
	 *@param {String} name the name of the property to get
	 *@returns {Object} the value of the specified property on this layer or null if it doesn't exist
	 */
	getProperty : function ( name ){
		return this._properties[name];
	},
	
	/**
	 *Delete the specified property on this layer.
	 *@param {String} name the name of the property to delete
	 *@returns {Boolean} true if the specified property has been removed. False if the property doesn't exist
	 */
	removeProperty : function( name ){
		if(typeof(this._properties[name]) != 'undefined'){
			delete this._properties[name];
			return true;
		}
		else return false;
	},
	
	/**
	 *Return the properties existing on this layer. These properties are contained in an object as its attributes
	 *i.e : var properties = layer.getProperties();
	 *	for(prop in properties)alert(prop+" : "+properties[prop]);
	 *@returns {Object} an object containing properties.
	 */
	getProperties : function(){
		return this._properties;
	},
	
	/**
	 *Set the properties of this layer with the specified properties object
	 *@param {Object} properties the new properties
	 */
	setProperties : function( properties ){
		this._properties = properties;
	},
	
	/**
	 *Return this layer in geoJSON format
	 *@returns {geoJSON} this layer in a geoJSON format
	 */
	saveAsGeoJSON : function(){
		var geojson;
		var features = [];
		for(i = 0;this.getElements.length;i++){
			features.push(this.getElement(i));
		}
		
		geojson.type = "FeatureCollection";
		
		geojson.properties = this.getProperties();
		geojson.features = features;
		
		return geojson;
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
	l.setProperties(new Object());
	if(name && name != null && typeof(name) != 'undefined' && Util.trim(name) != "")l.addProperty("name", name);
	else l.addProperty("name", "Layer#"+Layer._i++);
	if(desc && desc != null && typeof(desc) != 'undefined' && Util.trim(desc) != "")l.addProperty("desc", desc);
	l._llayer = new L.LayerGroup();
	return l;
}

/**
 *Create a new Layer from a valid GeoJSON Object.
 *A valid geoJSON Object for a layer must contains a "features" attribute
 * @param {<a href="http://geojson.org/geojson-spec.html">GeoJSON</a>} geoJSON_object The GeoJSON object to read. It must contain
 * a property "type" with the value "FeatureCollection" and the property "features"
 * @returns {Layer} The layer created
 * @throws {InvalidGeoJSONObject} When the geoJSON object is invalid. 
 */
Layer.createLayerFromGeoJSON = function(geoJSON_object){
	
	var layer = Layer.createLayer();
	
	//if geojson object is a collection of features (=> if the geojson object is a layer) 
	if(geoJSON_object.type == "FeatureCollection" && geoJSON_object.features){
		//if properties is defined
		if(geoJSON_object.properties){
			layer.setProperties(geoJSON_object.properties);
		}
		
		var llayer = L.geoJSON(geoJSON_object, {onEachFeature : function(feature, layer){
			
				var type;
				if(feature.geometry == 'Point'){type = Element.geometry.POINT;}	
				if(feature.geometry == 'MultiPoint'){type = Element.geometry.MULTIPOINT;}
				if(feature.geometry == 'LineString'){type = Element.geometry.LINE;}
				if(feature.geometry == 'MultiLineString'){type = Element.geometry.MULTILINE;}
				if(feature.geometry == 'Polygon'){type = Element.geometry.POLYGON;}
				if(feature.geometry == 'MultiPolygon'){type = Element.geometry.MULTIPOLYGON;}
				
				var element = Element.createElementFromLeafletLayer(feature.properties.name, feature.properties.description, type, layer);
				layer.addElement(element);
			}
		});
	}
	else throw 'Invalid GeoJSON object. Should contains "features" property and "type" property with "FeatureCollection" value';
	//TODO : test what happens if the geojson object is invalid or unrecognized
	return layer;
	
}

/**
 *@class Prototype for designing Elements. Elements are object that can be added to a layer, and which can be displayed on the map.
 * Elements object are containers for leaflet layers objects like Marker, Line, PolyLine, Polygon, etc...
 * An Element object should only contains leaflet vector layers and leaflet Markers. Other layers are not supported and are not considered as Element.
 * <b>Leaflet Vector Layers objects</b> are defined <a href="http://leafletjs.com/reference.html#path">here</a>
 * <b>Marker leaflet object</b> is defined <a href="http://leafletjs.com/reference.html#marker">here</a>
 * 
 */
var Element = function(){};
Element._i = 0;
Element.prototype = {
	
	//properties of the element (json like e.g : _properties.color = 'red')
	_properties : null,
	//style properties of this element
	_style : null,
	//the type of the element (point, line, polylin, polygon, ...)
	_type : null,
	//the leaflet layer associated (e.g : Marker, Polyline, Polygon, ...)
	_lelement : null,
	
	/**
	 *Returns the geometry type of this Element
	 *@returns {Element.geometry} The geometry type of this Element
	 */
	getType : function(){
		return this._type;
	},
	
		
	/**
	 *Return the leaflet ILayer associated to this Element
	 * @see <a href="http://leafletjs.com/reference.html#path">Leaflet Vector layers</a>
	 * @returns {<a href="http://leafletjs.com/reference.html#ilayer">ILayer</a>} the leaflet layer associated 
	 */
	getLeafletElement : function(){
		return this._lelement;
	},
	
	/**
	 *Add a property to this Element
	 *If the property already exists his value is overwrited with the new one
	 *@param {String} name the name of the property to add
	 *@param {Object} value the value of the property to add
	 */
	addProperty : function( name, value ){
		this._properties[name] = value;	
	},
	
	/**
	 *Return the value of the specified property on this Element
	 *If the property doesn't exist, 'undefined' is returned
	 *@param {String} name the name of the property to get
	 *@returns {Object} the value of the specified property on this layer or null if it doesn't exist
	 */
	getProperty : function ( name ){
		return this._properties[name];
	},
	
	/**
	 *Delete the specified property on this Element.
	 *@param {String} name the name of the property to delete
	 *@returns {Boolean} true if the specified property has been removed. False if the property doesn't exist
	 */
	removeProperty : function( name ){
		if(typeof(this._properties[name]) != 'undefined'){
			delete this._properties[name];
			return true;
		}
		else return false;
	},
	
	/**
	 *Return the properties existing on this Element. These properties are contained in an object as its attributes
	 *i.e : var properties = layer.getProperties();
	 *	for(prop in properties)alert(prop+" : "+properties[prop]);
	 *@returns {Object} an object containing properties.
	 */
	getProperties : function(){
		return this._properties;
	},
	
	/**
	 *Set the properties of this Element with the specified properties object
	 *@param {Object} properties the new properties
	 */
	setProperties : function( properties ){
		this._properties = properties;
	},
	
	/**
	 *Return this Element in geoJSON format
	 *@returns {geoJSON} this Element in a geoJSON format
	 */
	saveAsGeoJSON : function(){
		
		var geojson = new Object();
		geojson.type = "Feature";
		geojson.properties = this.getProperties();
		geojson.geometry = new Object();
		geojson.geometry.type = this.getType();
		
		var coordinates = [];
		
		if(this.getType() == Element.geometry.POINT){
			coordinates.push(this._lelement.getLatLng().lat);
			coordinates.push(this._lelement.getLatLng().lng);
		}
		if(this.getType() == Element.geometry.MULTIPOINT){
			this._lelement.forEachLayer(function(layer){
				var point = Util.latLngToArray(layer.getLatLng());
				coordinates.push(point);
			});
		}
		if(this.getType() == Element.geometry.LINE){
			var coords = this._lelement.getLatLngs();
			for(i=0;i<coords.length;i++){
				var point = Util.latLngToArray(coords[i].getLatLng());
				coordinates.push(point);
			}
		}
		if(this.getType() == Element.geometry.MULTILINE){
			this._lelement.forEachLayer(function(layer){
				var linecoords = [];
				var line = layer.getLatLngs();
				for(i = 0;i<line.length;i++){
					var point = Util.latLngToArray(line[i].getLatLng());
					linecoords.push(point);
				}
				coordinates.push(linecoords);
			});
		}
		if(this.getType() == Element.geometry.POLYGON){
			var coords = this._lelement.getLatLngs();
			var temp = [];
			for(i=0;i<coords.length;i++){
				var point = Util.latLngToArray(coords[i].getLatLng());
				temp.push(point);
			}
			coordinates.push(temp);
		}
		if(this.getType() == Element.geometry.MULTIPOLYGON){
			this._lelement.forEachLayer(function(layer){
				var polycoords = [];
				var temp = [];
				var poly = layer.getLatLngs();
				for(i = 0;i<poly.length;i++){
					var point = Util.latLngToArray(line[i].getLatLng());
					temp.push(point);
				}
				polycoords.push(temp);
				coordinates.push(polycoords);
			});
		}
		
		
		
		geojson.geometry.coordinates = coordinates;
		
		return geojson;
	}

	
};

/**
 *Create an abstract Element with just a name and a description
 *This Constructor should never be used directly
 */
Element._createAbstractElement = function( name, desc ){
	var elem = new Element();
	elem.setProperties(new Object());
	if(name && name != null && typeof(name) != 'undefined' && Util.trim(name) != "")elem.addProperty("name", name);
	else elem.addProperty("name", "Element#"+Element._i++);
	if(desc && desc != null && typeof(desc) != 'undefined' && Util.trim(desc) != "")elem.addProperty("desc", desc);
	return elem;
}

/**
 * Create an Element from an existing leaflet Layer
 * @param {Element.geometry} type the type of this Element
 * @param {http://leafletjs.com/reference.html#ilayer>ILayer</a>} lelement the leaflet layer associated
 * @param {String} name the name of this Element
 * @param {String} desc description of this Element
 * @returns {Element} a new Element corresponding to the leaflet Layer in parameters
 */
Element._createElementFromLeafletLayer = function(type, lelement, name, desc ){
	
	var elem = Element._createAbstractElement(name, desc);
	elem._type = type;
	elem._lelement = lelement;
	return elem;
}
/**
 *Create a new Point Element with a name, a description and some options at the specified location (lat long)
 *@param {<a href="http://leafletjs.com/reference.html#latlng">L.LatLng</a>} latlng Position of the Element on the map (latitude - longitude)
 *@param {<a href="http://leafletjs.com/reference.html#marker-options">L.Marker_options</a>} leaflet_marker_options Options for Point Element
 *@param {String} name name of the Element
 *@param {String} desc description of the Element
 
 *@returns {Element} A Point Element
 */
Element.createPoint = function(latlng, leaflet_marker_options, name, desc ){
	var elem = Element._createAbstractElement(name, desc);
	elem._lelement = new L.Marker(latlng, leaflet_marker_options);
	elem._type = Element.geometry.POINT;
	return elem;
};

/**
 *Create a new MultiPoint Element with a name, a description and some options at the specified location (lat long)
 *@param {<a href="http://leafletjs.com/reference.html#latlng">L.LatLng[]</a>} latslngs Position of the Element on the map (latitude - longitude)
 *@param {<a href="http://leafletjs.com/reference.html#marker-options">L.Marker_options</a>} leaflet_marker_options Options for Point Element
 *@param {String} name name of the Element
 *@param {String} desc description of the Element
 *@returns {Element} A MultiPoint Element
 */
Element.createMultiPoint = function(latslngs, leaflet_marker_options, name, desc ){
	var elem = Element._createAbstractElement(name, desc);
	elements = [];
	for(i = 0;i<latslngs.length;i++){
		elements.push(new L.Marker(latslngs[i], leaflet_marker_options));
	}
	elem._lelement = new L.FeatureGroup(elements);
	elem._type = Element.geometry.MULTIPOINT;
	return elem;
};

/**
 *Create a new Line Element with a name, a description and some options with the specified coordinates (lat long coordinates)
 *@param {<a href="http://leafletjs.com/reference.html#latlng">L.LatLng[]</a>} latslngs Positions of the Element on the map (latitude - longitude)
 *@param {<a href="http://leafletjs.com/reference.html#polyline-options">L.Polyline_options</a>} leaflet_line_options Options for Line Element
 *@param {String} name the name of the Element
 *@param {String} desc description of the Element
 *@returns {Element} A Line Element
 */
Element.createLine = function( latslngs, leaflet_line_options, name, desc){
	var elem = Element._createAbstractElement(name, desc);
	elem._lelement = new L.Polyline(latslngs, leaflet_line_options);
	elem._type = Element.geometry.LINE;
	return elem;
};

/**
 *Create a new MultiLine Element with a name, a description and some options with the specified coordinates (lat long coordinates)
 *@param {<a href="http://leafletjs.com/reference.html#latlng">L.LatLng[][]</a>} latslngs Positions of the Element on the map (latitude - longitude)
 *@param {<a href="http://leafletjs.com/reference.html#polyline-options">L.Polyline_options</a>} leaflet_line_options Options for Line Element
*@param {String} name the name of the Element
 *@param {String} desc description of the Element
 *@returns {Element} A MultiLine Element
 */
Element.createMultiLine = function(latslngs, leaflet_line_options, name, desc ){
	var elem = Element._createAbstractElement(name, desc);
	elem._lelement = new L.MultiPolyline(latslngs, leaflet_line_options);
	elem._type = Element.geometry.MULTILINE;
	return elem;
};

/**
 *Create a new Polygon Element with a name, a description and some options with the specified coordinates (lat long coordinates)
 *if there is only two latslngs coordinates in the array in parameter, a rectangle will be created
 *@param {<a href="http://leafletjs.com/reference.html#latlng">L.LatLng[]</a>} latlng Positions of the Element on the map (latitude - longitude)
 *@param {<a href="http://leafletjs.com/reference.html#polyline-options">L.Polyline_options</a>} leaflet_polygon_options Options for Polygon Element
 *@param {String} name the name of the Element
 *@param {String} desc description of the Element
 *@returns {Element} A Polygon Element
 */
Element.createPolygon = function( latslngs, leaflet_polygon_options, name, desc ){
	var elem = Element._createAbstractElement(name, desc);
	if(latslngs.length == 2){
		elem._lelement = new L.Rectangle(new L.LatLngBounds(latslngs), leaflet_polygon_options);
	}
	else{
		elem._lelement = new L.Polygon(latslngs, leaflet_polygon_options);
	}
	elem._type = Element.geometry.POLYGON;
	return elem;
};

/**
 *Create a new MultiPolygon Element with a name, a description and some options with the specified coordinates (lat long coordinates)
 *@param {<a href="http://leafletjs.com/reference.html#latlng">L.LatLng[][]</a>} latlng Positions of the Element on the map (latitude - longitude)
 *@param {<a href="http://leafletjs.com/reference.html#polyline-options">L.Polyline_options</a>} leaflet_polygon_options Options for Polygon Element
 *@param {String} name the name of the Element
 *@param {String} desc description of the Element
 *@returns {Element} A Polygon Element
 */

Element.createMultiPolygon = function(latslngs, leaflet_polygon_options, name, desc){
	var elem = Element._createAbstractElement(name, desc);
	elem._lelement = new L.MultiPolygon(latslngs, leaflet_polygon_options);
	elem._type = Element.geometry.MULTIPOLYGON;
	return elem;
}

/**
 * @enum Regroup the different possible type of geometry for Elements
 */
Element.geometry= {
		POINT : "Point",
		MULTIPOINT : "MultiPoint",
		LINE : "LineString",
		MULTILINE : "MultiLineString",
		POLYGON : "Polygon",
		MULTIPOLYGON : "MultiPolygon"
	};


var Style = function(){};
Style.prototype

/**
 *@namespace Namespace for utility functions
 */
var Util = function(){};

/**
 *Get an Array containing latitude and longitude of a latLng leaflet object
 *@param {<a href="http://leafletjs.com/reference.html#latlng">L.LatLng</a>} latLng the LatLng leaflet object
 *@returns {Number[]} an Array containing latitude and longitude of the leaflet object
 */
Util.latLngToArray = function(latLng){
	var array = [];
	array.push(latLng.lat);
	array.push(latLng.lng);
	return array;
}

/**
 *Remove the leading and trailing whitespaces (tabulations or backspaces) of the specified String
 *@param {String} word the String to trim
 *@returns {String} a new String without leading and trailing whitespaces
 */
Util.trim = function( word ){
	var nword = word.replace(/^\s+|\s+$/g, "");
	nword = word.replace(/^\t+|\t+$/g, "");
	nword = word.replace(/^\n+|\n+$/g, "");
	return nword;
}
