var extend = function( child , f ){
	for( var p in f )
		child.prototype[ p ] = f[ p ];
	if( !child.prototype.superDad )
		child.prototype.superDad = f;
};

/**  @class Abstract class that can retain several properties. Element that herit from this class can be attach to a style
 *
 */
AbstractAttributeHolder = function(){};
AbstractAttributeHolder.prototype = {
	_attributes : null,
	_classes: null,
	_parent:null,
	type : 0,
	id : null,
	
	removeAttribute:function( attributeName ){
		delete this._attributes[ attributeName ];
	},
	setAttribute:function( attributeName , value ){
		this._attributes[ attributeName ] = value;
	},
	getAttribute:function( attributeName ){
		return this._attributes[ attributeName ];
	},
	
	
	addClass:function( className ){
		this._classes[ className ]=true;
	},
	removeClass:function( className ){
		this._classes[ className ]=null;
		delete this._classes.className;
	},
	hasClass:function( className ){
		return ( this._classes[ className ] ? true : false );
	},
	
	getParent:function(){
		return this._parent;
	},
	
	getName:function(){
		return this.id;
	},
	
	clone:function(){
		var c = new AbstractAttributeHolder();
		c.id = this.id;
		c.type = this.type;
		c._parent = this._parent;
		c._classes = {};
		for( var i in this._classes )
			c._classes[i]=true;
		c._attributes = {};
		for( var i in this._attributes )
			c._attributes[i]=this._attributes[i];
		return c_;
	},
};

/**  @class Element that know how to compute the style chain to apply render effect.
 *
 */
var AbstractElement = function(){};
extend( AbstractElement , AbstractAttributeHolder.prototype );
extend( AbstractElement , {
	_styleChain : null,
	_style : true,
	_dirtyMergedStyle : true,
	
	globalAttrChanged:function(){
		this._dirtyMergedStyle = true;
	},
	getStyle:function( globalAttr ){
		return {};
		if( this._dirtyMergedStyle ){
			this._style = this._interpretStyle( this._mergeStyleChain( globalAttr ));
			this._dirtyMergedStyle = false;
		}
		return this._mergedStyle;
	},
	
	_interpretStyle:function( mergedStyle ){
		/* assuming there is no collision in the mergedStyle */
		var JSONstyle = {};
		for( var p in mergedStyle ){
			var value = mergedStyle[ p ];
			switch( p ){
				case "strocke-width" :
					/* TODO : throw error if the style is not applicable to this item */
					JSONstyle.strocke = true;
					JSONstyle.weight = value;
					if( !JSONstyle.color )
						JSONstyle.color = "#000000";
					if( !JSONstyle.opacity )
						JSONstyle.opacity = "1";
				break;
				case "strocke-opacity" :
					JSONstyle.strocke = true;
					JSONstyle.opacity = value;
					if( !JSONstyle.color )
						JSONstyle.color = "#000000";
					if( !JSONstyle.weight )
						JSONstyle.weight = 1;
				break;
				case "strocke-color" :
					JSONstyle.strocke = true;
					JSONstyle.color = value;
					if( !JSONstyle.opacity )
						JSONstyle.opacity = "1";
					if( !JSONstyle.weight )
						JSONstyle.weight = 1;
				break;
				
				case "fill-opacity" :
					JSONstyle.fill = true;
					JSONstyle.fillOpacity = value;
					if( !JSONstyle.fillColor )
						JSONstyle.fillColor = "#000000";
				break;
				case "fill-color" :
					JSONstyle.fill = true;
					JSONstyle.color = value;
					if( !JSONstyle.fillOpacity )
						JSONstyle.fillOpacity = 1;
				break;
				default : 
					throw 'unknow property "'+p+'" ';
			}
		}
		return JSONstyle;
	},
	_mergeStyleChain:function( globalAttr ){
		var style = {};
		var dec;
		for( var i = 0 ; i < this._styleChain.length ; i ++ ){
			dec = this._styleChain[i];
			if( dec.dynCondition && dec.dynCondition( globalAttr ) || !dec.dynCondition )
				for( var j = 0 ; dec.props.length ; j ++ )
					style[ dec.props[j].name ] = dec.props[j].value;
		}
		return style;
	},
	
	clone:function(){
		var cP = this.superDad.clone();
		var c = new AbstractElement();
		for(var i in cP)
			c[i]=cP[i];
		c._styleChain = new Array(this._styleChain.length);
		for(var i=0;i<this._styleChain.length;i++)
			c._styleChain[i] = this._styleChain[i];
		c._dirtyMergedStyle = true;
		return c;
	},
});

