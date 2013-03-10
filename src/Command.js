var Stack = function(){};
Stack.prototype = {
	
	_tab : null,
	
	_n : 0,
	
	initWithCapacity : function( n ){
		
		this._tab = new Array();
		
		this._n = n;
	},
	push : function( e ){
		
		this._tab.unshift( e );
		
		if( this._tab.length > this._n )
			this._tab.splice( this._n , this._tab.length - this._n );
	
	},
	pop : function( ){
		return this._tab.shift();
	},
	
};
Stack.createWithCapacity  = function( n ){
	var s = new Stack();
	s.initWithCapacity( n );
	return s;
};

/*
 * command system
 */
var cmd = {};
( function( scope ){


var extend = function( child , f ){
	for( var p in f )
		child.prototype[ p ] = f[ p ];
};

var STATE_READY = 0,
	STATE_SUCCESS = 1,
	STATE_CANCEL = 2,
	STATE_FAIL = 4;

	
var AbstractCmd = function(){};
AbstractCmd.prototype = {
	_state : null,
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
			
			
		this._state = STATE_CANCEL;
		return true;
	},
	redo : function( ){
		if( this._state != STATE_CANCEL )
			return false;
		this._state = STATE_READY;
		return this.execute();
	},
	getState : function(){
		return this._state;
	},
	toString : function(){ return "Abstract Commande";},
};

/*
 * execute in one round severals cmds 
 */
var CmdMultiple = function(){};
extend( CmdMultiple , AbstractCmd.prototype );
extend( CmdMultiple , {	
	_cmds : null,
	_update : null,
	initWithCmds : function( t , update ){
		
		this._cmds = t;
		this._update = update;
		
		this._state = STATE_READY;
	},
	
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		for( var i = 0 ; i < this._cmds.length ; i ++ ){
			if( this._cmds[ i ].getState() != STATE_READY )
				return false;
			this._cmds[ i ].execute();
			if( this._cmds[ i ].getState() != STATE_SUCCESS )
				return false;
		}
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
		
		for( var i = 0 ; i < this._cmds.length ; i ++ ){
			if( this._cmds[ i ].getState() != STATE_SUCCESS )
				return false;
			this._cmds[ i ].undo();
			if( this._cmds[ i ].getState() != STATE_CANCEL )
				return false;
		}
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_CANCEL;
		return true;
	},
	redo : function( ){
		if( this._state != STATE_CANCEL )
			return false;
		
		for( var i = 0 ; i < this._cmds.length ; i ++ ){
			if( this._cmds[ i ].getState() != STATE_CANCEL )
				return false;
			this._cmds[ i ].redo();
			if( this._cmds[ i ].getState() != STATE_SUCCESS )
				return false;
		}
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	}
} );
CmdMultiple.create = function( ){
	var c = new CmdMultiple();
	c.initWithCmds( arguments );
	return c;
};
CmdMultiple.createWithTab = function( t , update ){
	var c = new CmdMultiple();
	c.initWithCmds( t , update );
	return c;
};




var CmdDeleteLayer = function(){};
extend( CmdDeleteLayer , AbstractCmd.prototype );
extend( CmdDeleteLayer , {	
	_layer : null,
	_map : null,
	_update : null,
	init : function( layer , map , update ){
		
		this._layer = map.getLayer( layer );
		this._map = map;
		this._update = update;
		
		this._state = STATE_READY;
	},
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		this._map.removeLayer( this._layer );
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
		
		this._map.addLayer( this._layer );
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_CANCEL;
		return true;
	},
} );
CmdDeleteLayer.create = function( layer , map , update ){
	var c = new CmdDeleteLayer();
	c.init( layer , map , update );
	return c;
};

var CmdDeleteElement = function(){};
extend( CmdDeleteElement , AbstractCmd.prototype );
extend( CmdDeleteElement , {	
	_layer : null,
	_element : null,
	_update : null,
	init : function( element , layer , update ){
		
		this._layer = layer;
		this._element = layer.getElement( element );
		this._update = update;
		
		this._state = STATE_READY;
	},
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		this._layer.removeElement( this._element );
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
		
		this._layer.addElement( this._element );
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_CANCEL;
		return true;
	},
} );
CmdDeleteElement.create = function( layer , map , update ){
	var c = new CmdDeleteElement();
	c.init( layer , map , update );
	return c;
};

