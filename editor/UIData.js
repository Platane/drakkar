var extend = function( child , f ){
	for( var p in f )
		child.prototype[ p ] = f[ p ];
	if( !child.prototype.superDad )
		child.prototype.superDad = f;
};


/* this stand for a model for the UI */

AbstractLeafletItem = function(){};
extend( AbstractLeafletItem  , AbstractStyleHolder.prototype );
extend( AbstractLeafletItem  ,  {
	model : null,
	_event : null,
	_eventDirty : false,
	lfe : null,
	init:function(){
		AbstractStyleHolder.prototype.init.call( this );
		this._event=[];
	},
	on : function( s , f ){
		this._event.push( {s:s , f:f} );
		this._eventDirty = true;
		return this;
	},
	off : function( s , f ){
		for( var i=0;i<this._event.length;i++)
			if( this._event[ i ].s == s && ( f == null || this._event[ i ].f == this._event[ i ].f ) ){
				this._event.splice( i , 1 );
				i--;
			}
		this._eventDirty = true;
		return this;
	},
	getStamp : function(){
		return this.model.getStamp();
	},
} );

var LeafletMap = function(){};
extend( LeafletMap , AbstractLeafletItem.prototype );
extend( LeafletMap , {
	additionnalElement : null,
	layers:null,
	getElement : function( element ){
		if( typeof(element) == "string" ){
			var i=this.layers.length;
			var rep;
			while(i--)
				if((rep=this.layers[i].getElement(element))!=null)
					return rep;
			return null;
		}
		if( typeof(element)=="object"  )
			if( element.lfe )
				return element; // dumbass -.-
			else
				return this.getLayer( element.getParent() ).getElement( element );
		return null;
	},
	getLayer : function( layer ){
		var stamp = this.model.getLayer( layer ).getStamp();
		var i=this.layers.length;
		while(i--)
			if(this.layers[i].getStamp()==stamp)
				return this.layers[i];
		return null;
	},
	init : function( dataMap , el ){
		AbstractLeafletItem.prototype.init.call( this );
		
		this.layers = [];
		
		this.model = dataMap;
		this.lfe = new L.Map( el );
		this.lfe.data = this;
		
	},
	update : function( lbl ){
	
		switch( lbl ){
			
			default : 
			
			
			var i,j;
			
			// every element in the model is in the LL
			i = this.model.getLayers().length;
			while( i-- ){
				var accept = false;
				j = this.layers.length;
				while( j-- )
				if( this.model.getLayers()[ i ].getStamp() == this.layers[ j ].getStamp() ){
					accept = true;
					break;
				}
				if( !accept ){
					this.layers.push( LeafletLayer.create( this.model.getLayer(i) , this.lfe ) );
				}
			}
			
			// every element in the LL is in the model
			j = this.layers.length;
			while( j-- ){
				var accept = false;
				i = this.model.getLayers().length;
				while( i-- )
				if( this.model.getLayers()[ i ].getStamp() == this.layers[ j ].getStamp() ){
					accept = true;
					break;
				}
				if( !accept ){
					// shouldn't be in LL
					this.layers[ j ].destroy();
					this.layers.splice( j , 1 );
				}
			}
			
			j = this.layers.length;
			while( j-- )
				this.layers[ j ].update( lbl );
			
			/*	
			for( var i=0;i<this.model.getLayers().length;i++)
				if( (name = this.model.getLayer( i ).getName()) != this.layers.getName() ){
					// is it a swap? 
					// if so we should found the layer futher
					// search it
					for( var j=i+1;j<this.layers.length;j++ )
						if( name == this.layers[j].getName() )
							break;
					if( j<this.layers.length ){
						//swap for concordance
						// duno what do with the LL
						var tmp = this.layers[j];
						this.layers[j] = this.layers[i];
						this.layers[i] = tmp;
						i--;
						continue;
					}
					else
					{
					// is it an addition? 
					// if so we shouldn't found the layer futher
						this.layers.splice( i, 0 , LeafletLayer.create( this.model.getLayer( i ) ) );
						i--;
						continue;
					}
				}
				
			/*
			// all elements from data are in LL
			i = dataMap.getLayers().length;
			while( i-- ){
				var accept = false;
				for( j in lfe._layers )
					if( dataMap.getLayers()[ i ].getName() == lfe._layers[ j ].data.getName() ){
						accept = true;
						break;
					}
				if( !accept ){
					// not in LL
					lfe.addLayer( LeafletLayer.create( dataMap.getLayer(i) ).lfe );
				}
			}
			
			// all elements LL are in data
			for( j in lfe._layers ){
				var accept = false;
				i = dataMap.getLayers().length;
				while( i-- )
					if( dataMap.getLayers()[ i ].getName() == lfe._layers[ j ].data.getName() ){
						accept = true;
						break;
					}
				if( !accept ){
					// not in data
					lfe.removeLayer( lfe._layers[ j ] );
				}
				
				lfe._layers[ j ].data.update( lbl );
			}			
			
			/*
			//check if any layer has been added / deleted / swapped
			for( var i=0;i<this.model.getLayers().length;i++)
				if( (name = this.model.getLayer( i ).getName()) != this.lfe._layers[i].data.name ){
					// is it a swap? 
					// if so we should found the layer futher
					// search it
					for( var j=i+1;j<this.lfe._layers.length;j++ )
						if( name == this.lfe._layers[j].data.name )
							break;
					if( j<this.lfe._layers.length ){
						//swap for concordance
						var tmp = this.lfe._layers[j];
						this.lfe._layers[j] = this.lfe._layers[i];
						this.lfe._layers[i] = tmp;
						i--;
						continue;
					}
					else
					{
					// is it an addition? 
					// if so we shouldn't found the layer futher
						this.lfe._layers.splice( i, 0 , LeafletLayer.create( this.model.getLayer( i ) ).lfe );
						i--;
						continue;
					}
				}
			*/
		}
		
		
		//bindable
		if( this._eventDirty ){
			i =this._event.length;
			while( i -- ){
				this.lfe.off( this._event[ i ].s , this._event[ i ].f );
				this.lfe.on(  this._event[ i ].s , this._event[ i ].f );
			}
			this._eventDirty = false;
		}
	},
});
LeafletMap.create=function( dataMap , el ){
	var m = new LeafletMap();
	m.init( dataMap , el );
	return m;
}