function AbstractNotifier(){};
AbstractNotifier.prototype = {
	_listener : null,
	registerListener : function( update ){
		if( !this._listener )
			this._listener = [];
		if( arguments.length == 2 ){
			if( typeof( arguments[0] ) == "function" && typeof( arguments[1] ) == "object" )
				update = {f:arguments[0] , o:arguments[1]};
			else
			if( typeof( arguments[1] ) == "function" && typeof( arguments[0] ) == "object" )
				update = {f:arguments[1] , o:arguments[0]};
			else
				throw "unknow params";
		}
		if( arguments.length == 1 && !arguments[0].f ){
			update = {f:arguments[0].update , o:arguments[0]};
		}
		this._listener.push( update );
	},
	removeListener : function( update ){
		if( !this._listener )
			this._listener = [];
		if( arguments.length == 0 ){
			this._listener = [];
			return;
		}
		if( arguments.length == 2 || ( arguments.length == 1 && arguments[0].f && arguments[0].o ) ){
			if( arguments.length == 2 ){
				if( typeof( arguments[0] ) == "function" && typeof( arguments[1] ) == "object" )
					update = {f:arguments[0] , o:arguments[1]};
				else
				if( typeof( arguments[1] ) == "function" && typeof( arguments[0] ) == "object" )
					update = {f:arguments[1] , o:arguments[0]};
				else
					throw "unknow params";
			}
			for( var i=0;i<this._listener.length;i++)
				if( this._listener[i].f == update.f && this._listener[i].o == update.o )
					this._listener.splice(i,1);
		}
		if( arguments.length == 1 && typeof( arguments[0] ) == "object" ){
			for( var i=0;i<this._listener.length;i++)
				if( this._listener[i].o == update.o )
					this._listener.splice(i,1);
		}
	},
	notify : function( ){
		if( !this._listener )
			return;
		for( var i=0;i<this._listener.length;i++)
			this._listener[i].f.call( this._listener[i].o , this );
	},
}



var DataMap = function(){};
extend( DataMap , AbstractAttributeHolder.prototype );
extend( DataMap , AbstractNotifier.prototype );
extend( DataMap , {
	_layers : null,
	init:function(){
		this._layers = [];
	},
	addLayer:function( layer , z ){
		z = z || 0;
		this._layers.splice( z , 0 , layer );
		layer._parent = this;
	},
	removeLayer:function( layer ){
		var i = this._getLayerIndex( layer );
		if( i != null )
			this._layers.splice( i , 1 );
	},
	_getLayerIndex:function( layer ){
		var i;
		if( typeof(layer)=="number")
			i=layer;
		if( typeof(layer)=="object" && layer instanceof DataLayer )
			for(i=0;i<this._layers.length;i++)
				if( this._layers[i] == layer )
					break;
		if( typeof(layer)=="string"  )
			for(i=0;i<this._layers.length;i++)
				if( this._layers[i].getName() == layer )
					break;
		if( i==null || i>this._layers.length )
			return null;
		return i;
	},
	getLayer:function(layer){
		var i = this._getLayerIndex( layer );
		if( i != null )
			return this._layers[ i ];
		return null;
	},
	getLayers:function(layer){
		return this._layers;
	},
	placeLayerAt:function( layer , z ){
		var i = this._getLayerIndex( layer );
		if( i == null )
			return ;
		z = Math.max( 0 , Math.min( z , this._layers.length-1 ) );
		var tmp= this._layers.splice( i , 1 )[0];
		this._layers.splice( z , 0 , tmp );
	},
	getJSONformat:function(){
		
	},
	draw:function( lfe ){
		//for( var i=0;i<this._layers.length;i++)
		for( var i=this._layers.length-1;i>=0;i--)
			this._layers[i].draw(lfe);
	},
});
DataMap.create = function( name ){
	var l = new DataMap();
	l.init();
	if( name )
		l.id = name;
	return l;
};