var CmdAddLayer = function(){};
extend( CmdAddLayer , AbstractCmd.prototype );
extend( CmdAddLayer , {	
	_layer : null,
	_map : null,
	_update : null,
	init : function( layer , map , update ){
		
		this._layer = layer;
		this._map = map;
		this._update = update;
		
		this._state = STATE_READY;
	},
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		this._map.addLayer( this._layer );
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
		
		
		this._map.removeLayer( this._layer );
		
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_CANCEL;
		return true;
	},
} );
CmdAddLayer.create = function( layer , map , update ){
	var c = new CmdAddLayer();
	c.init( layer , map , update );
	return c;
};

var CmdAddElement = function(){};
extend( CmdAddElement , AbstractCmd.prototype );
extend( CmdAddElement , {	
	_layer : null,
	_element : null,
	_update : null,
	init : function( element , layer , update ){
		
		this._layer = layer;
		this._element = element;
		this._update = update;
		
		this._state = STATE_READY;
	},
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		this._layer.addElement( this._element );
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
			
		this._layer.removeElement( this._element );
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_CANCEL;
		return true;
	},
} );
CmdAddElement.create = function( layer , map , update ){
	var c = new CmdAddElement();
	c.init( layer , map , update );
	return c;
};

var CmdChangeCurrentLayer = function(){};
extend( CmdChangeCurrentLayer , AbstractCmd.prototype );
extend( CmdChangeCurrentLayer , {	
	_i : null,
	_j : null,
	_update : null,
	init : function( i , update ){
		
		this._i = i;
		this._update = update;
		
		this._state = STATE_READY;
	},
	
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		this._j=UIState.layer;
		UIState.setLayer(this._i);
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
		
		
		UIState.setLayer(this._j);
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_CANCEL;
		return true;
	},
} );
CmdChangeCurrentLayer.create = function( i, update ){
	var c = new CmdChangeCurrentLayer();
	c.init( i , update );
	return c;
};

var CmdChangeCurrentElement = function(){};
extend( CmdChangeCurrentElement , AbstractCmd.prototype );
extend( CmdChangeCurrentElement , {	
	_i : null,
	_j : null,
	_update : null,
	init : function( i , update ){
		
		this._i = i;
		this._update = update;
		
		this._state = STATE_READY;
	},
	
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		this._ex=UIState.elements;
		UIState.setElement(this._i);
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
		
		UIState.elements=this._ex;
		UIState.notify("select-element");
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_CANCEL;
		return true;
	},
} );
CmdChangeCurrentElement.create = function( i , update ){
	var c = new CmdChangeCurrentElement();
	c.init( i , update );
	return c;
};

var CmdFlushCurrentElement = function(){};
extend( CmdFlushCurrentElement , AbstractCmd.prototype );
extend( CmdFlushCurrentElement , {	
	_ex : null,
	_update : null,
	init : function( update ){
		
		this._update = update;
		
		this._state = STATE_READY;
	},
	
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		this._ex=UIState.elements;
		UIState.flushElement();
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
		
		UIState.elements=this._ex;
		UIState.notify("select-element");
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_CANCEL;
		return true;
	},
} );
CmdFlushCurrentElement.create = function(  update ){
	var c = new CmdFlushCurrentElement();
	c.init( update );
	return c;
};


var CmdRemoveCurrentElement = function(){};
extend( CmdRemoveCurrentElement , AbstractCmd.prototype );
extend( CmdRemoveCurrentElement , {	
	_ex : null,
	_update : null,
	init : function( i , update ){
		
		this._i = i;
		this._update = update;
		
		this._state = STATE_READY;
	},
	
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		UIState.removeElement(this._i);
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
		
		UIState.addElement(this._i);
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_CANCEL;
		return true;
	},
} );
CmdRemoveCurrentElement.create = function( i, update ){
	var c = new CmdRemoveCurrentElement();
	c.init( i,update );
	return c;
};


