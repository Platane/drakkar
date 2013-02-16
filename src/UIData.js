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
		var leafletLayer=this.model.getLayer( layer );
		if(!leafletLayer)
			return null;
		var stamp = leafletLayer.getStamp();
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
		this.listen(true);
	},
	update : function(){
		var i,j;
			
			//check the structre
			
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
				this.layers[ j ].update();
			
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
	/*
	 * listen the layer-struct event
	 * propage listen to the layer ( the layers will propage to the elements )
	 */
	listen : function(enable){
		this.model.removeListener(this);
		if( enable ){
			this.model.registerListener('layer-struct',{o:this,f:this.update});
			this.update();
		}
		var i = this.layers.length;
		while( i-- )
			this.layers[i].listen(enable);
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
	update : function( ){
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
			this.elements[ j ].update( );
			
			
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
	listen : function(enable){
		this.model.removeListener(this);
		if( enable ){
			this.model.registerListener('element-struct',{o:this,f:this.update});
			this.update();
		}
		var i = this.elements.length;
		while( i-- )
			this.elements[i].listen(enable);
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
	_selected:false,
	_hidden:false,
	_layerSelected:false,
	init : function( dataPath ){
		AbstractLeafletItem.prototype.init.call( this );
		this.model = dataPath;
		
		// clone the point array
		this.lfe = new L.Polygon( L.cloneLatLngArray(this.model._points) );
		this.lfe.data = this;
		
		this.listen(true);
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
	listen : function(enable){
		this.model.removeListener( this );
		mCSS.removeListener( this );
		if( enable ){
			this.model.registerListener( "set-attribute" , {o:this,f:function(){this._chainDirty=true; this.update();}} );
			this.model.registerListener( "set-shape" , {o:this,f:function(){this._structDirty=true; this.update();}} );
			mCSS.registerListener( "set-css" , {o:this,f:function(){this._chainDirty=true; this.update();}} );
		}
	}
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
UIState.declaration=null;
UIState.result=null;
UIState.elements=[];
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
UIState.addElement=function(e){
	var i=this.elements.length;
	while(i--)
		if(this.elements[i]==e)
			return;
	this.elements.push(e);
	this.notify("select-element");
};
UIState.setElement=function(e){
	if( this.elements.length==1&&this.elements[0]==e)
		return;
	this.elements=[e];
	this.notify("select-element");
};
UIState.removeElement=function(e){
	var i=this.elements.length;
	while(i--)
		if(this.elements[i]==e){
			this.elements.splice(i,1);
			this.notify("select-element");
			return;
		}
};
UIState.flushElement=function(e){
	if( this.elements.length==0)
		return;
	this.elements=[];
	this.notify("select-element");
};
UIState.setDeclaration=function(d){
	if(d==this.declaration)
		return;
	this.declaration=d;
	this.notify("set-declaration");
}
UIState.setResult=function(d){
	if(d==this.result)
		return;
	this.result=d;
	this.notify("set-result");
}
/* 
 * a tweak
 * listen the change of css, notify a set-declaration and dispatch the new declaration
 */
UIState.init=function(){
	//tweak for declaration update when css update occur
	mCSS.registerListener( "set-css" , {o:this,f:function(){
		//compare the declaration saved with the set of declaration
		
		var decls = mCSS.getDeclarations();
		var dec = UIState.declaration;
		
		if( dec == null )
			return;
		
		var selectorCompare=function( s1 , s2 ){
			if(s1.length!=s2.length)
				return false;
			for(var i=0;i<s1.length;i++){
				if(s1[i].length!=s2[i].length)
					return false;
				for(var j=0;j<s1[i].length;j++)
					for( var attr in s1[i][j] ){
						if(attr=="attributeQuery")
							continue;
						if(attr=="parent")
							continue;		//TODO make a reccursive call
						if(s2[i][j][attr]!=s1[i][j][attr])
							return false;
					}
			}
			return true;
		};
		
		//try to match based with the selector
		var selectorMatch=[];
		var i=decls.length;
		while(i--){
			if(decls[i]==dec)	//no modification on the selected declaration
				return;
			if( selectorCompare( dec.selectors , decls[i].selectors ) )
				selectorMatch.push(i);
		}
		if( selectorMatch.length==0 ){
			//try to match based with the similarity
			var max_score=-Infinity;
			var max_i=0;
			var i=decls.length;
			while(i--){
				var score=0;
				for(var prop in dec.props)
					if( decls[i].props[prop] != null ){
						score+=0.5;
						if( decls[i].props[prop] == dec.props[prop] )
							score+=1;
					}
				for(var prop in decls[i].props)
					if( dec.props[prop] == null )
						score-=0.8;
				
				if(score>max_score){
					max_i=i;
					max_score=score;
				}
			}
			selectorMatch.push(max_i);
		}
		
		UIState.declaration=decls[selectorMatch[0]];
		UIState.notify("set-declaration");
		
	}});
};



/*
 * knows every thing about tags
 */
 //TODO make a dichotomic search
var TagMgr={
	_classes:[],
	_attributes:[],
	init:function(datamap){
		this._spy(datamap);
	},
	_spy:function(datamap){
		this._classes=[];
		this._attributes=[];
		this.search(datamap);
		datamap.removeListener("set-attribute","layer-struct",this);
		datamap.registerListener("layer-struct",{o:this,f:function(){this._spy(datamap);}});
		datamap.registerListener("set-attribute",{o:this,f:function(){this._extract(datamap);}});
		
		var i=datamap.getLayers().length;
		var self=this;
		while(i--)
			(function(){
				var layer=datamap.getLayers()[i];
				layer.removeListener("set-attribute","element-struct",self);
				layer.registerListener("element-struct",{o:self,f:function(){self._spy(datamap);}});
				layer.registerListener("set-attribute",{o:self,f:function(){self._extract(layer);}});
				
				var j=layer.getElements().length;
				while(j--)
					(function(){
						var element=layer.getElements()[j];
						element.removeListener("set-attribute",self);
						element.registerListener("set-attribute",{o:self,f:function(){self._extract(element);}});
					})();
			})();
	},
	_extract:function(el){
			for(var i in el._classes ){
				if( i.substr(0,9) == "reserved-" )
					continue;
				if(!this._contains(this._classes,i))
					this._push(this._classes,i);
			}
			for(var i in el._attributes ){
				if( i.substr(0,9) == "reserved-" )
					continue;
				if(!this._contains(this._attributes,i))
					this._push(this._attributes,i);
			}
	},
	search:function(datamap){
		this._extract(datamap);
		var i=datamap.getLayers().length;
		while(i--){
			this._extract(datamap.getLayers()[i]);
			var j=datamap.getLayers()[i].getElements().length;
			while(j--)
				this._extract(datamap.getLayers()[i].getElements()[j]);
		}
	},
	_push:function(tree,a){
		var i=tree.length;
		while(i--)
			if(tree[i]>a){
				tree.splice(i+1,0,a);
				return;
			}
		tree.unshift(a);
		tree=tree.sort(function(a,b){ return (a<b)?1:-1; });	//for safety, remove when do dichotomy
	},
	_contains:function(tree,a){
		var i=tree.length;
		while(i--)
			if(tree[i]==a)
				return true;
		return false;
	},
	pushAttribute:function(a){
		if(!this._contains(this._attributes,a))
			this._push(this._attributes,a);
	},
	pushClasse:function(a){
		if(!this._contains(this._classes,a))
			this._push(this._classes,a);
	},
	complete:function(where,s,max){
		var max=max || 20;
		var tree=null,
			matches=[];
		if(where=="class")
			tree=this._classes;
		else
			return;
			
		var i=tree.length;
		while(i--)
			if(tree[i]>=s){
				i=i+1;
				break;
			}
		if( i>=0 )
		while(i--){
			if(tree[i].substr(0,s.length)!=s||matches.length>=max){
				break;
			}
			matches.push(tree[i]);
		}
		return matches;
	},
	/*
	// I was gonna use research tree, but I figure thar with the number of tags, it will run smoother will simple array
	_push:function( tree , a ){
		
		
	},
	_contains:function( tree , a ){
		var cursor=tree;
		for(var i=0;cursor!=null&&cursor.c&&i<a.length;i++)
			if((cursor=cursor.c[a[i]])==null)
				return false;
		return(i>=a.length);
	}*/
};




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