var DataLayer = function(){};
extend( DataLayer , AbstractAttributeHolder.prototype );
extend( DataLayer , {
	_elements : null,
	_hidden : false,
	init:function(){
		this._elements = [];
	},
	_getElementIndex:function( element ){
		var i;
		if( typeof(element)=="number")
			i=element;
		if( typeof(element)=="object"  )
			for(i=0;i<this._elements.length;i++)
				if( this._elements[i] == element )
					break;
		if( typeof(element)=="string"  )
			for(i=0;i<this._elements.length;i++)
				if( this._elements[i].getName() == element )
					break;
		if( i==null || i>this._elements.length )
			return null;
		return i;
	},
	getElements:function(){
		return this._elements;
	},
	getElement:function( element ){
		var i = this._getElementIndex( element );
		if( i != null )
			return this._elements[ i ];
		return null;
	},
	addElement:function( element , z ){
		z = z || 0;
		this._elements.splice( z , 0 , element );
		element._parent = this;
	},
	removeElement:function( element ){
		var i = this._getElementIndex( element );
		if( i != null )
			this._elements.splice( i , 1 );
	},
	draw:function( lfe ){
		if( !this._hidden )
			for( var i=0;i<this._elements.length;i++)
				this._elements[i].draw(lfe);
	},
});
DataLayer.create = function( name ){
	var l = new DataLayer();
	l.init();
	if( name )
		l.id = name;
	return l;
};

var DataPath = function(){};
extend( DataPath, AbstractElement.prototype );
extend( DataPath, {
	_points : null,
	init:function(p){
		this._points = p;
	},
	getJSONformat:function(){
		var JSON = {
			"type" : "Feature",
			"properties" : this.getStyle(),
			"geometry ": {
					"type" : "Polyline",
					"LatLng": this._points,
			},
		};
		return JSON;
	},
	draw:function( lfe ){
		lfe.addLayer( new L.Polygon( this._points , this.getStyle() ) );
	},
	clone:function(){
		var cP = this.superDad.clone();
		var c = new DataPath();
		for(var i in cP)
			c[i]=cP[i];
		c._points = new Array(this._points.length);
		for(var i=0;i<this._styleChain.length;i++)
			c._points[i] = new L.LatLng( this._points[i].lat,this._points[i].lng );
		return c;
	},
});
DataPath.create = function( p , name ){
	var l = new DataPath();
	l.init( p );
	if( name )
		l.id = name;
	return l;
};

var DataDot = function(){};
extend( DataDot, AbstractElement.prototype );
extend( DataDot, {
	_point : null,
	init:function(p){
		this._point = p;
	},
	getJSONformat:function(){
		var JSON = {
			"type" : "Feature",
			"properties" : this.getStyle(),
			"geometry ": {
					"type" : "Polyline",
					"LatLng": this._point,
			},
		};
		return JSON;
	},
	draw:function( lfe ){
		lfe.addLayer( new L.Marker( this._point , {"icon" : L.icons.editableSquare } ) );
	},
	clone:function(){
		var cP = this.superDad.clone();
		var c = new DataDot();
		for(var i in cP)
			c[i]=cP[i];
		c._point = new L.LatLng( this._point.lat,this._point.lng );
		return c;
	},
});
DataDot.create = function( p , name ){
	var l = new DataDot();
	l.init(p);
	if( name )
		l.id = name;
	return l;
};































