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
			this._tab.splice( n , this._tab.length - this._n );
	
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
scope.alterCSSDeclaration = CmdAlterCSSDeclaration;
scope.mgr = CmdMgr.create();


})( cmd );

