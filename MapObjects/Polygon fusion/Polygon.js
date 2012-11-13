

var Polygon = {};

( function( scope ){



var densityAt = function( p , i ){
	
	
	
	
} 



var fusion = function( p1 , p2 , callBack ){
	
	var max_tol = 5;
	
	var part = [ 
			[
				{ 
				start : 0,
				end : p1.length-1,
				box : getBoundaryBox( p1 ),
				links : [],
				}
			],
			[
				{ 
				start : 0,
				end : p2.length-1,
				box : getBoundaryBox( p2 ),
				links : [],
				}
			],
	];
	var p = [ p1 , p2 ];
	
	var next_cut = 0,
		cut,
		cust,
		between,
		opposite;
	
	
	while( true ){
		
		if( part[ next_cut ].length <= 0 )
			break;
		
		// get the next chunk to be cut
		cut = part[ next_cut ].shift();
		
		
		if( cut.end  - cut.start  < 10 )
			break;
		
		
		// point of cut
		between = Math.floor( ( cut.start + cut.end )/2 );
		
		cuts = [ 
				{ 
				start : cut.start,
				end : between,
				box : getBoundaryBox( p[ next_cut ] , cut.start , between ),
				links : [],
				},
				{ 
				start : between,
				end : cut.end,
				box : getBoundaryBox( p[ next_cut ] , between , cut.end ),
				links : [],
				}
		];
		
		
		// collision test
		opposite = ( next_cut +1 )%2;
		
		for( var k = 0 ; k < 2 ; k ++ ){
			for( var i = 0 ; i < part[ opposite ].length ; i ++ )
				if( intersection( cuts[ k ].box , part[ opposite ][ i ].box ) )
					break;
				
			if( i < part[ opposite ].length )
				part[ next_cut ].push( cuts[ k ] );
		}
		
		if( callBack )
			callBack.f.call( callBack.o , part );
		
		next_cut = ( next_cut +1 )%2;
	}
	
	
}; 

var intersection = function( b1 , b2 ){
	
	return ( b1.top.x < b2.bot.x && b2.top.x < b1.bot.x ) && ( b1.top.y < b2.bot.y && b2.top.y < b1.bot.y );

}
var getBoundaryBox = function( p , start , end ){
	
	start = start || 0;
	end = end || p.length-1;
	
	var topx = Infinity,
		topy = Infinity,
		botx = -Infinity,
		boty = -Infinity;
	
	var point;
	for( var i = start ; i <= end ; i ++ ){
		point = p[ i ];
		if( point.x > botx )
			botx = point.x;
		if( point.x < topx )
			topx = point.x;
		if( point.y > boty )
			boty = point.y;
		if( point.y < topy )
			topy = point.y;
	}
	return { bot : {x : botx , y : boty } , top : { x : topx , y : topy } };
};




scope.fusion = fusion;

} )( Polygon );







window.onload = function(){

var root = $("#container");

var w = $("#container").width(),
	h = $("#container").height();

var low = $('<canvas style="position:absolute;top:0px"></canvas>').attr( "width" , w ).attr( "height" , h ).css({ "width" : w , "height"  : h });
var hight = $('<canvas style="position:absolute;top:0px"></canvas>').attr( "width" , w ).attr( "height" , h ).css({ "width" : w , "height"  : h });

low.appendTo( root );
hight.appendTo( root );

var ps ;

function go( ){
	
	var ctx = low[0].getContext( "2d" );
	
	ctx.strokeStyle = "#babd12";
	
	ctx.beginPath();
	ctx.moveTo( ps[0][ 0 ].x , ps[0][ 0 ].y );
	for( var i = 0 ; i < ps[ 0 ].length ; i ++ )
		ctx.lineTo( ps[0][ i ].x , ps[0][ i ].y );
	ctx.stroke();
	
	ctx.strokeStyle = "#c54ae2";
	
	ctx.beginPath();
	ctx.moveTo( ps[1][ 0 ].x , ps[1][ 0 ].y );
	for( var i = 0 ; i < ps[ 1 ].length ; i ++ )
		ctx.lineTo( ps[1][ i ].x , ps[1][ i ].y );
	ctx.stroke();
	
	
	Polygon.fusion( ps[ 0 ] , ps[ 1 ] , {o:this,f:function( part ){
		var ctx = hight[ 0 ].getContext( "2d" );
		
		ctx.clearRect( 0 , 0 , w , h );
		
		ctx.globalAlpha = 0.5;
		
		ctx.strokeStyle = "#babd12";
		for( var i = 0 ; i < part[ 0 ].length ; i ++ ){
			
			var box = part[ 0 ][ i ].box;
			
			ctx.beginPath();
			ctx.rect( box.top.x , box.top.y , box.bot.x - box.top.x , box.bot.y - box.top.y );
			ctx.stroke();
			
		}
		ctx.strokeStyle = "#c54ae2";
		for( var i = 0 ; i < part[1].length ; i ++ ){
			
			var box = part[ 1 ][ i ].box;
			
			ctx.beginPath();
			ctx.rect( box.top.x , box.top.y , box.bot.x - box.top.x , box.bot.y - box.top.y );
			ctx.stroke();
			
		}
		
	} } );
}



( function ( el ){

	var drag = false,
		anchor = {x:0 , y:0},
		currentP = -1,
		polys = [ [] , [] ];
	
	var startMove = function( e ){
				
				if( currentP == 1 )
					return;
					
				currentP ++;	
					
				drag = true;
				
				var p = {
					x : e.offsetX,
					y : e.offsetY
				};
				
				polys[ currentP ].push( p );
				
			};
	var move = function( e ){
				if( !drag )
					return;
				
				var p = {
					x : e.offsetX,
					y : e.offsetY
				};
				var last = polys[ currentP ][  polys[ currentP ].length -1 ];
				
				var d = Math.sqrt( (p.x - last.x)*(p.x - last.x) + (p.y - last.y)*(p.y - last.y) );
				
				if( d > 10 )
					polys[ currentP ].push( p );
				
			};
	var stopMove = function( e ){
				if( !drag  )
					return;
				
				
				drag = false;
				
				if( currentP == 1 ){
					el.unbind( ).bind( "mousedown" , go );
					ps = polys;
					
				}
			};
			
	el.bind( "mousedown" , startMove );
	el.bind( "mousemove" , move );
	el.bind( "mouseup" , stopMove );

	
	



} )( $("#container") );

};

