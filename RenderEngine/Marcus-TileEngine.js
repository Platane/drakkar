
var mrc = mrc || {};


mrc.engine = function(){};

( function( scope ){



//enum
var ELEMENT_DOT = 0,
	ELEMENT_PATH = 1;

var WorkerAllowed = true;
	
var RECOVER_SIZE = 50;
	
var tileSize = {
	w : 128,
	h : 128
};

//object skeleton for the worker message passing
var WorkerMessage = {
	SendInterpret : function(){
		this.type = "SendInterpret";
		this.interpret = null;
	},
	SendElements : function(){
		this.type = "SendElements";
		this.elements = null;
	},
	SendTileRenderRequest : function(){
		this.type = "SendTileRenderRequest";
		this.x = 0;
		this.y = 0;
		this.zoom = 0;
		this.w = 0;
		this.h = 0;
		this.globalAttributes = null;
	},
};

/*
 * Storage of element,
 * Store n element, if we tre try to store a (n+1)th element, the first whose been pushed is deleted
 * Storage can be iterate with next and resetCursor
 */
var Queue = function(){};
Queue.prototype = {
	_list : null,
	_capacity : 1,
	initWithCapacity : function( c ){
		this._capacity = c;
	},
	push : function( e ){
	
		this._list = {
			e : e,
			next : this._list,
		};
		
		var p = this._list;
		for( var i = 1 ; i < this._capacity && p.next != null ; i ++)
			p = p.next;
		
		if( p.next != null ){
			if( p.next.e.finish != null )
				p.next.e.finish();
			p.next = null;
		}
	},
	pop : function(){
		if( this._list == null )
			return null;
		if( this._list.next == null ){
			var e = this._list.e
			this._list = null;
			return e;
		}
		var p = this._list;
		while( p.next.next != null )
			p = p.next;
		
		var e = p.next.e;
		p.next = null;
		return e;
	},
	/*
	 * return the first matching element, delete it from the queue
	 */
	grab : function( match ){
		if( this._list == null )
			return;
		if( match( this._list.e ) ){
			var e = this._list.e;
			this._list = this._list.next;
			return e;
		}
		var last = this._list, p = this._list;
		while( ( p = p.next ) != null ){
			if(  match( p.e ) ){
				var e = p.e;
				last.next = p.next;
				return e;
			}
			last = p;
		}
		return ;
	},
	flush : function(){
		this.resetCursor();
		
		var i;
		
		while( ( i = this.next() ) != null )
			i.finish();
		
		this._list = null;
	},
	getNbElement : function(){
		this.resetCursor();
		
		var i , nb = 0;
		
		while( ( i = this.next() ) != null )
			nb ++;
			
		return nb;
	},
	getCapacity : function(){
		return this._capacity;
	},
	_cursor : null,
	resetCursor : function(){
		this._cursor = this._list;
	},
	next : function(){
		if( this._cursor == null )
			return null;
		var e = this._cursor.e;
		
		this._cursor = this._cursor.next;
		
		return e;
	},
	toArray : function(){
		this.resetCursor();
		
		var t = [],
			i;
		
		while( ( i = this.next() ) != null )
			t.push( i );
		
		return t;
	},
}
Queue.createWithCapacity = function( c ){
	var q = new Queue();
	q.initWithCapacity( c );
	return q;
}


/*
 *
 * proxy between the tileEngine and the tileRenderer
 * for now its just deleguate the pushToRenderQueue,
 * in the future it could calculate which element collapse with the tile and tell the render to draw only them
 */
var DrawerDelegator = function(){};
DrawerDelegator.prototype = {
	
	_drawer : null,
	
	_els : null,
	
	init : function( elements ){
		
		this._drawer = mrc.PseudoParallelDrawer.create();
		
	},
	
	pushToRenderQueue : function( tile ){
		
		this._drawer.pushToRenderQueue( 	tile.getContext() ,
											this._els,
											tile.getTileX() * tileSize.w ,
											tile.getTileY() * tileSize.h ,
											tileSize.w ,
											tileSize.h ,
											tile.getZoom(),
											{}
										);
			
			
	},
	abord : function( tile ){
	
		return this._drawer.abord( tile.getTileX() * tileSize.w ,
							tile.getTileY() * tileSize.h ,
							tile.getZoom()
							);
	},
};
DrawerDelegator.createWithElements = function( els ){
	var i = new DrawerDelegator();
	i.init( els );
	return i;
};

var Tile = function(){};
Tile.prototype = {
	
	_zoom : 1,
	
	_tilex : 0,
	_tiley : 0,
	
	_canvas : null,
	_ctx : null,
	
	positionFrom : function( viewX , viewY ){
		
		var x = this._tilex * tileSize.w - viewX,
			y = this._tiley * tileSize.h - viewY;
			
		
		this.move( x , y );
	},
	move : function( x , y ){
		this._canvas.css( "top" , y+"px" ); 
		this._canvas.css( "left" , x+"px" ); 
	},
	initWithCoord : function( x , y , zoom , el ){
		
		this.init();
		
		this.unable( x , y , zoom , el );
	},
	init : function(  ){
		
		this._canvas = $("<canvas>");
		
		this._canvas.attr( "width" , tileSize.w );
		this._canvas.attr( "height" , tileSize.h );
		
		this._canvas.css( "width" , tileSize.w+"px" );
		this._canvas.css( "height" , tileSize.h+"px" );
		
		this._canvas.css( "position" , "absolute" );
		
		this._canvas.css( "box-shadow" , "0 0 5px 1px #999 inset" );
		
		this._ctx = this._canvas[0].getContext("2d");
		
	},
	unable : function( x , y , zoom , el ){
		
		this._tilex = x;
		this._tiley = y;
		
		this._zoom  = zoom;
		
		if( el )
			this.attach( el );
		
	},
	disable : function(){
		this.detach();
	},
	finish : function(){
		this.detach();
		this._canvas = null;
	},
	attach : function( el ){
		this._canvas.appendTo( el );
	},
	detach : function(){
		this._canvas.detach();
	},
	getTileX : function(){
		return this._tilex;
	},
	getTileY : function(){
		return this._tiley;
	},
	getZoom : function(){
		return this._zoom;
	},
	getContext : function(){
		return this._ctx;
	},
	clear : function(){
		this._ctx.clearRect( 0 , 0 , tileSize.w , tileSize.h );
	}
};
Tile.createWithCoord = function( x , y , zoom ){
	var t = new Tile();
	t.initWithCoord( x , y , zoom  );
	return t;
};

var TileFactory = function(){};
TileFactory.prototype = {
	
	_closedQueue : null,
	
	initWithCapacity : function( c ){
		
		this._closedQueue = Queue.createWithCapacity( c );
		
		
	},
	
	/*
	 * remove the tile from the displayed Dom 
	 * try to abord the rendering of the tile
	 * if the tile is already drawn ( assuming that if its not in the rendering queue, its drawn ), put it in the buffer queue
	 */
	disableTile : function( tile , dd ){	
		tile.disable();
		
		if( !dd.abord( tile ) )
			this._closedQueue.push( tile );
	},
	
	getTile : function( x , y , zoom , el , dd ){
		
		
		//firstly search if the tile exist in the closedQueue
		var recover;
		if( ( recover = this._closedQueue.grab( function( a ){ 
			return a.getZoom() == zoom &&  a.getTileX() == x && a.getTileY() == y; 
			} )
		) ){
			
			recover.attach( el );
			
			return recover;
			
		};
		
		// if its not found in the closed, we need to draw it
		// acquire a blank tile, either get a new instance or get it from the queue
		if( this._closedQueue.getNbElement() < this._closedQueue.getCapacity() * 0.8 )
			var e = Tile.createWithCoord( x , y , zoom , el );
		else
			var e = this._closedQueue.pop();
		
		e.unable( x , y , zoom , el );
		
		e.clear();
		
		dd.pushToRenderQueue ( e );
		
		return e;
	},
	flush : function(){
		this._closedQueue.flush();
	},
	
};
TileFactory.createWithCapacity = function( c ){
	var t = new TileFactory();
	t.initWithCapacity( c );
	return t;
};

var TileEngine = function(){};
TileEngine.prototype = {
	
	_container : null,
	_screenW : 0,
	_screenH : 0,
	
	_visibleGrid : null,		// matrix of the tile that are currently displayed, indexed as y * w + x
	_gridW : 0,
	_gridH : 0,
	
	_viewX : 0,
	_viewY : 0,
	_viewZoom : 1,
	
	
	_dd : null,
	_tileFactory : null,
	
	
	init : function( element , dd ){
		
		this._container = element;
		
		this._tileFactory = TileFactory.createWithCapacity( RECOVER_SIZE );
		
		this._dd = dd;
		
		this._initTiles();
		
	},
	
	_initTiles : function(){
		
		this._screenW = this._container.width();
		this._screenH = this._container.height();
		
		
		this._gridW = Math.floor( this._screenW / tileSize.w )+2;
		this._gridH = Math.floor( this._screenH / tileSize.h )+2;
		
		
		var originX = Math.floor( this._viewX / tileSize.w ),
			originY = Math.floor( this._viewY / tileSize.h );
		
		this._visibleGrid = new Array( this._gridW * this._gridH );
		
		for( var x = 0 ; x < this._gridW ; x ++ )
		for( var y = 0 ; y < this._gridH ; y ++ ){
			
			var tile = this._tileFactory.getTile( 	originX + x ,
													originY + y ,
													this._viewZoom ,
													this._container ,
													this._dd );
			this._visibleGrid[ x + y * this._gridW ] = tile;
			
		}
		
		this.translate( 0 , 0 );
		
	},
	
	// UI methods
	/*
	 * dx and dy relative
	 */
	translate : function( dx , dy ){
		
		
		this._viewX += dx;
		this._viewY += dy;
		
		if( dx < 0 )
		while( this._visibleGrid[ 0 ].getTileX() * tileSize.w > this._viewX  ){
			// need a new colomn before
			
			// left to right shifting
			for( var y = 0 ; y < this._gridH ; y ++ ){
			
				// delete the right element
				this._tileFactory.disableTile( this._visibleGrid[ this._gridW-1 + y * this._gridW ] , this._dd );
				
				// shift the middle element
				for( var x = this._gridW-2 ; x >= 0 ; x -- )
					this._visibleGrid[ ( x+1) + y * this._gridW ] = this._visibleGrid[ x + y * this._gridW ];
				
				// add the new element
				var tile = this._tileFactory.getTile( 	this._visibleGrid[ y * this._gridW ].getTileX() - 1 ,
														this._visibleGrid[ 0 ].getTileY() + y , 
														this._viewZoom ,
														this._container ,
														this._dd );
				this._visibleGrid[ y * this._gridW ] = tile;
			}
		}
		else
		if( dx > 0 )
		while( ( this._visibleGrid[ this._gridW-1 ].getTileX() +1 ) * tileSize.w < this._viewX + this._screenW ){
			// need a new colomn after
			
			// right to left shifting
			for( var y = 0 ; y < this._gridH ; y ++ ){
			
				// delete the left element
				this._tileFactory.disableTile( this._visibleGrid[ y * this._gridW ] , this._dd );
				
				// shift the middle element
				for( var x = 1 ; x < this._gridW ; x ++ )
					this._visibleGrid[ ( x-1) + y * this._gridW ] = this._visibleGrid[ x + y * this._gridW ];
				
				// add the new element
				var tile = this._tileFactory.getTile( 	this._visibleGrid[ y * this._gridW + this._gridW - 1 ].getTileX() + 1 ,
														this._visibleGrid[ 0 ].getTileY() + y , 
														this._viewZoom ,
														this._container ,
														this._dd );
				this._visibleGrid[ y * this._gridW + this._gridW - 1 ] = tile;
			}
		}
		
		for( var k = 0 ; k < this._visibleGrid.length ; k ++ )
			this._visibleGrid[ k ].positionFrom( this._viewX  , this._viewY );
			
		
	},
	
	/*
	 * zoom , absolute zoom
	 * cx cy , point of zoom, relative to the screen
	 * the point of zoom is the point that after homotety, is at the same position
	 */
	zoom : function( zoom , cx , cy ){
		
		cx = cx || this._screenW/2;
		cy = cy || this._screenH/2;
		
		//calc the new viewport coordonates
		var cx_scene = this._viewX + cx,
			cy_scene = this._viewY + cy;
		
		var nViewX = cx_scene * zoom / this._viewZoom - cx,
			nViewY = cy_scene * zoom / this._viewZoom - cy;
		
		// change the attribute
		this._viewX = nViewX;
		this._viewY = nViewY;
		
		this._viewZoom = zoom;
		
		// ask for tiles update
		var originX = Math.floor( this._viewX / tileSize.w ),
			originY = Math.floor( this._viewY / tileSize.h );
		
		for( var x = 0 ; x < this._gridW ; x ++ )
		for( var y = 0 ; y < this._gridH ; y ++ ){
			
			this._tileFactory.disableTile( this._visibleGrid[ x + y * this._gridW ] , this._dd );
			
			var tile = this._tileFactory.getTile( 	originX + x ,
													originY + y ,
													this._viewZoom ,
													this._container ,
													this._dd );
			this._visibleGrid[ x + y * this._gridW ] = tile;
			
		}
		
		for( var k = 0 ; k < this._visibleGrid.length ; k ++ )
			this._visibleGrid[ k ].positionFrom( this._viewX  , this._viewY );
	
	},
	
	//getters
	getZoom : function(){
		return this._viewZoom;
	},
};
TileEngine.create = function( el , dr ){
	var t = new TileEngine();
	t.init( el , dr );
	return t;
};





// link public function to scope

scope.DrawerDelegator = DrawerDelegator;

scope.TileEngine = TileEngine;

scope.Queue = Queue;

})( mrc );