var CmdAddCurrentElement = function(){};
extend( CmdAddCurrentElement , AbstractCmd.prototype );
extend( CmdAddCurrentElement , {	
	_ex : null,
	_update : null,
	init : function( i , update ){
		
		this._i = i;
		this._update = update;
		
		this._state = STATE_READY;
	},
	
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		UIState.addElement(this._i);
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
		
		UIState.removeElement(this._i);
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_CANCEL;
		return true;
	},
} );
CmdAddCurrentElement.create = function( i, update ){
	var c = new CmdAddCurrentElement();
	c.init( i,update );
	return c;
};

var CmdSetShape = function(){};
extend( CmdSetShape , AbstractCmd.prototype );
extend( CmdSetShape , {	
	_args : null,
	_pargs : null,
	_dataE : null,
	_update : null,
	init : function( dataE , args , update ){
		
		this._args = args;
		this._dataE = dataE;
		this._update = update;
		
		this._state = STATE_READY;
	},
	
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		if( this._dataE instanceof DataPath )
			this._pargs=[this._dataE._points];
		this._dataE.setShape.apply( this._dataE , this._args );
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
		
		this._dataE.setShape.apply( this._dataE , this._pargs );
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_CANCEL;
		return true;
	},
} );
CmdSetShape.create = function( dataE , args , update ){
	var c = new CmdSetShape();
	c.init( dataE , args , update );
	return c;
};

var CmdModifyId = function(){};
extend( CmdModifyId , AbstractCmd.prototype );
extend( CmdModifyId , {	
	_cla : null,
	_element : null,
	_update : null,
	init : function( element , id , update ){
		
		this._newId = id;
		this._exId = element.getName();
		this._element = element;
		this._update = update;
		
		this._state = STATE_READY;
	},
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		this._element.setName( this._newId );
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
			
		this._element.setName( this._exId );
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_CANCEL;
		return true;
	},
} );
CmdModifyId.create = function( element , id , update ){
	var c = new CmdModifyId();
	c.init( element , id , update );
	return c;
};


var CmdAddClass = function(){};
extend( CmdAddClass , AbstractCmd.prototype );
extend( CmdAddClass , {	
	_cla : null,
	_element : null,
	_update : null,
	init : function( element , cla , update ){
		
		this._cla = cla;
		this._element = element;
		this._update = update;
		
		this._state = STATE_READY;
	},
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		this._element.addClass( this._cla );
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
			
		this._element.removeClass( this._cla );
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_CANCEL;
		return true;
	},
} );
CmdAddClass.create = function( element , cla , update ){
	var c = new CmdAddClass();
	c.init( element , cla , update );
	return c;
};

var CmdRemoveClass = function(){};
extend( CmdRemoveClass , AbstractCmd.prototype );
extend( CmdRemoveClass , {	
	_cla : null,
	_element : null,
	_update : null,
	init : function( element , cla , update ){
		
		this._cla = cla;
		this._element = element;
		this._update = update;
		
		this._state = STATE_READY;
	},
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		this._element.removeClass( this._cla );
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
			
		this._element.addClass( this._cla );
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_CANCEL;
		return true;
	},
} );
CmdRemoveClass.create = function( element , cla , update ){
	var c = new CmdRemoveClass();
	c.init( element , cla , update );
	return c;
};
CmdModifyClass={};
CmdModifyClass.create = function( element , claEx , claNew , update ){
	return CmdMultiple.create( 
		CmdRemoveClass.create( element , claEx ),
		CmdAddClass.create( element , claNew )
		);
}



var CmdAlterCSSDeclaration = function(){};
extend( CmdAlterCSSDeclaration , AbstractCmd.prototype );
extend( CmdAlterCSSDeclaration , {	
	_newDec : null,
	_exDec : null,
	_update : null,
	init : function( newDec , exDec , update ){
		
		if( typeof(newDec)=="string")
			this._newDec = mCSS.semanticBuild(mCSS.parse(newDec))[0];
		else		
			this._newDec = newDec;
		this._exDec = exDec;
		this._update = update;
		
		this._state = STATE_READY;
	},
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		mCSS.alterDeclaration( this._exDec , this._newDec );
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
			
		mCSS.alterDeclaration( this._newDec , this._exDec );
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_CANCEL;
		return true;
	},
} );
CmdAlterCSSDeclaration.create = function( newDec , exDec , update ){
	var c = new CmdAlterCSSDeclaration();
	c.init( newDec , exDec , update );
	return c;
};