var LeafletLayer = function(){};
extend( LeafletLayer , AbstractLeafletItem.prototype );
extend( LeafletLayer , {
	elements:null,
	hidden:false,
	getElement : function( element ){
		var stamp = this.model.getElement( element ).getStamp();
		var i=this.elements.length;
		while(i--)
			if(this.elements[i].getStamp()==stamp)
				return this.elements[i];
		return null;
	},
	init : function( dataLayer , leafletContainer ){
		
		AbstractLeafletItem.prototype.init.call( this );
		
		this.elements = [];
		this.llc = leafletContainer;
		
		this.model = dataLayer;
	},
	destroy : function(){
		var i = this.model.getElements().length;
		while( i-- )
			this.llc.removeLayer( this.elements[ i ].lfe );
	},
	update : function( lbl ){
		var i,j;
		
		// every element in the model is in the LL
		i = this.model.getElements().length;
		while( i-- ){
			var accept = false;
			j = this.elements.length;
			while( j-- )
			if( this.model.getElements()[ i ].getStamp() == this.elements[ j ].getStamp() ){
				accept = true;
				break;
			}
			if( !accept ){
				// not in LL
				var e;
				/*
				if( this.model.getElement(i) instanceof DataDot )
					e=LeafletDot.create( this.model.getElement(i) );
				else
				*/
				if( this.model.getElement(i) instanceof DataPath )
					e=LeafletPath.create( this.model.getElement(i) );
				else
					throw "unkonw type";
				this.elements.push( e );
				this.llc.addLayer( e.lfe );
			}
		}
		
		// every element in the LL is in the model
		j = this.elements.length;
		while( j-- ){
			var accept = false;
			i = this.model.getElements().length;
			while( i-- )
			if( this.model.getElements()[ i ].getStamp() == this.elements[ j ].getStamp() ){
				accept = true;
				break;
			}
			if( !accept ){
				// shouldn't be in LL
				this.llc.removeLayer( this.elements[ j ].lfe );
				this.elements.splice( j , 1 );
			}
		}
		
		j = this.elements.length;
		while( j-- )
			this.elements[ j ].update( lbl );
			
			
		//bindable
		if( this._eventDirty ){
			i =this._event.length;
			while( i -- ){
				j =this.elements.length;
				while( j -- ){
					this.elements[j].lfe.off( this._event[ i ].s , this._event[ i ].f );
					this.elements[j].lfe.on( this._event[ i ].s , this._event[ i ].f );
				}
			}
			this._eventDirty = false;
		}
	},
});
LeafletLayer.create = function( dataLayer , llc ){
	var m = new LeafletLayer();
	m.init( dataLayer  , llc );
	return m;
}

/*
var LeafletDot = function(){};
extend( LeafletDot , AbstractLeafletItem.prototype );
extend( LeafletDot , {
	init : function( dataDot ){
		this.additionnalStyle = [];
		this._event = [];
		
		this.model = dataDot;
		this.lfe = new L.Marker( dataDot._point );
		this.lfe.data = this;
		this.name = dataDot.getName();
		
	},
	update : function(){
		if( this._eventDirty ){
			var i =this._event.length;
			while( i -- ){
				this.lfe.off( this._event[ i ].s , this._event[ i ].f );
				this.lfe.on( this._event[ i ].s , this._event[ i ].f );
			}
			this._eventDirty = false;
		}
	},
});
LeafletDot.create = function( dataDot ){
	var m = new LeafletPath();
	m.init( dataDot );
	return m;
}
*/

