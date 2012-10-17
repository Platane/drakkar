
var mrc = mrc || {};


( function( scope ){


//enum
var ELEMENT_DOT = 0,
	ELEMENT_PATH = 1;

var PARALELL_SLEEP = 10,
	PARALELL_POINT_PER_CYCLE = 200;

/*
 *
 * draw a unique element
 * return the estimate complexity of the process
 */
var AtomicDraw = function( ctx , el , x , y , w , h , zoom , style ){
	
	ctx.save();
	
	ctx.translate( -x , -y );
	
	ctx.strokeStyle = style.stroke_color;
	ctx.fillStyle = style.fill_color;
	ctx.lineWidth = style.stroke_with;
	
	
	var c = 0;
	
	switch( el.type ){
				
		case ELEMENT_PATH :
					
			ctx.beginPath();
			ctx.moveTo( el.path[ el.path.length-1 ].x , el.path[ el.path.length-1 ].y );
			for( var k = 0 ; k < el.path.length ; k ++ )
				ctx.lineTo( el.path[ k ].x , el.path[ k ].y );
						
			ctx.stroke();
			ctx.fill();
			
			c = el.path.length;
			
		break;
	}
	
	
	ctx.restore();
	
	return c;
	
};

	
var PseudoParallelDrawer = function(){};
PseudoParallelDrawer.prototype = {
	
	_queue : null,
	
	_progression : 0,
	
	_run : false,
	
	_interpret : null,
	
	init : function(){
		
		this._queue = [];
		
		this._interpret = Interpret.create();
	},
	/*
	 * abord the rendering of the tile
	 * return false if the tile could not be found in the queue ( mostly probable it have been drawn already )
	 */
	abord : function( x , y , zoom ){
	
		for( var i = 1; i < this._queue.length ; i ++ )
			if( this._queue[ i ].x == x && this._queue[ i ].y == y && this._queue[ i ].zoom == zoom ){
				this._queue.splice( i , 1 );
				return true;
			}
			
		return false;
	},
	pushToRenderQueue : function( ctx , els , x , y , w , h , zoom , glbAttr , callBackF , callBackO ){
		
		this._queue.push( new PseudoParallelDrawer.Ticket( ctx , els , x , y , w , h , zoom , glbAttr , callBackF , callBackO ) );
		
		if( !this._run ){
			this._progression = 0;
			this.start();
		}
		
	},
	cycle : function(){
		
		var cur = this._queue[ 0 ],
			n = 0;
		
		
		for(  ; this._progression < cur.els.length && n < PARALELL_POINT_PER_CYCLE ; this._progression ++ )
			n += AtomicDraw( 	cur.ctx ,
								cur.els[ this._progression ] ,
								cur.x ,
								cur.y ,
								cur.w ,
								cur.h ,
								cur.zoom ,
								this._interpret.getStyleFor( cur.els[ this._progression ] ,
								cur.glbAttr ) );
								
		
		
		
		cur.ctx.beginPath(  );
		cur.ctx.rect( 20 , 20 , this._progression / cur.els.length * 50 , 10 );
		cur.ctx.fillStyle = "#8956ab";
		cur.ctx.fill();
		
		if( this._progression >= cur.els.length ){
			this._queue.shift();
			
			if( cur.callBackF && cur.callBackO )
				cur.callBackF.call( cur.callBackO  );
			
			if( this._queue.length <= 0 )
				this.stop();
			else
				this._progression = 0;
		}
	},
	timeOutHandler : function(){
		
		
		this.cycle();
		
		var self = this;
		if( this._run )
			setTimeout(function() {
				self.timeOutHandler();
			}, PARALELL_SLEEP );
	},
	stop : function(){
		this._run = false;
	},
	start : function(){
		this._run = true;
		this.timeOutHandler();
	},
};
PseudoParallelDrawer.create = function(  ){
	var i = new PseudoParallelDrawer();
	i.init();
	return i;
};

PseudoParallelDrawer.Ticket = function( ctx , els , x , y , w , h , zoom , glbAttr , callBackF , callBackO ){
	this.ctx = ctx;
	this.els = els;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.zoom = zoom;
	this.glbAttr = glbAttr;
	this.callBackF = callBackF;
	this.callBackO = callBackO;
};

	


var Drawer = function(){};
Drawer.prototype = {
	
	_els : null,
	
	init : function(){
		
	},
	appendElements : function( els ){
		
		this._els = els;
	
	},
	draw : function( ctx , x , y , w , h , zoom ){
		
		ctx.beginPath();
		ctx.arc( 50 , 50 , 30 , 0 , Math.PI*2 );
		ctx.fillStyle = "#58ab62";
		ctx.fill();
	
	},
};
Drawer.create = function(  ){
	var i = new Drawer();
	i.init();
	return i;
};

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
					stroke_with : 2,
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

scope.Interpret = Interpret;
scope.Drawer = Drawer;
scope.PseudoParallelDrawer = PseudoParallelDrawer;

})( mrc );