var CmdAddCSSDeclaration = function(){};
extend( CmdAddCSSDeclaration , AbstractCmd.prototype );
extend( CmdAddCSSDeclaration , {	
	_newDec : null,
	_update : null,
	init : function( newDec , update ){
		
		if( typeof(newDec)=="string")
			this._newDec = mCSS.semanticBuild(mCSS.parse(newDec))[0];
		else		
			this._newDec = newDec;
		this._update = update;
		
		this._state = STATE_READY;
	},
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		mCSS.addDeclaration( this._newDec );
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
			
		mCSS.removeDeclaration( this._newDec );
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_CANCEL;
		return true;
	},
} );
CmdAddCSSDeclaration.create = function( newDec , update ){
	var c = new CmdAddCSSDeclaration();
	c.init( newDec , update );
	return c;
};

var CmdRemoveCSSDeclaration = function(){};
extend( CmdRemoveCSSDeclaration , AbstractCmd.prototype );
extend( CmdRemoveCSSDeclaration , {	
	_newDec : null,
	_update : null,
	init : function( newDec , update ){
		
		if( typeof(newDec)=="string")
			this._newDec = mCSS.semanticBuild(mCSS.parse(newDec))[0];
		else		
			this._newDec = newDec;
		this._update = update;
		
		this._state = STATE_READY;
	},
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		mCSS.removeDeclaration( this._newDec );
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
			
		mCSS.addDeclaration( this._newDec );
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_CANCEL;
		return true;
	},
} );
CmdRemoveCSSDeclaration.create = function( newDec , update ){
	var c = new CmdRemoveCSSDeclaration();
	c.init( newDec , update );
	return c;
};


CmdModifyClass={};
CmdModifyClass.create = function( element , claEx , claNew , update ){
	return CmdMultiple.create( 
		CmdRemoveClass.create( element , claEx ),
		CmdAddClass.create( element , claNew )
		);
}

var CmdMgr = function(){};
CmdMgr.prototype = {
	
	_undoable : null,
	_redoable : null,
	
	init : function(){
		
		this._undoable = Stack.createWithCapacity( 50 );
		this._redoable = Stack.createWithCapacity( 50 );
		
	},
	execute : function( cmd ){
		
		if( !cmd.execute() )
			throw "unable to execute cmd ";
		
		this._undoable.push( cmd );
	},
	undo : function( ){
		
		var cmd = this._undoable.pop();
		
		if( !cmd )
			return;
			
		if( !cmd.undo() )
			throw "unable to undo cmd ";
		
		this._redoable.push( cmd );
	},
	redo : function( ){
		
		var cmd = this._redoable.pop();
		
		if( !cmd )
			return;
			
		if( !cmd.redo() )
			throw "unable to redo cmd ";
		
		this._undoable.push( cmd );
	},
};
CmdMgr.create = function(){
	var m = new CmdMgr();
	m.init();
	return m;
};


scope.multi = CmdMultiple;
scope.deleteLayer = CmdDeleteLayer;
scope.addLayer = CmdAddLayer;
scope.changeCurrentLayer = CmdChangeCurrentLayer;
scope.setCurrentElement = CmdChangeCurrentElement;
scope.flushCurrentElement = CmdFlushCurrentElement;
scope.removeCurrentElement = CmdRemoveCurrentElement;
scope.addCurrentElement = CmdAddCurrentElement;
scope.setShape = CmdSetShape;
scope.modifyClass = CmdModifyClass;
scope.addClass = CmdAddClass;
scope.removeClass = CmdRemoveClass;
scope.modifyId = CmdModifyId;
scope.alterCSSDeclaration = CmdAlterCSSDeclaration;
scope.removeCSSDeclaration = CmdRemoveCSSDeclaration;
scope.addCSSDeclaration = CmdAddCSSDeclaration;
scope.mgr = CmdMgr.create();


})( cmd );



