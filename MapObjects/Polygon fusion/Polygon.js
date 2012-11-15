

var Polygon = {};

( function( scope ){



var densityAt = function( p , i ){
	
	
	
	
} 



var fusion = function( p1 , p2 , callBack , callBackEnlight , callBackEnlight2 ){
	
	var max_tol = 5;
	
	var marge = 35;
	
	var part = [ 
			[
				{ 
				start : 0,
				end : p1.length,
				box : augmenteBox( getBoundaryBox( p1 ) , marge ),
				links : [],
				}
			],
			[
				{ 
				start : 0,
				end : p2.length,
				box : augmenteBox( getBoundaryBox( p2 ) , marge ),
				links : [],
				}
			],
	];
	
	if( !intersection( part[ 0 ][ 0 ].box , part[ 1 ][ 0 ].box ) )
		return;
	
	
	var p = [ p1 , p2 ];
	
	//circular access
	var cget = function( array , index ){
		return array[ ( index + array.length ) % array.length ];
	};
	var cIndex = function( array , index ){
		return ( index + array.length ) % array.length;
	}
	
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
				box : augmenteBox( getBoundaryBox( p[ next_cut ] , cut.start , between ) , marge),
				links : [],
				},
				{ 
				start : between,
				end : cut.end,
				box : augmenteBox( getBoundaryBox( p[ next_cut ] , between , Math.min( cut.end , p[ next_cut ].length-1 ) ) , marge),
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
	
	if( part[ 0 ].length <= 0 || part[ 1 ].length <= 0 )
		return;
		
	
	
	
	
	var primar = 0,
		secondar = 1;
		
	var grappes = [];
	
	for( var i = 0 ; i < part[ primar ].length ; i ++ ){
		
		// retreive the neighbourn
		for( var j = i+1 ; j < part[ primar ].length ; j ++ ){
			if( cIndex( p[ primar ] , part[ primar ][ i ].start ) == cIndex( p[ primar ] , part[ primar ][ j ].end ) ){
				part[ primar ][ i ].prev = part[ primar ][ j ];
				part[ primar ][ j ].next = part[ primar ][ i ];
			}
			if( cIndex( p[ primar ] , part[ primar ][ j ].start ) == cIndex( p[ primar ] , part[ primar ][ i ].end ) ){
				part[ primar ][ i ].next = part[ primar ][ j ];
				part[ primar ][ j ].prev = part[ primar ][ i ];
			}
		}
		
		//retreive the faced
		for( var k = 0 ; k < part[ secondar ].length ; k ++ )
			if( intersection( part[ primar ][ i ].box , part[ secondar ][ k ].box ) ){
				part[ primar ][ i ].links.push( part[ secondar ][ k ] );
				part[ secondar ][ k ].links.push( part[ primar ][ i ] );
			}
	}
	
	
	/*
	while( part[ primar ].length > 0 ){
		
		
		var start = 0,
			end = 0,
			spart = [];
		
		spart.push( part[ primar ].shift()  );
		
		start = spart[0].start;
		end = spart[0].end;
		
		var finish = false;
		while( !finish ){
			finish = true;
			for( var i = 0 ; i < part[ primar ].length ; i ++ ){
				if( part[ primar ][ i ].start == cIndex( part[ primar ] , end ) ){
					end = part[ primar ][ i ].end;
					spart.push( part[ primar ].splice( i , 1 )[0]  );
					finish = false;
					break;
				}
				if( cIndex( part[ primar ] , part[ primar ][ i ].end ) == start ){
					start = part[ primar ][ i ].start;
					spart.push( part[ primar ].splice( i , 1 )[0]  );
					finish = false;
					break;
				}
			}
		}	
		
		var startS = Infinity,
			endS = -Infinity;
			
		for( var i = 0 ; i < part[ secondar ].length ; i ++ )
			for( var j = 0 ; j < spart.length ; j ++ )
				if( intersection( part[ secondar ][ i ].box , spart[ j ].box ) ){
					startS = Math.min( startS , part[ secondar ][ i ].start );
					endS   = Math.max( endS   , part[ secondar ][ i ].end   );
					part[ secondar ].splice( i , 1 );
					break;
					i--;
				}
		
		grappes.push( {
			startP : start,
			endP : end,
			startS : startS,
			endS : endS,
			
			} );
	}
	*/
	
	var box,
		point,
		match;
	
	// pipe test
	for( var i = 0 ; i < grappes.length ; i ++ ){
		var indexP = grappes[ i ].startP,
			indexS ;
		
		var sensS;
		
		// determine the sens, opposite or the same
		if(  distanceSquare(  p[ primar ][ indexP ] , p[ secondar ][ grappes[ i ].startS ] ) < distanceSquare(  p[ primar ][ indexP ] , p[ secondar ][ grappes[ i ].endS ] ) ){
			indexS = grappes[ i ].startS;
			sensS = 1;
		}else{
			indexS = grappes[ i ].endS;
			sensS = -1;
		}
		
		for( ; indexP < grappes[ i ].endP ; indexP ++ ){
			
			point = p[ primar ][ indexP ];
			
			// test if the point is include in a pipe around
			match = false;
			
			for( var k = indexS ; k != indexS + 30 * sensS ; k += sensS ){
				
				//quick collision ( BBox based )
				
				box = augmenteBox( getBoundaryBox( p[ secondar ] , ((k%p[ secondar ].length)+p[ secondar ].length) % p[ secondar ].length , (((k+sensS)%p[ secondar ].length)+p[ secondar ].length) % p[ secondar ].length , marge ) );
				
				
				if( point.x < box.top.x || point.x > box.bot.x || point.y < box.top.y || point.y > box.bot.y )
					continue;
				
				
				// precise collision
				
				if( !inclusionTube( cget( p[ secondar ] , k ) , cget( p[ secondar ] , k + sensS ) , point , marge ) )
					continue;
					
				
				// check the angle between the two line
				
				var tangente = 
					{ x : cget( p[ primar ] , indexP - 1 ).x - cget( p[ primar ] , indexP + 1 ).x,
					  y : cget( p[ primar ] , indexP - 1 ).y - cget( p[ primar ] , indexP + 1 ).y
					},
					line = 
					{ x : cget( p[ secondar ] , k ).x - cget( p[ secondar ] , k + sensS ).x ,
					  y : cget( p[ secondar ] , k ).y - cget( p[ secondar ] , k + sensS ).y 
					};
				
				if( Math.abs( tangente.x * line.x + tangente.y * line.y ) / Math.sqrt( ( tangente.x * tangente.x + tangente.y * tangente.y ) * ( line.x * line.x + line.y * line.y ) ) < 0.7 )
					continue;
				
				
				indexS = ((k%p[ secondar ].length)+p[ secondar ].length) % p[ secondar ].length;
				match = true;
				break;
			}
			
			if( match ){
				if( callBackEnlight )
					callBackEnlight.f.call( callBackEnlight.o , point );
				
			} else
				if( callBackEnlight2 )
					callBackEnlight2.f.call( callBackEnlight2.o , point );
				
		
		
		}
	}
	
	return;
}; 
var distanceSquare = function( A , B  ){

	var x = A.x - B.x,
		y = A.y - B.y;
	return ( x*x + y*y );
};
var inclusionTube = function( A , B , C , l ){

	
	var AB = {
		x : B.x - A.x,
		y : B.y - A.y
	},
		AC = {
		x : C.x - A.x,
		y : C.y - A.y
	};
	
	//distance C to the line A  , B
	var n = Math.sqrt( AB.x * AB.x + AB.y * AB.y );
	
	AB.x /= n;
	AB.y /= n;
	
	var d = Math.abs( AB.x * AC.y - AC.x * AB.y );
	
	if( d > l )
		return false;
	
	//distance of the projection of C on the line 
	var scal = ( AB.x * AC.x + AC.y * AB.y )/( n );
	
	if( scal >= 0 && scal <= 1 )
		return true;
		
	// distance of C from A
	if(  AC.x * AC.x + AC.y * AC.y  < l*l )
		return true;
		
	// distance of C from B
	var	BC = {
		x : C.x - B.x,
		y : C.y - B.y
	};

	if(  BC.x * BC.x + BC.y * BC.y < l*l )
		return true;

	return false;
};
var intersection = function( b1 , b2 ){
	
	return ( b1.top.x < b2.bot.x && b2.top.x < b1.bot.x ) && ( b1.top.y < b2.bot.y && b2.top.y < b1.bot.y );

}
var augmenteBox = function(  box , marge ){
	
	box.top.x -= marge;
	box.top.y -= marge;
	box.bot.x += marge;
	box.bot.y += marge;

	return box;
};
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
		if( !point )
			console.log("");
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



scope.inclusionTube = inclusionTube;
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
		
		ctx.save();
		
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
		ctx.restore();
	} },
	{o:this,f:function( p ){
		var ctx = hight[ 0 ].getContext( "2d" );
		
		ctx.save();
		
		ctx.strokeStyle = "#babd12";
		ctx.lineWidth = 3;
		
		ctx.beginPath();
		ctx.arc( p.x , p.y , 5 , 0 , Math.PI*2 );
		ctx.stroke();
			
		ctx.restore();
	} },
	{o:this,f:function( p ){
		var ctx = hight[ 0 ].getContext( "2d" );
		
		ctx.save();
		
		ctx.strokeStyle = "#babd12";
		ctx.lineWidth = 1;
		
		ctx.beginPath();
		ctx.arc( p.x , p.y , 3 , 0 , Math.PI*2 );
		ctx.stroke();
			
		ctx.restore();
	} });
}



( function ( el ){

	var drag = false,
		anchor = {x:0 , y:0},
		currentP = -1,
		polys = [ [{x:50,y:50}] , [] ];
	
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
				
				if( d > 25 )
					polys[ currentP ].push( p );
				
			};
	var stopMove = function( e ){
				if( !drag  )
					return;
				
				
				drag = false;
				
				if( currentP == 1 ){
					el.unbind( ).bind( "mousedown" , go );
					ps = polys;
					/*
					el.bind( "mousemove" , function( e ){
						var p = {
							x : e.offsetX,
							y : e.offsetY
						};
						
						console.log( Polygon.inclusionTube( polys[0][0] , polys[0][1] , p , 50 ) );
						
					});*/
					
				}
			};
			
	el.bind( "mousedown" , startMove );
	el.bind( "mousemove" , move );
	el.bind( "mouseup" , stopMove );

	
	



} )( $("#container") );

};

