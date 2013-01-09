var extend = function( child , f ){
	for( var p in f )
		child.prototype[ p ] = f[ p ];
	if( !child.prototype.superDad )
		child.prototype.superDad = f;
};


/**
 * register element in classes
 * do not manage redundancy
 * no need to init
 */
function AbstractNotifier(){};
AbstractNotifier.prototype = {
	_listener : null,
	_lock:false,
	_stack:null,
	/**
	 * add the element to the listener list
	 * @param ( [ class ] | optional )* ( [ object ] , [ function ] | [ function ] , [ object ] | { o:object , f:function} | object  )
	 * @param if no class are specified, register the element to the "all" class
	 * @param for the update, the fonction need a object and a function. theses can be pass wrapped in an object , or separetly. if only the object is specified, the function will be object.update
	 */
	registerListener : function(  ){
		if( !this._listener )
			this._listener = {};
		
		var update=null,
			i=0;
			
		for(i=0;i<arguments.length&&typeof(arguments[i])=="string";i++);
		
		if( i+1<arguments.length )
			update = {f:arguments[i+1] , o:arguments[i]};
		else
		if( i<arguments.length )
			if( arguments[i].f != undefined && arguments[i].o != undefined ){
				update = {f:arguments[i].f , o:arguments[i].o};
			}else{
				update = {f:arguments[i].update , o:arguments[i]};
			}
		if( update == null )
			throw "invalid param";
			
		
		if(this._lock){
			// if the Notifier is locked ( meaning he is current notfifying ) stack the modification on the listeners, and do it after
			if( !this._stack )
				this._stack=[];
			this._stack.push({f:this.registerListener,a:arguments});
			return update;
		}
		
		for(i=0;i<arguments.length&&typeof(arguments[i])=="string";i++){
			if( !this._listener[ arguments[i] ] )
				this._listener[ arguments[i] ] = [];
			this._listener[ arguments[i] ].push( update );
		}
		if( i==0 ){
			if( !this._listener[ "all" ] )
				this._listener[ "all" ] = [];
			this._listener[ "all" ].push( update );
		}
		return update;
	},
	/**
	 * remove the element to the listener list
	 * @param ( [ class ] | optional )* ( [ object ] , [ function ] | { o:object , f:function} | object  )
	 * @param if no class are specified, remove from all classes
	 * @param for the update, the fonction need a object and a function. theses can be pass wrapped in an object , or separetly. if only the object is specified, the function will be object.update
	 * @param if no update couple is specified, remove the entire classes
	 */
	removeListener : function( ){
		if( !this._listener )
			this._listener = {};
			
		var update=null,
			i=0;
			
		for(i=0;i<arguments.length&&typeof(arguments[i])=="string";i++);
		
		if( i+1<arguments.length )
			update = {f:arguments[i+1] , o:arguments[i]};
		else
		if( i<arguments.length )
			if( arguments[i].f != undefined && arguments[i].o != undefined ){
				update = {f:arguments[i].f , o:arguments[i].o};
			}else{
				update = {f:arguments[i].update , o:arguments[i]};
			}
		
		if(this._lock){
			// if the Notifier is locked ( meaning he is current notfifying ) stack the modification on the listeners, and do it after
			if( !this._stack )
				this._stack=[];
			this._stack.push({f:this.removeListener,a:arguments});
			return update;
		}
		
		for(i=0;i<arguments.length&&typeof(arguments[i])=="string";i++){
			if( !this._listener[ arguments[i] ] )
				continue;
			if( update == null ){
				this._listener[ arguments[i] ] = [];
				continue;
			}
			for( var j=0;j<this._listener[ arguments[i] ].length;j++)
				if( this._listener[ arguments[i] ][j].o == update.o )
					this._listener[ arguments[i] ].splice(j,1);
		}
		if( i==0 )
			if( update == null )
				this._listener = {};
			else
				for( var k in this._listener )
					for( var j=0;j<this._listener[k].length;j++)
						if( this._listener[k][j].o == update.o )
							this._listener[k].splice(j,1);
		return update;
	},
	notify : function( ){
		if( !this._listener )
			return;
		this._lock=true;
		for(i=0;i<arguments.length&&typeof(arguments[i])=="string";i++)
			if( this._listener[ arguments[i] ] )
				for( var j=0;j<this._listener[ arguments[i] ].length;j++)
					this._listener[ arguments[i] ][j].f.call( this._listener[ arguments[i] ][j].o , this , arguments[i] );
		if( i==0 )
			for(var i in this._listener )
				for( var j=0;j<this._listener[ i ].length;j++)
					this._listener[ i ][j].f.call( this._listener[ i ][j].o , this , i );
		this._lock=false;
		if( this._stack ){
			for(var i=0;i<this._stack.length;i++)
				this._stack[i].f.apply( this,this._stack[i].a);
			this._stack=null;
		}
	},
}


