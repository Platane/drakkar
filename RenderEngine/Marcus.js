
var mrc = mrc || {};


mrc.engine = function(){};

( function( scope ){



//enum
var ELEMENT_DOT = 0,
	ELEMENT_PATH = 1;
	
var tileSize = {
	w : 128,
	h : 128
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
		this._capacity = c
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
			if( p.next.finish != null )
				p.next.finish();
			p.next = null;
		}
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
 * know how to style an element
 * gather information from the .mss file
 */
var Interpret = function(){};
Interpret.prototype = {

	init : function(){
	
	
	
	},
	
	getStyleFor : function( attrEl , attrGlob ){
		
		switch( attrEl.type ){
			
			case  ELEMENT_DOT :
				
				return { 
					stroke_color : "#586b5a",
					stroke_with : 10,
					fill_color : "#586412",
					icon_path : "M0,0l10,0l0,10l-10,0l0,-10z",
				};
			
			
			case  ELEMENT_PATH :
				
				return { 
					stroke_color : "#596968",
					stroke_with : 10,
					fill_color : "#02ab95",
				};
				
		}
		
	},

};
Interpret.create = function(  ){
	var i = new Interpret();
	i.init();
	return i;
};

var Drawer = function(){};
Drawer.prototype = {
	
	_elements : null,
	
	_interpret : null,
	
	init : function( elements ){
		
		this._elements = elements;
		
		this._interpret = Interpret.create();
	},
	
	pushToRenderQueue : function( tile ){
		
		this.drawTile( tile );
		
	},
	
	/*
	 * draw the map on the context,
	 * draw the rect define by s, the top left corner of the rect and w, h it size
	 */
	drawTile : function( tile ){
		
		var el, style;
		
		
		var ctx = tile.getContext();
		
		ctx.clearRect( 0 , 0 , tileSize.w , tileSize.h );
		
		ctx.save();
		
		ctx.translate( -tile.getTileX() * tileSize.w , -tile.getTileY() * tileSize.h );
		
		for( var i = 0 ; i < this._elements.length ; i ++ ){
			
			el = this._elements[ i ];
			
			style = this._interpret.getStyleFor( el );
			
			ctx.save();
			
			ctx.strokeStyle = style.stroke_color;
			ctx.fillStyle = style.fill_color;
			ctx.lineWidth = style.stroke_with;
			
			
			switch( el.type ){
				
				case ELEMENT_PATH :
					
					ctx.beginPath();
					ctx.moveTo( el.path[ el.path.length-1 ].x , el.path[ el.path.length-1 ].y );
					for( var k = 0 ; k < el.path.length ; k ++ )
						ctx.lineTo( el.path[ k ].x , el.path[ k ].y );
					
					ctx.stroke();
					ctx.fill();
					
					
					
				break;
			}
			
			ctx.restore();
		}
		
		
		ctx.restore();
		
	},
	getBBox : function(){
	
	
	},
};
Drawer.createWithElements = function( els ){
	var i = new Drawer();
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
		
		this._tilex = x;
		this._tiley = y;
		
		this._zoom  = zoom;
		
		
		this._canvas = $("<canvas>");
		
		this._canvas.attr( "width" , tileSize.w );
		this._canvas.attr( "height" , tileSize.h );
		
		this._canvas.css( "width" , tileSize.w+"px" );
		this._canvas.css( "height" , tileSize.h+"px" );
		
		this._canvas.css( "position" , "absolute" );
		
		this._canvas.css( "box-shadow" , "0 0 5px 1px #999 inset" );
		
		this._canvas.appendTo( el );
		
		this._ctx = this._canvas[0].getContext("2d");
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
	getContext : function(){
		return this._ctx;
	},
};
Tile.createWithCoord = function( x , y , zoom ){
	var t = new Tile();
	t.initWithCoord( x , y , zoom  );
	return t;
};


var TileEngine = function(){};
TileEngine.prototype = {
	
	_container : null,
	_screenW : 0,
	_screenH : 0,
	_tiles : null,
	
	_unused : null,				// tiles that arent displayed on the screen, we saved them in a limited queue, in case the user reverse it move
	
	_visibleGrid : null,		// matrix of the tile that are currently displayed, indexed as y * w + x
	_gridW : 0,
	_gridH : 0,
	
	_viewX : 0,
	_viewY : 0,
	_viewW : 0,
	_viewH : 0,
	_viewZoom : 1,
	
	_sceneW : 0,
	_sceneH : 0,
	
	
	_drawer : null,
	
	
	init : function( element , drawer ){
		
		this._container = element;
		
		this.unused = Queue.createWithCapacity( 20 );
		
		this._drawer = drawer;
		
		this._initTiles();
		
	},
	
	_initTiles : function(){
		
		this._screenW = this._container.width();
		this._screenH = this._container.height();
		
		
		this._gridW = Math.floor( this._screenW / tileSize.w )+2;
		this._gridH = Math.floor( this._screenH / tileSize.h )+2;
		
		
		this._tiles = new Array( this._gridW * this._gridH );
		
		var originX = Math.floor( this._viewX / tileSize.w ),
			originY = Math.floor( this._viewY / tileSize.h );
		
		this._visibleGrid = new Array( this._gridW * this._gridH );
		
		for( var x = 0 ; x < this._gridW ; x ++ )
		for( var y = 0 ; y < this._gridH ; y ++ ){
			
			var tile = Tile.createWithCoord( originX + x , originY + y , this._viewZoom );
			tile.attach( this._container );
			
			this._drawer.pushToRenderQueue( tile );
			
			this._visibleGrid[ x + y * this._gridW ] = tile;
			
		}
		
		this.translate( 0 , 0 );
		
	},
	translate : function( dx , dy ){
		
		
		this._viewX += dx;
		this._viewY += dy;
		
		if( dx < 0 )
		while( this._visibleGrid[ 0 ].getTileX() * tileSize.w > this._viewX  ){
			// need a new colomn before
			
			// left to right shifting
			for( var y = 0 ; y < this._gridH ; y ++ ){
			
				// delete the right element
				this._visibleGrid[ this._gridW-1 + y * this._gridW ].finish();
				
				// shift the middle element
				for( var x = this._gridW-2 ; x >= 0 ; x -- )
					this._visibleGrid[ ( x+1) + y * this._gridW ] = this._visibleGrid[ x + y * this._gridW ];
				
				// add the new element
				var tile = Tile.createWithCoord( this._visibleGrid[ y * this._gridW ].getTileX() - 1 , this._visibleGrid[ 0 ].getTileY() + y , this._viewZoom );
				tile.attach( this._container );
				this._drawer.pushToRenderQueue( tile );
				
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
				this._visibleGrid[ y * this._gridW ].finish();
				
				// shift the middle element
				for( var x = 1 ; x < this._gridW ; x ++ )
					this._visibleGrid[ ( x-1) + y * this._gridW ] = this._visibleGrid[ x + y * this._gridW ];
				
				// add the new element
				var tile = Tile.createWithCoord( this._visibleGrid[ y * this._gridW + this._gridW - 1 ].getTileX() + 1 , this._visibleGrid[ 0 ].getTileY() + y , this._viewZoom );
				tile.attach( this._container );
				this._drawer.pushToRenderQueue( tile );
				
				this._visibleGrid[ y * this._gridW + this._gridW - 1 ] = tile;
			}
		}
		
		for( var k = 0 ; k < this._visibleGrid.length ; k ++ )
			this._visibleGrid[ k ].positionFrom( this._viewX  , this._viewY );
			
		
	},
	
	

};
TileEngine.create = function( el , dr ){
	var t = new TileEngine();
	t.init( el , dr );
	return t;
};





// link public function to scope
scope.MSSInterpret = Interpret;

scope.Drawer = Drawer;

scope.TileEngine = TileEngine;


})( mrc );



// mss reader related
mrc.Mss = mrc.Mss || {};