var LeafletPath = function(){};
extend( LeafletPath , AbstractLeafletItem.prototype );
extend( LeafletPath , {
	_structDirty : true,
	init : function( dataPath ){
		AbstractLeafletItem.prototype.init.call( this );
		this.model = dataPath;
		dataPath.registerListener( "set-attribute" , {o:this,f:function(){this._chainDirty=true; this.update();}} );
		dataPath.registerListener( "set-shape" , {o:this,f:function(){this._structDirty=true; this.update();}} );
		// clone the point array
		this.lfe = new L.Polygon( L.cloneLatLngArray(this.model._points) );
		this.lfe.data = this;
		//this.name = dataPath.getName();
		this.update();
	},
	update : function(){
		var updateNeeded=false;
		
		if(this._structDirty){
			var i=this.lfe._latlngs.length;
			if( i!=this.model._points.length )
				updateNeeded=true;
			else
				while(i--)
					if(this.lfe._latlngs[i].lat!=this.model._points[i].lat||this.lfe._latlngs[i].lng!=this.model._points[i].lng){
						updateNeeded=true;
						break;
					}
			if(updateNeeded)
				this.lfe._latlngs=L.cloneLatLngArray(this.model._points);
			this._structDirty=false;
		}
		// style
		if(this._chainDirty){
			this._styleChain=mCSS.computeChain(this.model);
			this._styleDirty=true;
			this._chainDirty=false;
		}
		if(this._styleDirty){
			var style=this._mergeStyleChain( this._styleChain );
			var options=this._interpretStyle(style);
			this.lfe.setStyle(options);
			this._styleDirty=false;
			updateNeeded=true;
		}
		if(updateNeeded)
			this.lfe.redraw();
		
		// rebind event
		if( this._eventDirty ){
			var i =this._event.length;
			while( i -- ){
				this.lfe.off( this._event[ i ].s , this._event[ i ].f );
				this.lfe.on( this._event[ i ].s , this._event[ i ].f );
			}
			this._eventDirty = false;
		}
	},
});
LeafletPath.create = function( dataPath ){
	var m = new LeafletPath();
	m.init( dataPath );
	return m;
}


var state = {
	currentLayerSelected : null,
	currentElementSelected : null,
	currentToolSelected : null,
	currenTask : {
		working : false,
		cancel : {f:null,o:null},
		label : null,
	}
};
state.taskMgr =  {
	_current : {
		cancel : { f : null , o : null },
		label : null,
	},
	_currentlyWorking : false,
	
	stack : function( cancelf , cancelo , label ){
		
		this.cancel();
		
		this._currentlyWorking = true;
		this._current.f = cancelf;
		this._current.o = cancelo || scope;
		this._current.label = label;
	},
	done : function( ){
		this._currentlyWorking = false;
	},
	cancel : function( ){
		if( this._currentlyWorking )
			this._current.f.call( ( this._current.o ) ? this._current.o : this  )
		this._currentlyWorking = false;
	},
}

/*
select-tool
select-layer
select-element
*/
var UIState = new AbstractNotifier();
UIState.tool=null;
UIState.layer=null;
UIState.element=null;
UIState.toolList={
	edit:"edit",
	select:"select",
};	
UIState.setTool=function(tool){
	var ex=this.tool;
	this.tool=tool;
	this.notify("select-tool");
};
UIState.setLayer=function(layer){
	var ex=this.layer;
	this.layer=layer;
	this.notify("select-layer");
};
UIState.setElement=function(e){
	var ex=this.e;
	this.element=e;
	this.notify("select-element");
};
/*
var UIState = {
	_listener : null,
	init : function(){
		this._listener = {
			"tool" : [],
			"layer" : [],
			"element" : []
		};
	},
	register : function(){
		var callback,
			event = arguments[0];
		if( argument.length == 2 ){
			callback = arguments[1];
		}else
		if( argument.length == 3 ){
			if( typeof(arguments[2]) =="function" )
				callback = {o:arguments[1],f:arguments[2]};
			else
				callback = {o:arguments[2],f:arguments[1]};
		}
		
		this._listener[ event ].push( callback );
	},
	remove : function(){
		var callback,
			event = arguments[0];
		if( argument.length == 2 ){
			if( arguments[1].o && arguments[1].f )
				callback = arguments[1];
			else
				callback = {o:arguments[1],f:null};
		}else
		if( argument.length == 3 ){
			if( typeof(arguments[2]) =="function" )
				callback = {o:arguments[1],f:arguments[2]};
			else
				callback = {o:arguments[2],f:arguments[1]};
		}
		
		var i=this._listener[ event ].length;
		while(i--){
			if( this._listener[ event ][i].o == callback.o && ( !callback.f || this._listener[ event ][i].f == callback.f ) )
				this._listener[ event ].splice(i,1);
		}
	},
	notify : function
};
*/


// dont hold shit actually
var MapCSSHolder = function(){};
extend( MapCSSHolder , AbstractNotifier.prototype );
extend( MapCSSHolder , 
{
	_model:null,
	init:function(model,s){
		this._model=model;
		if(s)
			this.setCSS(s);
	},
	/**
	* @param {string}
	*/
	setCSS:function(s){
		mCSS.init(s);
		
		// update
		
	},
});