/**  @class Abstract class that can retain several properties. Element that herit from this class can be attach to a style
 *	 set-attribute
 */
AbstractAttributeHolder = function(){};
extend( AbstractAttributeHolder , AbstractNotifier.prototype );
extend( AbstractAttributeHolder , {
	_attributes : null,
	_classes: null,
	_parent:null,
	stamp:null,
	type : null,
	id : null,
	
	init:function(classes,attributes){
		this.stamp="obj"+(DataMap.objStamp++);
		this._attributes=attributes||{};
		this._classes=classes||{};
	},
	removeAttribute:function( attributeName ){
		delete this._attributes[ attributeName ];
		this.notify( "set-attribute" );
	},
	setAttribute:function( attributeName , value ){
		this._attributes[ attributeName ] = value;
		this.notify( "set-attribute" );
	},
	getAttribute:function( attributeName ){
		return this._attributes[ attributeName ];
	},
	
	
	addClass:function( className ){
		this._classes[ className ]=true;
		this.notify( "set-attribute" );
	},
	removeClass:function( className ){
		this._classes[ className ]=null;
		delete this._classes[className];
		this.notify( "set-attribute" );
	},
	hasClass:function( className ){
		return ( this._classes[ className ] ? true : false );
	},
	
	getParent:function(){
		return this._parent;
	},
	
	getStamp:function(){
		return this.stamp;
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
		return c;
	},
});



/**
 * can throw the event:
 * layer-struct
 */
var DataMap = function(){};
extend( DataMap , AbstractAttributeHolder.prototype );
extend( DataMap , {
	_layers : null,
	init:function(){
		AbstractAttributeHolder.prototype.init.call(this);
		this._layers = [];
	},
	addLayer:function( layer , z ){
		z = z || 0;
		this._layers.splice( z , 0 , layer );
		layer._parent = this;
		this.notify( "layer-struct" );
	},
	removeLayer:function( layer ){
		var i = this._getLayerIndex( layer );
		if( i == null )
			return;
		this._layers.splice( i , 1 );
		this.notify( "layer-struct" );
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
			if( layer.slice(0,3) == "obj" ){
				for(i=0;i<this._layers.length;i++)
					if( this._layers[i].getStamp() == layer )
						break;
			}else{
				console.log( "warning using name search is not conseilled" );
				for(i=0;i<this._layers.length;i++)
					if( this._layers[i].getName() == layer )
						break;
			}
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
	//move layer 
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
});
DataMap.create = function( name ){
	var l = new DataMap();
	l.init();
	if( name )
		l.id = name;
	return l;
};
DataMap.objStamp=0;


var DataLayer = function(){};
extend( DataLayer , AbstractAttributeHolder.prototype );
extend( DataLayer , {
	_elements : null,
	init:function(){
		AbstractAttributeHolder.prototype.init.call(this);
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
			if( element.slice(0,3) == "obj" ){
				for(i=0;i<this._elements.length;i++)
					if( this._elements[i].getStamp() == element )
						break;
			}else{
				console.log( "warning using name search is not conseilled" );
				for(i=0;i<this._elements.length;i++)
					if( this._elements[i].getName() == element )
						break;
			}
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
		this.notify("element-struct");
	},
	removeElement:function( element ){
		var i = this._getElementIndex( element );
		if( i != null )
			this._elements.splice( i , 1 );
		this.notify("element-struct");
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
extend( DataPath, AbstractAttributeHolder.prototype );
extend( DataPath, {
	_points : null,
	init:function(p){
		this.type="polygon";
		this._points = p;
		//pseudo slice
		var a =[];
		for(var i=1;i<arguments.length;i++)
			a.push(arguments[i]);
		AbstractAttributeHolder.prototype.init.apply(this,a);
	},
	setShape : function(p){
		this._points=p;
		this.notify("set-shape");
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
	clone:function(){
		var c = new DataPath();
		var superDad = AbstractAttributeHolder;
		if( superDad != null ){
			var cP = superDad.prototype.clone.call( this );
			for(var i in cP)
				c[i]=cP[i];
		}
		c._points = new Array(this._points.length);
		for(var i=0;i<this._points.length;i++)
			c._points[i] = new L.LatLng( this._points[i].lat,this._points[i].lng );
		return c;
	},
});
DataPath.create = function( p , classes , attributes ){
	var l = new DataPath();
	l.init.apply( l , arguments );
	return l;
};

/*
var DataDot = function(){};
extend( DataDot, AbstractAttributeHolder.prototype );
extend( DataDot, {
	_point : null,
	init:function(p){
		AbstractAttributeHolder.prototype.init.call(this);
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
*/


