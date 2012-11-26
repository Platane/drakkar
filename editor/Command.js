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
	_layerCopy : null,
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
		
		// not necessary since the layer is just dereferenced with removeLayer
		//this._layerCopy = this._layer.copy();
		
		
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


var CmdAddLayer = function(){};
extend( CmdAddLayer , AbstractCmd.prototype );
extend( CmdAddLayer , {	
	_layer : null,
	_layerCopy : null,
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
scope.mgr = CmdMgr.create();


})( cmd );