////compact cmd
cmd=(function(){

var AbstractCmd = function(){};
AbstractCmd.prototype = {
	execute : function( ){
		return true;
	},
	undo : function( ){
		return true;
	},
	redo : function( ){
		return this.execute();
	},
	toString : function(){ return "Abstract Commande";},
};

/*
 * execute in one round severals cmds 
 */
var CmdMultiple = function(){};
_.extend( CmdMultiple.prototype , AbstractCmd.prototype );
_.extend( CmdMultiple.prototype , {	
	_cmds : null,
	initWithCmds : function( t ){
		this._cmds = t;
	},
	execute : function( ){
		for( var i=0;i<this._cmds.length;i++ )
			this._cmds[ i ].execute();
	},
	undo : function( ){
		for( var i=this._cmds.length-1;i>=0;i-- )
			this._cmds[ i ].undo();
	},
	redo : function( ){
		for( var i=0;i<this._cmds.length;i++ )
			this._cmds[ i ].redo();
	}
} );
CmdMultiple.create = function( ){
	var c = new CmdMultiple();
	c.initWithCmds( arguments );
	return c;
};
CmdMultiple.createWithTab = function( t ){
	var c = new CmdMultiple();
	c.initWithCmds( t );
	return c;
};


var CmdInverse = function( cmd ){
	var i=function(){};
	for( var prop in cmd.prototype )
		i.prototype[ prop ]=cmd.prototype[ prop ];
	i.prototype[ 'execute' ]=cmd.prototype[ 'undo' ];
	i.prototype[ 'undo' ]=cmd.prototype[ 'execute' ]; 
	return i;
};

var AddPackage=function(){};
_.extend( AddPackage.prototype , AbstractCmd.prototype );
_.extend( AddPackage.prototype , {
	datamap:null,
	datapackage:null,
	init:function( datamap , datapackage ){
		this.datamap=datamap;
		this.datapackage=datapackage;
	},
	execute : function( ){
		this.datamap.addPackage( this.datapackage );
	},
	undo : function( ){
		this.datamap.removePackage( this.datapackage );
	},
});
AddPackage.create=function( datamap , datapackage ){
	var c = new AddPackage();
	c.init( datamap , datapackage );
	return c;
};

var RemovePackage=CmdInverse( AddPackage );
RemovePackage.create=function( datamap , datapackage ){
	var c = new RemovePackage();
	c.init( datamap , datapackage );
	return c;
};

var Set=function(){};
_.extend( Set.prototype , AbstractCmd.prototype );
_.extend( Set.prototype , {
	model:null,
	o:null,
	exo:null,
	init:function( model , key , value ){
		this.model=model;
		if( typeof(key)=="object" && value == null )
			this.o=key;
		else{
			this.o={};
			this.o[ key ]=value;
		}
		this.exo={};
		for(var key in this.o )
			this.exo[key]=this.model.get(key);
	},
	execute : function( ){
		this.model.set(this.o);
	},
	undo : function( ){
		this.model.set(this.exo);
	},
});
/**
 * @param {model}model  {object}set of key / value    |  {model}model  {string} key   {object} value
 */
Set.create=function( model , key , value ){
	var c = new Set();
	c.init( model , key , value );
	return c;
};

var AddClass=function(){};
_.extend( AddClass.prototype , AbstractCmd.prototype );
_.extend( AddClass.prototype , {
	dataelement:null,
	className:null,
	init:function( dataelement , className ){
		this.dataelement=dataelement;
		this.className=className;
	},
	execute : function( ){
		this.dataelement.addClass( this.className );
	},
	undo : function( ){
		this.dataelement.removeClass( this.className );
	},
});
AddClass.create=function( dataelement , className ){
	var c = new AddClass();
	c.init( dataelement , className );
	return c;
};

var RemoveClass=CmdInverse( AddClass );
RemoveClass.create=function( dataelement , className ){
	var c = new RemoveClass();
	c.init( dataelement , className );
	return c;
};

var ModifyClass=function(){};
_.extend( ModifyClass.prototype , AbstractCmd.prototype );
_.extend( ModifyClass.prototype , {
	dataelement:null,
	exClassName:null,
	newClassName:null,
	init:function( dataelement , exClassName , newClassName ){
		this.dataelement=dataelement;
		this.exClassName=exClassName;
		this.newClassName=newClassName;
	},
	execute : function( ){
		this.dataelement.removeClass( this.exClassName , {silent:true} );
		this.dataelement.addClass( this.newClassName );
	},
	undo : function( ){
		this.dataelement.removeClass( this.newClassName , {silent:true} );
		this.dataelement.addClass( this.exClassName );
	},
});
ModifyClass.create=function( dataelement , exClassName , newClassName ){
	var c = new ModifyClass();
	c.init( dataelement , exClassName , newClassName );
	return c;
};


var SetProperty=function(){};
_.extend( SetProperty.prototype , AbstractCmd.prototype );
_.extend( SetProperty.prototype , {
	declaration:null,
	key:null,
	value:null,
	exValue:null,
	init:function( declaration , key , value ){
		this.declaration=declaration;
		this.key=key;
		this.value=value;
		this.exValue=this.declaration.get('properties')[key];
	},
	execute : function( ){
		this.declaration.setProperty( this.key , this.value );
	},
	undo : function( ){
		if( this.exValue )
			this.declaration.setProperty( this.key , this.exValue );
		else
			this.declaration.removeProperty( this.key );
	},
});
SetProperty.create=function( declaration , key , value ){
	var c = new SetProperty();
	c.init( declaration , key , value );
	return c;
};

var RemoveProperty=function(){};
_.extend( RemoveProperty.prototype , AbstractCmd.prototype );
_.extend( RemoveProperty.prototype , {
	declaration:null,
	key:null,
	exValue:null,
	init:function( declaration , key ){
		this.declaration=declaration;
		this.key=key;
		this.exValue=this.declaration.get('properties')[key];
	},
	execute : function( ){
		this.declaration.removeProperty( this.key );
	},
	undo : function( ){
		this.declaration.setProperty( this.key , this.exValue );
	},
});
RemoveProperty.create=function( declaration , key ){
	var c = new RemoveProperty();
	c.init( declaration , key );
	return c;
};


var AddPackageToChunk=function(){};
_.extend( AddPackageToChunk.prototype , AbstractCmd.prototype );
_.extend( AddPackageToChunk.prototype , {
	datachunk:null,
	datapackage:null,
	init:function( datachunk , datapackage ){
		this.datachunk=datachunk;
		this.datapackage=datapackage;
	},
	execute : function( ){
		this.datachunk.addPackage(this.datapackage);
	},
	undo : function( ){
		this.datachunk.removePackage(this.datapackage);
	},
});
AddPackageToChunk.create=function( datachunk , datapackage ){
	var c = new AddPackageToChunk();
	c.init( datachunk , datapackage );
	return c;
};

var RemovePackageToChunk = CmdInverse( AddPackageToChunk );
RemovePackageToChunk.create=function( datachunk , datapackage ){
	var c = new RemovePackageToChunk();
	c.init( datachunk , datapackage );
	return c;
};


var AddIntersection=function(){};
_.extend( AddIntersection.prototype , AbstractCmd.prototype );
_.extend( AddIntersection.prototype , {
	datachunk2:null,
	datachunk1:null,
	init:function( datachunk1 , datachunk2 ){
		this.datachunk1=datachunk1;
		this.datachunk2=datachunk2;
	},
	execute : function( ){
		this.datachunk1.addIntersection(this.datachunk2);
	},
	undo : function( ){
		this.datachunk1.removeIntersection(this.datachunk2);
	},
});
AddIntersection.create=function( datachunk1 , datachunk2 ){
	var c = new AddIntersection();
	c.init( datachunk1 , datachunk2 );
	return c;
};

var RemoveIntersection = CmdInverse( AddIntersection );
RemoveIntersection.create=function( datachunk1 , datachunk2 ){
	var c = new RemoveIntersection();
	c.init( datachunk1 , datachunk2 );
	return c;
};

var AddOrDelete = function(){};
_.extend( AddOrDelete.prototype , AbstractCmd.prototype );
_.extend( AddOrDelete.prototype , {
	o:null,
	fa:null,
	fb:null,
	e:null,
	init:function(o,fa,fb,e){
		this.o=o;
		this.fa=typeof(fa)=='string'?o[fa]:fa;
		this.fb=typeof(fb)=='string'?o[fb]:fb;
		this.e=e;
	},
	execute:function(){
		this.fa.call(this.o,this.e);
	},
	undo:function(){
		this.fb.call(this.o,this.e);
	},
});
AddOrDelete.create=function(o,fa,fb,e){
	var c=new AddOrDelete();
	c.init(o,fa,fb,e);
	return c;
};


var SetPolygonStructure=function(){};
_.extend( SetPolygonStructure.prototype , AbstractCmd.prototype );
_.extend( SetPolygonStructure.prototype , {
	datapolygon:null,
	newStructure:null,
	exStructure:null,
	init:function(datapolygon,structure){
		this.datapolygon=datapolygon;
		this.exStructure=L.cloneLatLngArray(this.datapolygon.get('structure'));
		this.newStructure=structure;
	},
	execute:function(){
		this.datapolygon.setStructure(this.newStructure);
	},
	undo:function(){
		this.datapolygon.setStructure(this.exStructure);
	},
});
SetPolygonStructure.create=function(datapolygon,structure){
	var c=new SetPolygonStructure();
	c.init(datapolygon,structure);
	return c;
};


var SwapPackages=function(){};
_.extend( SwapPackages.prototype , AbstractCmd.prototype );
_.extend( SwapPackages.prototype , {
	datapackage1:null,
	datapackage2:null,
	datamap:null,
	init:function(datamap,datapackage1,datapackage2){
		this.datapackage1=datapackage1;
		this.datapackage2=datapackage2;
		this.datamap=datamap;
	},
	execute:function(){
		this.datamap.swapPackages( this.datapackage1 , this.datapackage2 );
	},
	undo:function(){
		this.datamap.swapPackages( this.datapackage1 , this.datapackage2 );
	},
});
SwapPackages.create=function(datamap,datapackage1,datapackage2){
	var c=new SwapPackages();
	c.init(datamap,datapackage1,datapackage2);
	return c;
};



var CmdMgr = function(){};
CmdMgr.prototype = {
	_undoable : null,
	_redoable : null,
	init : function(){
		this._undoable = Stack.createWithCapacity( 50 );
		this._redoable = Stack.createWithCapacity( 50 );
	},
	execute : function( cmd ){
		cmd.execute();
		this._undoable.push( cmd );
	},
	undo : function( ){
		var cmd = this._undoable.pop();
		if( !cmd )
			return;
		cmd.undo();
		this._redoable.push( cmd );
	},
	redo : function( ){
		var cmd = this._redoable.pop();
		if( !cmd )
			return;	
		cmd.redo();
		this._undoable.push( cmd );
	},
};
CmdMgr.create = function(){
	var m = new CmdMgr();
	m.init();
	return m;
};

var mgr=CmdMgr.create();

return{
	'Multi'				:	CmdMultiple,
	
	'AddPackage'		:	AddPackage,
	'RemovePackage'		:	RemovePackage,
	'SwapPackages'		:	SwapPackages,
	
	'Set'				:	Set,
	'SetPolygonStructure'	:	SetPolygonStructure,
	'AddClass'			: 	AddClass,
	'RemoveClass'		: 	RemoveClass,
	'ModifyClass'		: 	ModifyClass,
	
	'RemoveProperty'	:	RemoveProperty,
	'SetProperty'		:	SetProperty,
	
	
	'RemovePackageToChunk' 		:	RemovePackageToChunk,
	'AddPackageToChunk' 		:	AddPackageToChunk,
	
	
	'AddIntersection'	:	AddIntersection,
	'RemoveIntersection':	RemoveIntersection,
	
	'AddOrDelete'		:	AddOrDelete,
	
	'execute'			:	function(cmd){mgr.execute(cmd);},
	'undo'				:	function(){mgr.undo();},
	'redo'				:	function(){mgr.redo();},
};

})();



//// ctrl z - ctrl y listener
$(document).ready(function(){
	$(document).on('keyup' , function(e){
		if(!e.ctrlKey)
			return;
		switch(e.which){
			case 90:
				cmd.undo();
			break;
			case 89:
				cmd.redo();
			break;
		}
	});
});