
L.PolyUtil.collisionCircleToPolygon=function( c , r , polygon ){

	// in order to win a few precious second, several adjustement have been done that dont make the code so easy to read,
	// the object are used the less possible, ( for exemple an object point ( x , y ) is replace by the two number ox , oy
	// store the value of length for the loop on the array does speed up noticablely the execution
	// the use of Math.pow for a rise to square is a millisecond pit, compare to a simple a * a
	
	
	// order of the vertex, ( counterclockwise or clockwise )
	// because the polygone is not restricted to an order ( it can be wether one or the other )
	var ref = ( polygon[ 1 ].x - polygon[ 0 ].x ) * ( polygon[ 2 ].y - polygon[ 1 ].y ) + ( polygon[ 0 ].y - polygon[ 1 ].y ) * ( polygon[ 2 ].x - polygon[ 1 ].x ) >= 0; 
	
	var square_r = r *r;
	var len = polygon.length;
	
	//
	// first, discard the circle if it is too far from the edge ( and in the wrong side of side of this edge )
	// lets use the loop to determine the closest vertex, usefull for the second part
	
	var ax = polygon[ len-1 ].x , ay = polygon[ len-1 ].y ,
		cx = c.x , cy = c.y,
		cbx , cby ,
		bx , by , 
		abx, aby,
		min_dist = Infinity ,
		det  ,  closest_p , square_CB ;
		
	for( var i = 0 ; i < len ; i ++ ){
		bx = polygon[ i ].x;
		by = polygon[ i ].y
		
		cbx = bx - cx;
		cby = by - cy;
		
		abx = bx - ax;
		aby = by - ay;
		
		det = abx  *  cby - aby  *  cbx ;
		
		// check if too far from the edge
		if( det >= 0 == ref ){
			// the center is outside the edge a b
			// if the distance from the line a b to the center is up to it radius, the collision can not be
			if( square_r < det * det / ( abx*abx + aby*aby ) ) // prevent the use of squareRoot ( rise to square the two hands )
				return false;
		}
		
		// check for the closest vertex to the center
		square_CB = cbx*cbx + cby*cby;
		if( min_dist > square_CB ){
			//check if the point b is in the circle
			if( square_CB < square_r ) // notice that this test will be run later, its a test for an early exit, skipping the the edge in the loop 
				return true;
			min_dist = square_CB;
			closest_p = i;
		}
		ax = bx;
		ay = by;
	}
	
	// 
	// the center is include in a domain that have the shape of the polygon with a expansion of the value of the radius
	// the only domain remaining where the circle does not collapse is in the corner of this expanded shape, 
	// lets check if the center of the circle is in the last domain, delimited by the two line that form the closest vertex ( the line formed by the vertex and the previous one, and the vertex and the next one )
	
	var prev = polygon[ ( closest_p -1 + len ) % len ];
	var next = polygon[ ( closest_p +1 ) % len ];
	
	var CloseCx = c.x - polygon[ closest_p ].x ,
		CloseCy = c.y - polygon[ closest_p ].y ;
	
	if( 	( prev.x - polygon[ closest_p ].x ) * CloseCx + ( prev.y - polygon[ closest_p ].y ) * CloseCy < 0		
		 &&	( next.x - polygon[ closest_p ].x ) * CloseCx + ( next.y - polygon[ closest_p ].y ) * CloseCy < 0		// in the domain
		 &&  CloseCx * CloseCx + CloseCy * CloseCy > square_r  )
			return false;
			
	return true;
};

L.PolyUtil.collideWrap=function(points,point,r){
	
	
	var ax=points[0].x,
		ay=points[0].y,
		
		cx=point.x,
		cy=point.y,
		
		bx,by,
		
		det,
		scal,
		
		ab_square,
		r_square=r*r,
		
		i=points.length;
	while(i--){
		bx=points[i].x;
		by=points[i].y;
		
		cbx = bx - cx;
		cby = by - cy;
		
		abx = bx - ax;
		aby = by - ay;
		
		det = abx  *  cby - aby  *  cbx ;	//det
		
		ab_square = abx*abx + aby*aby;		// length of ab
		
		if( r_square >= det * det /ab_square  ){
			// c is in the infinite hull of the a b vertex
			
			scal= abx*cbx + aby*cby;
			
			if( scal > 0 && scal < ab_square ){
				//the projection of c to ab is on ab
				//that fact + c in the infinite hull = c is in the limited hull
				// ???
				// profit !
				
				//compute some usefull elements
				var n=scal/ab_square;
				var p={
					x: bx - abx*n,
					y: by - aby*n
				};
				return {'b':(i+1),
						'a':(i),
						'p':p
						};
			}
		}
		
		
		ax=bx;
		ay=by;
	}
	
	return null;
};

/**
 * return an array of Polygon, each one is convexe and all form a partition of the polygon given in argument
 * @function
 * @param { Array of Point } polygon
 * @return { Array of Array of Point }  
 * Constructor
 */
L.PolyUtil.splitInConvexesEars = function(polygon){

	// we will use the det for determinate if the point is in or out a side,
	// we dont know if a positif mean out or inside, ( because the is no restriction on the order of the corner )
	// we will perform a check, on all the corner and determine which is the most common 

	// +1 for each positive det , -1 for each neg
	var sum_order = 0;

	var each_order = new Array( polygon.length );

	var a = polygon[ polygon.length -2 ] , b = polygon[ polygon.length -1 ] , c;

	for( var k = 0 ; k < polygon.length ; k ++ ){

		// a then b then c

		c = polygon[ k ];

		// check if c is on the right side of the edge a b

		var det = ( a.x - b.x ) * ( c.y - b.y ) + ( b.y - a.y ) * ( c.x - b.x );

		if( det >= 0 ){
			each_order[ ( k-1+polygon.length)%polygon.length ] = true;
			sum_order ++;
		} else {
			each_order[ ( k-1+polygon.length)%polygon.length ] = false;
			sum_order --;
		}
		a = b;
		b = c;
	}

	// it is convexe
	if( Math.abs( sum_order ) == polygon.length )
		return [ polygon ];


	// lets assume the majority of vertex will not be notch
	// so if sum_order is positive we got a majority of positive det, so assume that a non not vertex has a positive vertex ( respectively negative )
	var order = sum_order >= 0 ;


	var notchs = [];
	var notch = null;
	var A , B , Av1 , Av2;
	for( var i = 0 ; i < each_order.length ; i ++ ){
		if( each_order[ i ] == order )
			continue;

		notch = {
			i : i ,
			link : [ (i+1)%polygon.length ]
			};

		A = polygon[ i ];
		Av2 = { x : A.x - polygon[ (i+1)%polygon.length ].x ,
				y : A.y - polygon[ (i+1)%polygon.length ].y  }; // prev neightbour vect
		Av1 = { x : polygon[ (i-1+polygon.length)%polygon.length ].x - A.x ,
				y : polygon[ (i-1+polygon.length)%polygon.length ].y - A.y }; // next neightbour vect


		// check the linkability with all the vertex
		var j;
		for( var aj = 2 ; aj < polygon.length - 1 ; aj ++ ){

			j = (i+aj)%polygon.length

			B = polygon[ j ];

			// check the direction of AB ( need to be inside the polygon, at least localy )
			if( ( B.x - A.x ) * Av1.y + ( A.y - B.y ) * Av1.x > 0 == order 			// right side of first neightbour
			 && ( B.x - A.x ) * Av2.y + ( A.y - B.y ) * Av2.x > 0 == order )		// right side of second neightbour
				continue;

			// check the exit on the segment A B
			var accept = true;
			for( var k = 1 ; k < polygon.length - 1 ; k ++ ){
				if( ( j + k + 1 ) % polygon.length == i  ){ // dont check the intersection with a segment that pass by A ( meaning the segment xA and Ax ) 
					k ++; 	// skip the segment Ax
					continue;
				}
				if( false != cc.Polygon.intersectionSegmentSegment( A , B , polygon[ ( j + k ) % polygon.length ] ,  polygon[ ( j + k + 1 ) % polygon.length ] ) ){
					accept = false;
					break;
				}
			}
			if( accept )
				notch.link.push( j );
		}

		notch.link.push( ( i-1+polygon.length)%polygon.length );

		notchs.push( notch );
	}

	// estimation of the largest sub poly
	for( var i = 0 ; i < notchs.length ; i ++ ){

		var er = [ notchs[ i ].i  ];
		for( var k = notchs[ i ].link.length-1 ; k >= 0 ; k -- ){
			var l = notchs[ i ].link[ k ];
			if( l != ( er[ 0 ] -1 + polygon.length ) % polygon.length || each_order[ l ] != order )
				break;	
			var e = polygon[ l ];
			if( er.length > 2 ){

				// if we add e to the stack, does it stiff form a convex polygon
				// check for the convexity of the new coner
				var a  = polygon[ er[ 0 ] ],								// corner next
					b  = polygon[ er[ 1 ] ];
				var det = ( a.x - b.x ) * ( e.y - b.y ) + ( b.y - a.y ) * ( e.x - b.x );
				if( det > 0 != order )
					break;

				var a  =  polygon[ er[ ( er.length-2 + er.length )% er.length ] ],		// corner prev
					b  =  polygon[ er[ ( er.length-1 + er.length )% er.length ] ];
				var det = ( e.x - a.x ) * ( b.y - a.y ) + ( a.y - e.y ) * ( b.x - a.x );
				if( det > 0 != order )
					break;

				var a  =  polygon[ er[ ( er.length-1 + er.length )% er.length ] ],		// corner new 
					b  =  polygon[ er[ 0 ] ];
				var det = ( a.x - e.x ) * ( b.y - e.y ) + ( e.y - a.y ) * ( b.x - e.x );
				if( det > 0 != order )
					break;
			}
			er.unshift( l );
		}

		var ea = [ notchs[ i ].i  ];
		for( var k = 0 ; k < notchs[ i ].link.length ; k ++ ){
			var l = notchs[ i ].link[ k ];
			if( l != ( ea[ ea.length - 1 ] +1 ) % polygon.length || each_order[ l ] != order ) // point have to be consecutive, l have to be next ,
				break;	
			var e = polygon[ l ];
			if( ea.length > 2 ){

				// if we add e to the stack, does it stiff form a convex polygon
				// check for the convexity of the new coner
				var a  =  polygon[ ea[ ( ea.length-2 + ea.length )% ea.length ] ],		// corner prev
					b  =  polygon[ ea[ ( ea.length-1 + ea.length )% ea.length ] ];
				var det = ( a.x - b.x ) * ( e.y - b.y ) + ( b.y - a.y ) * ( e.x - b.x );
				if( det > 0 != order )
					break;

				var a  =  polygon[ ea[ 0% ea.length ] ],										// corner next
					b  =  polygon[ ea[ 1% ea.length ] ];
				var det = ( e.x - a.x ) * ( b.y - a.y ) + ( a.y - e.y ) * ( b.x - a.x );
				if( det > 0 != order )
					break;

				var a  =  polygon[ ea[ ( ea.length-1 + ea.length )% ea.length ] ],		// corner new 
					b  =  polygon[ ea[ 0% ea.length ] ];
				var det = ( a.x - e.x ) * ( b.y - e.y ) + ( e.y - a.y ) * ( b.x - e.x );
				if( det > 0 != order )
					break;
			}
			ea.push( l );
		}

		if( er.length > ea.length )
			ea = er;

		if( ea.length > 2 ){
			// form the dual polygon
			var dual = [];
			var next = ea[ ea.length-1 ];
			while( next != ea[ 0 ] ){
				dual.push( polygon[ next ] );
				next = ( next + 1 ) % polygon.length;
			}
			dual.push( polygon[ next ] );

			var stack = [];
			for( var k = 0 ; k < ea.length ; k ++ )
				stack.push( polygon[ ea[ k ] ] );
			return [ stack ].concat( cc.Polygon.splitInConvexesEars( dual ) );

			//return [ stack ];
		}
	}

	return null;
};



L.cloneLatLngArray = function( a ){
	var b = new Array( a.length );
	var i = a.length;
	while(i--) b[i]=new L.LatLng(a[i].lat,a[i].lng);
	return b;
};

///////////////////////
// true trustable data ////
///////////////////////

var AbstractDataElement = Backbone.Model.extend({
    stamp:null,
	type:'abstract',
	parent:null,
	defaults: function() {
      return {
        name: null,
		classes:{},
		attributes:{},
      };
    },
	generateStamp: function(){
		return 'obj'+(AbstractDataElement.count++);
	},
    initialize: function() {
	  this.stamp=this.generateStamp();
	  if(!this.get('name'))
		this.set({'name':this.getStamp()});
    },
	getStamp:function(){
		return this.stamp;
	},
    getParent:function(){
		return this.parent;
	},
	hasClass:function(c){
		return this.get("classes")[c]===true;
	},
	addClass: function(c) {
		var cs=this.get("classes");
		cs[c]=true;
		this.set({"classes":cs});
		this.trigger('change');
		this.trigger('change:classes');
    },
	removeClass: function(c) {
		var cs=this.get("classes");
		cs[c]=null;
		delete cs[c];
		this.set({"classes":cs});
		this.trigger('change');
		this.trigger('change:classes');
    },
	clone:function(){
		return new AbstractDataElement({'name':this.get('name') , 'classes':_.clone( this.get('classes') ) , 'attributes':_.clone( this.get('attributes') ) } );
	},
});
AbstractDataElement.count=0;

var DataMap = AbstractDataElement.extend({
    children:null,
	
	defaults: _.extend({
      
    }, AbstractDataElement.prototype.defaults() ),
	initialize: function(attr,options) {
		DataMap.__super__.initialize.call(this,attr,options);
		this.children=new Backbone.Collection();
		this.children.model=DataPackage;
		this.type='map';
	},
	addPackage:function(datapackage){
		this.children.add(datapackage);
		datapackage.parent=this;
	},
	removePackage:function(p){
		if( typeof(p)=="string" )
			if( p.substr(0,3)=="obj" ){
				p=this.children.find( function(a){return a.getStamp()==p;}); 
			}else{
				console.log('deleting an element using backbone cid is not recommanded, because of the delaguator class midle data');
				p=this.children.get(p);
			}
		else
			p=this.children.get(p);
		if(p){
			this.children.remove(p);
			p.destroy();
		}
	},
});

var DataPackage = AbstractDataElement.extend({
    children:null,
	defaults: _.extend({
      
    }, AbstractDataElement.prototype.defaults() ),	
	initialize: function(attr,options) {
		DataPackage.__super__.initialize.call(this,attr,options);
		this.type='package';
		this.children=new Backbone.Collection();
		this.children.model=AbstractDataElement;
	},
	addElement:function(el){
		if(el instanceof AbstractDataElement ){
			this.children.add(el);
			el.parent=this;
		}else
			switch(el.type){
				case "polygon":
					var d=new DataPolygon(el);
					d.parent=this;
					this.children.add(d);
				break;
			}
	},
	removeElement:function(el){
		var el;
		if( typeof(el)=="string" )
			if( el.substr(0,3)=="obj" ){
				el=this.children.find( function(a){return a.getStamp()==el;}); 
			}else{
				console.log('deleting an element using backbone cid is not recommanded, because of the delaguator class midle data');
				el=this.children.get(el);
			}
		else
			el=this.children.get(el);
		if(el){
			this.children.remove(el);
			el.destroy();
		}
	},
	clone:function(cloneStamp){
		var c=new DataPackage({
			'name':this.get('name') , 
			'classes':_.clone( this.get('classes') ) , 
			'attributes':_.clone( this.get('attributes') ) 
		});
		var cl=[];
		this.children.each(function(e){
			var de=e.clone(cloneStamp)
			cl.push(de);
			de.parent=c;
		});
		c.children.reset(cl);
		if(cloneStamp!=null&&cloneStamp)
			c.stamp=this.stamp;
		return c;
		
	},
	destroy:function(){
		this.children.each(function(de){
			de.destroy();
		});	
		this.children.reset([],{silent:true});
		AbstractDataElement.prototype.destroy.call(this);
	},
});

var DataPolygon = AbstractDataElement.extend({
	defaults: _.extend(
	{
      structure:[],
    }, 
	AbstractDataElement.prototype.defaults()
	),
	setStructure:function(structure,options){
		options=options||{};
		if(structure)
		this.set('structure',structure)
		if(!options.silent){
			this.trigger('change');
			this.trigger('change:structure');
		}
	},
	initialize: function(attr,options) {
		DataPolygon.__super__.initialize.call(this,attr,options);
		this.type='polygon';
	},
	clone:function(cloneStamp){
		var c=new DataPolygon({
			'name':this.get('name') ,
			'classes':_.clone( this.get('classes') ) ,
			'attributes':_.clone( this.get('attributes') ) ,
			'structure':L.cloneLatLngArray(this.get('structure') )
			});
		if(cloneStamp!=null&&cloneStamp)
			c.stamp=this.stamp;
		return c;
	},
});


///////////////////////
// forked data //////////
///////////////////////
/*
 * hold a true data
 * a data is destined to be hold by several middleData
 * middleData got additionnal value that it doesn't share with the true data ( and the others middle data)
 * for other usage, it act like a transparent delegator
 */

var MiddleData = Backbone.Model.extend({
	model:null,
	type:null,
	defaults:function(){
		return {
			selected:'none',
			visible:true,
		};
	},
	initialize:function(options){
		if(!options.model)throw 'model know found';
		this.model=options.model;
		var type=this.model.type;
		this.type=type;
		this.listenTo(this.model,'change',this._relayChange);	//simply relay the trigger function
	},
	getStamp:function(){
		return this.model.stamp;
	},
	set:function(a){
		if(!this.model)
			Backbone.Model.prototype.set.call(this,a);
		else
		_.each(a,function(value,key){
			var o={};
			o[key]=value;
			if( Backbone.Model.prototype.get.call(this,key) != null )
				Backbone.Model.prototype.set.call(this,o);
			else
				this.model.set(o);
		},this);
	},
	get:function(a){
		var r=Backbone.Model.prototype.get.call(this,a);
		return r || this.model.get(a);
	},
	_relayChange:function(e){
		this.trigger('change',this);
	},
});

var MiddleDataPackage = MiddleData.extend({
	children:null,
	initialize:function(options){
		MiddleData.prototype.initialize.call(this,options);
		
		this.listenTo(this.model.children,'add',this._relayAdd);	
		this.listenTo(this.model.children,'remove',this._relayRemove);	
				
		this.children=new Backbone.Collection();
		this.children.model=MiddleDataElement;
				
		this.model.children.each(this._relayAdd,this);
		
	},
	addElement:function(el){
		this.model.addElement(el);
	},
	removeElement:function(el){
		this.model.removeElement(el);
	},
	
	_relayAdd:function(a){
		this.children.add( new MiddleData( {'model':a} ) );
	},
	_relayRemove:function(a){
		el=this.children.find( function(b){return b.getStamp()==a.getStamp();});
		this.children.remove( el );
	},
});

var MiddleDataElement = MiddleData.extend({
	initialize:function(options){
		MiddleData.prototype.initialize.call(this,options);
		
	},
});



var MiddleDataMap=Backbone.Model.extend({
		elementSelected:null,		//array of dataelement
		packageHidden:null,			//array of datapackage
		defaults:function(){
			return {
				packageSelected:null,
			};
		},
		initialize:function(attr,option){
			this.elementSelected=[];
			this.packageHidden=[];
		},
		
		isElementSelected:function(dataelement){
			return _.find( this.elementSelected ,function(e){return dataelement.getStamp()==e.getStamp();})!=null;
		},
		addSelectedElement:function(dataelement,option){
			option=option||{};
			if( this.isElementSelected(dataelement) )		//already in
				return;
			this.elementSelected.push( dataelement );
			if(!option.silent){
				this.trigger('change:elementSelected');
				this.trigger('change');
			}
		},
		removeSelectedElement:function(dataelement,option){
			option=option||{};
			var index=0;
			if(_.find( this.elementSelected ,function(e,i){index=i;return dataelement.getStamp()==e.getStamp();}) == null )
				return;
			this.elementSelected.splice(index,1);
			if(!option.silent){
				this.trigger('change:elementSelected');
				this.trigger('change');
			}
		},
		removeAllSelectedElement:function(option){
			option=option||{};
			this.elementSelected=[];
			if(!option.silent){
				this.trigger('change:elementSelected');
				this.trigger('change');
			}
		},
	
		isPackageHidden:function(datapackage,option){
			return _.find( this.packageHidden ,function(e){return datapackage.getStamp()==e.getStamp();}) != null;
		},
		hidePackage:function(datapackage,option){
			option=option||{};
			if( this.isPackageHidden(datapackage) )		//already in
				return;
			this.packageHidden.push(datapackage);
			if(!option.silent){
				this.trigger('change:packageHidden');
				this.trigger('change');
			}
		},
		showPackage:function(datapackage,option){
			option=option||{};
			var index=0;
			if(_.find( this.packageHidden ,function(e,i){index=i;return datapackage.getStamp()==e.getStamp();}) == null )
				return;
			this.packageHidden.splice(index,1);
			if(!option.silent){
				this.trigger('change:packageHidden');
				this.trigger('change');
			}
		},
		toggleVisibility:function(datapackage,option){
			option=option||{};
			var index=0;
			if(_.find( this.packageHidden ,function(e,i){index=i;return datapackage.getStamp()==e.getStamp();}) == null )
				this.packageHidden.push(datapackage);
			else
				this.packageHidden.splice(index,1);
			if(!option.silent){
				this.trigger('change:packageHidden');
				this.trigger('change');
			}
		},
});

/////////////////////////
// css wraper  //////////
/////////////////////////
/*
 *	
 *	strocke : 				[width:Number] [color:Color];				//compact version
 *	strocke-color : 		[color:Color];
 *	strocke-opacity : 		[opacity:Number];
 *	strocke-width : 		[width:Number];
 *	
 *	fill : 					[color:Color];								//compact version		
 *	fill-color : 			[color:Color];	
 *	fill-opacity : 			[opacity:Number];
 *	
 */

/*
 * declaration follow this :
 * 
 * dec = {
 *		stamp : {string}, 		// lol?
 *		selectors : [
 * 					selector : [
 *								condition : { class : {string}  } || { id : {string}  }  ||  { tag : {string}  } || { parent : {condition} } || { attributeQuery : {function} , attribute : {string} }
 *						     ]
 *			       ]
 *		props : [
					prop : {
 *							name : {string}
 *							value : [
 *										set of value : [
 *														value : ...
 *												]
 *								]
 *					         }
 *			]
 *	}
 */
var DatamCSS=(function(){

var patterns={
	'dot'		:"M5,5m-5,0a5,5,0,1,0,10,0a5,5,0,1,0,-10,0",
	'square'	:"M0,0L10,0L10,10L0,10z",
	'skull'		:"M7.589482059995094,3.416447392022678C7.589482059995094,1.537147072404845,6.144229649527495,0,3.734628118730297,0C1.3253898079407564,0,0,1.537147072404845,0,3.416447392022678C0,5.2957477116405105,0.529937991171708,5.054932846563854,0.529937991171708,6.115172048914927C0.529937991171708,6.51289795729945,0.1445615630475255,6.320028133233531,0.1445615630475255,7.175411251266001C0.1445615630475255,8.115061411074917,1.4576018907279402,7.982849328287734,1.8433415388597796,8.36786253640426C2.2287179669839623,8.7536021845361,2.1923959662182524,9.464423739521042,2.1923959662182524,9.464423739521042S2.264676747742015,9.753546865616093,2.3972520505368564,9.66891660383199C2.3972520505368564,9.66891660383199,2.4815190923133033,9.873772688150595,2.5781356143500918,9.753183645608438C2.5781356143500918,9.753183645608438,2.6743889163792236,9.957676509919382,2.771005438416012,9.789505646374147C2.771005438416012,9.789505646374147,2.8672587404451435,10.018697471205778,3.023806563745353,9.849800167645226C3.023806563745353,9.849800167645226,3.1803543870455626,10.078628772469198,3.3612379508587984,9.89810842866362C3.3612379508587984,9.89810842866362,3.566094035177403,10.090615032721884,3.7949226400013756,9.946416689682012C4.023751244825348,10.09061503272188,4.228607329143952,9.89810842866362,4.228607329143952,9.89810842866362C4.409127672949531,10.078628772469198,4.566038716257397,9.849800167645226,4.566038716257397,9.849800167645226C4.722949759565264,10.018697471205778,4.818476621579081,9.789505646374147,4.818476621579081,9.789505646374147C4.915819583631184,9.958039729927041,5.0113464456450005,9.753183645608438,5.0113464456450005,9.753183645608438C5.107962967681789,9.873772688150595,5.192230009458236,9.66891660383199,5.192230009458236,9.66891660383199C5.324805312253077,9.753183645608438,5.39708609377684,9.464423739521042,5.39708609377684,9.464423739521042S5.36076409301113,8.7536021845361,5.746140521135313,8.36786253640426C6.131880169267153,7.982486108280077,7.44455727693991,8.115061411074919,7.44455727693991,7.175411251266001C7.44455727693991,6.32039135324119,7.059180848815727,6.512897957299453,7.059180848815727,6.115172048914929C7.059544068823386,5.054932846563854,7.589482059995094,5.2957477116405105,7.589482059995094,3.416447392022678ZM1.9181648604371426,6.994890907460423C1.2705435867845345,7.0984086096426955,0.977425040605255,6.9167986058141455,0.9065971391121205,6.452966656036029C0.722081375222314,5.244170470553203,1.8346242586760095,5.0487581064336835,2.388171550345429,5.115227367834932C2.6536853759427688,5.147190728508757,3.110979365583057,5.428323014435351,3.110979365583057,5.778103881809138C3.1109793655830575,6.717754041618054,2.520746853140271,6.898637605431292,1.9181648604371426,6.994890907460423ZM4.143977067359848,8.56073236047018C4.023751244825348,8.56073236047018,3.830881420759428,8.404184537169968,3.818895160506744,8.115061411074917C3.8069089002540597,8.404184537169968,3.590066555682771,8.56073236047018,3.469840733148271,8.56073236047018C3.349251690606114,8.56073236047018,3.1683681267928785,8.440506537935677,3.1563818665401944,8.151383411840627C3.1443956062875102,7.862260285745576,3.529772034411693,6.693781521112688,3.807272120261717,6.693781521112688C4.084045766096427,6.693781521112688,4.469785414228267,7.862260285745576,4.457799153975582,8.151383411840627S4.264929329909663,8.56073236047018,4.143977067359848,8.56073236047018ZM6.650195120193835,6.452966656036029C6.579367218700701,6.9167986058141455,6.285522232506107,7.0984086096426955,5.637900958853499,6.994890907460423C5.035682186158028,6.898274385423632,4.445449673715241,6.717754041618054,4.445449673715241,5.778103881809138C4.445449673715241,5.428323014435351,4.902380443347872,5.147190728508757,5.168257488952868,5.115227367834932C5.721804780622288,5.0487581064336835,6.834710884083641,5.244170470553203,6.650195120193835,6.452966656036029Z",
	'hazard'	:"M8.60054988661868,4.199846144324332C8.276106956019875,4.012615536457938,7.930710419486563,3.8983845879762753,7.580244462162644,3.851069993930616C7.714077171034652,3.524599295015568,7.788428675963544,3.167374109970841,7.788428675963544,2.7929128942380523C7.788428675963544,1.3062207570462332,6.6265174307565715,0.08888384452863111,5.161792783657378,0C6.25847748135855,0.08719403759842904,7.122982706849951,1.006786969014419,7.122982706849951,2.1264530409663394C7.122982706849951,3.2663967960806843,6.22637114968471,4.195790607691847,5.100959734170102,4.253582004704759V4.979293635195551C5.407828672694807,4.738894555058805,5.643387758764981,5.0058840500307396,5.643387758764981,5.326609405383101C5.643387758764981,5.405016446944479,5.628855419165244,5.480043874645453,5.603508315212212,5.54966392016978L6.0026407121259515,5.780491546835388C6.619758203035763,4.848394044135903,7.864469987822639,4.544228796699523,8.844895968725906,5.110990041089311C9.823632142698969,5.676061478548897,10.184912864376182,6.90184742571751,9.691827202143205,7.900523321466959C10.368763858382172,6.582473915909312,9.897645686241823,4.948768575789909,8.60054988661868,4.199846144324332ZM1.1545846293760882,5.07820778664339C2.141431876614122,4.508404889779238,3.3945926960520096,4.820005287708508,4.007654650329336,5.7656212458496094L4.3932685918014585,5.543580615221052C4.368935372006548,5.475988338012968,4.356430800723052,5.402650717242195,4.356430800723052,5.326609405383101C4.356430800723052,5.019402505472357,4.572050165016842,4.7622138906955955,4.859655304537242,4.698339188733955V4.541633640273203C3.744382730603847,4.184299920566472,2.85892389917794,3.258961645587795,2.85892389917794,2.1261150795802983C2.85892389917794,1.0118563898050248,3.71464212863229,0.09598103363547966,4.804567598612653,0.001689806930201777C3.3472781020063502,0.09800880195172221,2.192464045906226,1.3112901778368395,2.192464045906226,2.7925749328520117C2.192464045906226,3.156897307003587,2.2620840914305536,3.5043216118531415,2.388819611195712,3.823357160275301C2.049506379611128,3.8730374840232433,1.713234800500907,3.985916586960744,1.3982547887112333,4.168077774036532C0.10994598512514224,4.911930784711502,-0.36218607117332813,6.528738055528883,0.29514882467529385,7.841718040295925C-0.17968692271150033,6.847773603951044,0.18429749005403484,5.638209803312371,1.1545846293760882,5.07820778664339ZM3.529777250468179,3.3427760693258204C3.568304848476787,3.3897527019854388,3.609198176187678,3.4343636049427753,3.6521192722148115,3.4772847009699084C3.694702406855905,3.5198678356110014,3.739651271199281,3.5607611633218927,3.7862899424728593,3.5992887613305014C3.8207620038489827,3.627677517757897,3.857599794927389,3.653362583096969,3.8937616632337138,3.679047648436041C4.208065752251307,3.472553241565343,4.584892697686378,3.351563065362872,4.990108399548845,3.351563065362872C5.396000024183393,3.351563065362872,5.7714751240743025,3.4722152801793027,6.085779213091896,3.679047648436041C6.121941081398221,3.653024621710929,6.159116833862667,3.6276775177578973,6.193250933852751,3.5992887613305014C6.240227566512369,3.5607611633218927,6.2848384694697055,3.5198678356110022,6.327421604110798,3.4772847009699084C6.370342700137932,3.4343636049427744,6.411236027848823,3.3897527019854388,6.449763625857431,3.3427760693258204C6.487953262479998,3.296137398052242,6.524791053558404,3.2471329970763807,6.558925153548487,3.1971147119423984C6.117209621993656,2.8740236268877544,5.576133442942938,2.6807097140726324,4.989770438162804,2.6807097140726324C4.975576059949106,2.6807097140726324,4.961719643121449,2.6803717526865922,4.947863226293792,2.6807097140726324C4.941441959959024,2.6807097140726324,4.934344770852174,2.6803717526865922,4.927585543131366,2.6807097140726324C4.3645418739880215,2.693552246742169,3.8457711464159727,2.8851763526270884,3.419601838619,3.1971147119423984C3.4550877841532452,3.2474709584624213,3.4915876138456112,3.296137398052242,3.529777250468179,3.3427760693258204ZM2.8940718833261436,5.145800063851475C2.8372943704713527,5.124846457916968,2.779840934844481,5.106258581684745,2.721035653673447,5.090374396540845C2.662568333888454,5.074490211396945,2.60342509133138,5.06232360149949,2.543605926002225,5.052184759918277C2.48378676067307,5.042045918337064,2.4236296339578747,5.034272806458135,2.362796584470599,5.030217269825649C2.3036533419135248,5.573997139964689,2.406731564655854,6.1394065388103165,2.7000820477389404,6.647700463415111C2.9934325308220275,7.1556564266338665,3.431430487130415,7.528427835436453,3.931951299856281,7.749116620520849C3.9586502493534743,7.6943668759823005,3.9826455077623444,7.638265285899591,4.0035991136968505,7.5814877730448C4.024890681017397,7.524372298803968,4.04347855724962,7.467256824563137,4.059024781007479,7.408451543392103C4.07490896615138,7.349984223607111,4.088427421592996,7.290503019663996,4.097890340402128,7.231021815720882C4.105325490895018,7.187086835535627,4.109381027527503,7.142475932578291,4.113436564159987,7.097865029620956C3.777840907821848,6.928884336600745,3.4848283861248017,6.663246687172972,3.281713593114507,6.312104807076974C3.0789367614902536,5.960624965594934,2.9954602991382693,5.574673062736772,3.0170898278448566,5.198860001459821C2.9761965001339665,5.180272125227598,2.9356411338091153,5.161346287609334,2.8940718833261436,5.145800063851475ZM5.886044033942006,7.129633399908756C5.890775493346571,7.174244302866092,5.894155107206976,7.218517244437388,5.901590257699865,7.262790186008682C5.911729099281078,7.322609351337837,5.924233670564574,7.381752593894911,5.939779894322433,7.439881952293864C5.955664079466333,7.4986872334648975,5.974251955698556,7.55681659186385,5.995543523019102,7.613594104718641C6.016497128953609,7.670709578959473,6.040154425976438,7.726135246270101,6.067191336859672,7.780884990808651C6.567374188199497,7.560196205724255,7.005710105893925,7.187762758307709,7.298722627590973,6.680144756474993C7.592073110674058,6.171850831870197,7.696165217574508,5.60576551025249,7.6370219750174355,5.061985640113449C7.576188925530159,5.066379138131976,7.516031798814964,5.073814288624864,7.456212633485809,5.083953130206077C7.3963934681566545,5.093754010401249,7.33691226421354,5.106596543070786,7.278782905814588,5.122142766828645S7.1621862276306425,5.156276866818727,7.105408714775851,5.177230472753234C7.063501502906838,5.193114657897135,7.023960020740109,5.212716418287479,6.983066693029218,5.231304294519702C7.004358260349765,5.606441433024571,6.921219759383821,5.992731297268774,6.718104966373527,6.343873177364774C6.515328134749273,6.695690980232854,6.221977651666186,6.960652706888545,5.886044033942006,7.129633399908756ZM6.71303554558292,8.80389410635301C5.726188298344886,8.233753248102817,5.3689631133001585,6.993096999948425,5.881650535923479,5.98901372202233L5.478800563763296,5.756158327040478C5.360852040035188,5.887625306210203,5.190181540084774,5.970425845790106,4.999909279744016,5.970425845790106C4.806933328314935,5.970425845790106,4.632883214504117,5.884583653735839,4.51459672938997,5.749737060705711L4.1272929809876455,5.974819343808632C4.625786025397269,6.975185046488284,4.267208994808381,8.204688568903341,3.286445052519074,8.770435929135008C2.3104125696343334,9.334155521050432,1.0721220511822251,9.037763385492983,0.4523008691840902,8.11648064714679C1.256648967960296,9.35578504975702,2.9021829565911132,9.76235259716365,4.196575065125932,9.014782011242234C4.510541192757485,8.833972669710608,4.774826996641096,8.600103390570636,4.987066747074482,8.33277593421266C5.203362034140351,8.613959807398293,5.4771107568330955,8.857967928119479,5.803581455748143,9.046550381530034C7.099663371213164,9.79445892883749,8.746887166774183,9.3865395358867,9.550221381392268,8.143855519416064C8.931076122166214,9.069193794394742,7.6910957967839035,9.368627582426557,6.71303554558292,8.80389410635301Z",
	'star'		:"M7.6240841072107886,9.585506566388732C7.465711581527946,9.585506566388732,7.308472988009897,9.535613551137812,7.17466899256425,9.437339430189033L5.000921032654881,7.832069462229532L2.8271730727455133,9.437339430189033C2.6933690772998666,9.535613551137814,2.535752506393553,9.585506566388732,2.377757958098975,9.585506566388732C2.2220312741339847,9.585506566388732,2.0663045901689947,9.53712546069087,1.9336345268881414,9.440363249295148C1.6664045133851115,9.24721680389197,1.5556571386236016,8.902879403182972,1.6603568751728788,8.589914125699934L2.514585772650739,6.02609350110156L0.3166472598924396,4.454463520697602C0.04828331422461629,4.262073030070951,-0.0647319248664811,3.919247538915014,0.03694399257668,3.605526306655446C0.1382419326315766,3.293316983948936,0.4289065442070078,3.0831615560738515,0.7566129398323639,3.0831615560738515C0.7581248493854219,3.0831615560738515,0.7603927137150092,3.0831615560738515,0.7619046232680675,3.0831615560738515L3.4644429493595275,3.1043282898166664L4.27974017584614,0.5280344114055623C4.378770251571449,0.21393520175772968,4.6709467726999385,0,5.0001650778783535,0S5.621937881573522,0.2139352017577295,5.720589979910566,0.5280344114055623L6.53513125162065,3.1043282898166664L9.23766957771211,3.0831615560738515C9.239181487265169,3.0831615560738515,9.241449351594756,3.0831615560738515,9.243339238536079,3.0831615560738515C9.571045634161434,3.0831615560738515,9.861710245736864,3.293316983948936,9.962630208403496,3.605526306655446C10.065062080623187,3.9196255163032787,9.95204684153209,4.262073030070951,9.683304918476,4.454463520697602L7.485366405717702,6.02609350110156L8.340729235360355,8.589914125699934C8.445050994521369,8.902123448406444,8.334303619759858,9.246460849115438,8.068207538421621,9.440363249295148C7.936671407305563,9.53712546069087,7.780188768564043,9.585506566388732,7.6240841072107886,9.585506566388732L7.6240841072107886,9.585506566388732Z ",
	'warning'	:"M9.752886847783918,4.40044726190846L5.599393729144563,0.24737809887986761C5.269556263971407,-0.08245936629328927,4.729860771470855,-0.08245936629328927,4.400023306297698,0.24737809887986761L0.24737809887986761,4.40044726190846C-0.08245936629328927,4.730284727081617,-0.08245936629328927,5.269556263971405,0.24737809887986761,5.599817684755324L4.400447261908459,9.752886847783918C4.730284727081616,10.082300357346313,5.269980219582168,10.082300357346313,5.599817684755324,9.752886847783918L9.753310803394678,5.599393729144562C10.082300357346313,5.269556263971405,10.082300357346313,4.730284727081617,9.752886847783918,4.40044726190846ZM4.661603918138106,2.2361538689663445C4.754874152505837,2.1352524336048906,4.874005679130074,2.084801715924163,5.019422453621582,2.084801715924163S5.283970754737327,2.134828477994128,5.377240989105059,2.234458046523295C5.470935179083551,2.3340876150524617,5.517146340656653,2.459578475838136,5.517146340656653,2.6096587620480296C5.517146340656653,2.7393891789413276,5.47432682396965,3.174791591194326,5.388687790595642,3.9162899544177847C5.303472712832398,4.657788317641244,5.228008614116687,5.374273299829721,5.163567361280801,6.06659281220474H4.860015143974915C4.80278113652199,5.374273299829721,4.732404505135428,4.657788317641243,4.648037338593709,3.9162899544177847C4.564094127662751,3.174791591194325,4.52169856658651,2.7393891789413276,4.52169856658651,2.609658762048029C4.52169856658651,2.4616982538919476,4.568333683770375,2.3374792599385614,4.661603918138106,2.2361538689663445ZM5.394623169146318,7.670416887718948C5.289906133288001,7.772590189912689,5.16483922811309,7.823888818814939,5.019422453621583,7.823888818814939S4.748938773955164,7.772590189912689,4.644221738096848,7.670416887718948C4.53908074662777,7.568243585525207,4.486510250893231,7.444448547182581,4.486510250893231,7.299031772691072S4.53908074662777,7.028548093024654,4.644221738096848,6.923831057166338C4.748938773955164,6.8186900656972576,4.874005679130075,6.76611956996272,5.019422453621583,6.76611956996272S5.289906133288001,6.8186900656972576,5.394623169146318,6.923831057166338C5.499764160615396,7.028548093024654,5.5523346563499345,7.153614998199567,5.5523346563499345,7.299031772691072S5.499764160615395,7.568243585525207,5.394623169146318,7.670416887718948Z",
};

// util function
var rvb2hex = function( r , v , b ){
	return "#"+new Number(r).toString( 16 )+new Number(v).toString( 16 )+new Number(b).toString( 16 );
}

var isHex=function(s){
	return s.match( /^#[0-9abcdef]{6}$/ )!=null;
};
var isNumber=function(s){
	return s.match( /^[0-9]*(.[0-9]*)?$/ )!=null;
};

// structure
var Selector = function( selector ){
	this.selector=selector;
};
Selector.prototype={
	selector:null,
	priority:null,
	computePriority:function(selector){
		
		selector=selector||this.selector;
		
		var nId =0,
			nClass =0,
			nTag =0,
			special=0;
			
		for( var i = 0 ; i < selector.length ; i ++ ){
			var condition = selector[i];
			if( condition.class || condition.attributeQuery )
				nClass++;
			if( condition.id )
				nId++;
			if( condition.tag )
				nTag++;
			if( condition.parent ){
				var prioP = priorite( condition.parent );
				nTag += prioP%10;
				nClass += Math.floor( prioP / 10 )%10;
				nId += Math.floor( prioP / 100 );
			}
			// editor field have priority
			if( condition.class && condition.class.slice(0,9)=="reserved-" )
				special++;
		}
		return special*1000+nId*100 + nClass*10 + nTag;
	},
	getPriority:function(){
		if(this.priority==null)
			this.priority=this.computePriority();
		return this.priority;
	},
	
	/** 
	 * @description test if the dataelement is matched by one of the selector
	 * @param dataelement { AbstractDataElement } a elelment that implement AbstractDataElement methods
	 * @param bubbling { boolean } should be let to null, used for reccursive call when the selector match the parent ( yeah never used so )
	 * @return {boolean}
	 */
	match:function(dataelement,selectors,bubbling){
		var accept = true;
		bubbling = bubbling || false;
		selectors = selectors || this.selector;
		for( var j = 0 ; j < selectors.length ; j ++ ){
				var condition = selectors[j];
				
				// condition on class
				if( condition.class ){
					if( !dataelement.hasClass( condition.class ) )
						accept = false;
					continue;
				}
				
				// condition on id
				if( condition.id ){
					if( !(dataelement.get('name') == condition.id) )
						accept = false;
					continue;
				}
				
				// condition on attribute
				if( condition.attributeQuery ){
					if( !condition.attributeQuery.testFunction( dataelement.getAttribute( condition.attributeQuery.attribute ) )  )
						accept = false;
					continue;
				}
				
				// condition on ancestor
				if( condition.parent ){
					if( !dataelement.getParent() || !isConcernBy( dataelement.getParent() , condition.parent , true ) )
						accept = false;
					continue;
				}
				
				// condition on tag
				if( condition.tag ){
					if( !(dataelement.type == condition.tag) )
						accept = false;
					continue;
				}
		}
		if( accept )
			return true;
		return ( bubbling && dataelement.getParent() && isConcernBy( dataelement.getParent() , selectors , true ) );
	},
	toHTML:function(selector){
		selector = selector || this.selector;
		var c=$("<span>").addClass("css-selector");
		for(var i=0;i<selector.length;i++){
			var d=$("<span>").addClass("css-condition");
			var condition = selector[i];
			if( condition.class )
				d.wrapInner("."+condition.class ).addClass("css-class");
			if( condition.attributeQuery )
				d.wrapInner("["+condition.attribute+"]" ).addClass("css-attribute");		//TODO
			if( condition.id )
				d.wrapInner("#"+condition.id ).addClass("css-id");
			if( condition.tag )
				d.wrapInner(""+condition.tag ).addClass("css-tag");
			if( condition.parent ){
				d.wrapInner(" " ).addClass("css-ancestor");			//TODO
			}
			d.appendTo( c );
		}
		return c;
	},
};

var SetOfSelector = function(selectors){
	if( selectors.length==0 || selectors[0] instanceof Selector )
		this.selectors=selectors;
	else{
		this.selectors=[];
		for( var i=0;i<selectors.length;i++)
			this.selectors.push( new Selector( selectors[i] ) );
	}
};
SetOfSelector.prototype={
	selectors:null,
	
	/** 
	 * @description test if the dataelement is matched by one of the selector
	 * @param dataelement { AbstractDataElement } a elelment that implement AbstractDataElement methods
	* @return {Selector} the matched selector
	 */
	match:function(dataelement){
		var pmax=0;
		var d=null;
		var p;
		for(var i=0;i<this.selectors.length;i++)
			if(this.selectors[i].match(dataelement) && (p=this.selectors[i].getPriority()) > pmax ){
				pmax=p;
				d=this.selectors[i];
			}
		return d;
	},
	toHTML:function(){
		var c=$("<span>").addClass("css-selectors");
		for(var i=0;i<this.selectors.length;i++)
			this.selectors[i].toHTML().appendTo(c);
		return c;
	},
};

var Declaration = Backbone.Model.extend({
	stamp:null,
	selectors:null,
	defaults: function() {
      return {
		properties:{},
      };
    },
	/** 
	 * @description test if the dataelement is matched by one of the selector
	 * @param dataelement { AbstractDataElement } a elelment that implement AbstractDataElement methods
	* @return {Selector} the matched selector
	 */
	match:function(dataelement){
		return this.selectors.match(dataelement);
	},
	initialize:function(attributes,options){
		this.selectors=new SetOfSelector( options.selectors||[] );
		if(!this.getStamp())
			this.stamp=this.generateStamp();
	},
	removeProperty:function(key,options){
		options=options||{};
		this.get('properties')[key]=null;
		delete this.get('properties')[key];
		if( !options.silent ){
			this.trigger('change:properties');
			this.trigger('change');
		}
	},
	setProperty:function(key,value,options){
		options=options||{};
		this.get('properties')[key]=value;
		if( !options.silent ){
			this.trigger('change:properties');
			this.trigger('change');
		}
	},
	destroy:function(){
		this.trigger('destroy');
	},
	generateStamp: function(){
		return 'dec'+(Declaration.count++);
	},
	parse:function(string){
		//declaration
	},
	getStamp:function(){
		return this.stamp;
	},
	toHTML:function(){
		var declaration=$("<span>").addClass("css-declaration");
		this.selectors.toHTML().appendTo(declaration);
		var props=$("<div>").addClass("css-properties");
		var properties=this.get("properties");
		for( var j in properties ){
			var prop=$("<span>").addClass("css-property");
			$("<span>").addClass("css-property-name").wrapInner(j).appendTo(prop);
			$("<span>").addClass("css-property-separator").wrapInner(":").appendTo(prop);
			$("<span>").addClass("css-property-value").wrapInner(properties[j]).appendTo(prop);
			$("<span>").addClass("css-property-end").wrapInner(";").appendTo(prop);
			prop.appendTo( props );
		};
		$("<span>").addClass("css-bracket").wrapInner("{").appendTo(declaration);
		props.appendTo( declaration );
		$("<span>").addClass("css-bracket").wrapInner("}").appendTo(declaration);
		return declaration;
	},
});
Declaration.count=0;

var Sheet = Backbone.Collection.extend({
	model:Declaration,
	initialize:function(models,options){
		options=options||{};
		if(options.mcss)
			this.parse(options.mcss);
	},
	/**
	 * @description know how symbols must be interpret, build the declaration tree starting from the ast  /!\ effet de bord sur raw tree
	 */
	_semanticBuild : function( rawTree ){
		for(var i=0;i<rawTree.length;i++){
			var props = {};
			for(var j=0;j<rawTree[i].props.length;j++){
				var p = rawTree[i].props[j];
				switch(p.name){
					case "strocke" :
						props[ "strocke-width" ] = p.value[0][0].value;
						var e = p.value[0][1];
						props[ "strocke-color" ] = rvb2hex( e.r , e.v , e.b );
						props[ "strocke-opacity" ] = e.a;
					break;
					case "strocke-width" :
						props[ "strocke-width" ] = p.value[0][0].value;
					break;
					case "strocke-opacity" :
						props[ "strocke-opacity" ] = p.value[0][0].value;
					break;
					case "strocke-color" :
						var e = p.value[0][0];
						props[ "strocke-color" ] = rvb2hex( e.r , e.v , e.b );
					break;
					case "fill" :
						var e = p.value[0][0];
						props[ "fill-color" ] = rvb2hex( e.r , e.v , e.b );
						props[ "fill-opacity" ] = e.a;
					break;
					case "fill-color" :
						var e = p.value[0][0];
						props[ "fill-color" ] = rvb2hex( e.r , e.v , e.b );
					break;
					case "fill-opacity" :
						props[ "fill-opacity" ] = p.value[0][0].value;
					break;
					case "pattern-opacity" :
						props[ "pattern-opacity" ] = p.value[0][0].value;
					break;
					case "pattern-size" :
						props[ "pattern-size" ] = p.value[0][0].value;
					break;
					case "pattern-scale" :
						props[ "pattern-scale" ] = p.value[0][0].value;
					break;
					case "pattern-color" :
						var e = p.value[0][0];
						props[ "pattern-color" ] = rvb2hex( e.r , e.v , e.b );
					break;
					case "pattern-shape" :
						props[ "pattern-shape" ] = p.value[0][0].value;
					break;
					default : 
						//throw ( 'unknown property "' + p.name + '" ' );
					break;
				}	
			}
			rawTree[i].props = props;
		}
		return rawTree;
	},
	parse : function( string ){
		if( !mCSS._parser )
			throw "missing dependancy MapCSSParser.js";
		var p=this._semanticBuild( mCSS._parser.parse( string , "start" ) );
		
		
		var struct=[];
		for(var i=0;i<p.length;i++){
			var d=new Declaration({'properties':p[i].props},{'selectors':p[i].selectors});
			struct.push(d);
		}
		
		this.reset(struct);
	},
	
	/**
	 * @description build the list of declaration that match the dataelement, ordered by priority
	 * @param dataelement { AbstractDataElement } a elelment that implement AbstractDataElement methods
	 */
	computeChain : function( dataelement ){
		var styleChain = [];
		this.each(function(declaration){
			var s;
			if( (s=declaration.match(dataelement)) )
				styleChain.push({'declaration':declaration,'matched':s});
		});
		styleChain = styleChain.sort( function( a , b ){ return(a.matched.getPriority()>b.matched.getPriority())?1:-1; } );
		return styleChain;
	},
	toHTML:function(){
		var c=$("<span>").addClass("css-sheet");
		this.each(function(declaration,e,a,f){
			declaration.toHTML().appendTo(c);
		});
		return c;
	},
	
	syntaxChecker:function(key,value){
		switch(key){
			case 'strocke-color' :
				return isHex(value);
			break;
			case 'strocke-opacity' :
				return isNumber(value);
			break;
			case 'strocke-width' :
				return isNumber(value);
			break;
			case 'fill-color' :
				return isHex(value);
			break;
			case 'fill-opacity' :
				return isNumber(value);
			break;
			case 'pattern-shape' :
				return patterns[value]!=null;
			break;
			case 'pattern-size' :
				return isNumber(value);
			break;
			case 'pattern-opacity' :
				return isNumber(value);
			break;
			case 'pattern-scale' :
				return isNumber(value);
			break;
			case 'pattern-color' :
				return isHex(value);
			break;
			default:
				return false;
		}
	},
	getPatterns:function(){
		return patterns;
	},
});

Sheet.syntaxChecker=Sheet.prototype.syntaxChecker;
Sheet.getPatterns=Sheet.prototype.getPatterns;

return Sheet;
})();
 
var DataChunk=Backbone.Model.extend({
	stamp:null,
	defaults:function(){
		return {
			name:null,
			intersection:[],
			dependancy:[],
			packages:[],
		};
	},
	initialize:function(attr,options){
		this.stamp=this.generateStamp();
		if(!this.get('name'))
			this.set('name',this.getStamp());
	},
	addPackage:function(datapackage){
		var d=this.get('packages');
		if( !_.find(d,function(dp){ return ( dp.getStamp() == datapackage.getStamp() ); } ) ){
			d.push( datapackage );
			this.trigger('change');
			this.trigger('change:packages');
		}
	},
	removePackage:function(datapackage){
		var d=this.get('packages');
		var index=0;
		if( _.find(d,function(dp,i){index=i;return ( dp.getStamp() == datapackage.getStamp() ); } ) ){
			d.splice(index,1);
			this.trigger('change');
			this.trigger('change:packages');
		}
	},
	addDependancy:function(chunkdata){
		var d=this.get('dependancy');
		if( !_.find(d,function(cd){ return ( cd.getStamp() == chunkdata.getStamp() ); } ) ){
			d.push( chunkdata );
			this.trigger('change');
			this.trigger('change:dependancy');
		}
	},
	removeDependancy:function(chunkdata){
		var d=this.get('dependancy');
		var index=0;
		if( _.find(d,function(cd,i){index=i;return ( cd.getStamp() == chunkdata.getStamp() ); } ) ){
			d.splice(index,1);
			this.trigger('change');
			this.trigger('change:dependancy');
		}
	},
	addIntersection:function(chunkdata){
		var d=this.get('intersection');
		if( !_.find(d,function(cd){ return ( cd.getStamp() == chunkdata.getStamp() ); } ) ){
			d.push( chunkdata );
			this.trigger('change');
			this.trigger('change:intersection');
			this.collection.trigger('change:intersection');
		}
	},
	removeIntersection:function(chunkdata){
		var d=this.get('intersection');
		var index=0;
		if( _.find(d,function(cd,i){index=i;return ( cd.getStamp() == chunkdata.getStamp() ); } ) ){
			d.splice(index,1);
			this.trigger('change');
			this.trigger('change:intersection');
			this.collection.trigger('change:intersection');
		}
	},
	getStamp:function(){
		return this.stamp;
	},
	generateStamp:function(){
		return 'chk'+(DataChunk.count++);
	},
});
DataChunk.count=0;

var DataChunks=Backbone.Collection.extend({
	model:DataChunk,
	initialize:function(attr,options){
	
	},
});

$(document).ready(function(){

if(!Backbone.$)Backbone.$=window.jQuery;



var ViewLeafletMap= (function(){

var AdaptLeafletMap = Backbone.View.extend({
	lfe:null, //the leaflet element
	
	tagName:'div',
	
	middledata:null,
	mcssdata:null,
	data:null,
	
	stockedHiddenElement:null,
	
	children:null,  //keep track of the children because leaflet doenst do so, and then its difficult t odelete something
	
	listening:false,
	_event:null,
	
	getLeafletAdapt:function(dataelement){
		if(this.data.getStamp()==dataelement.getStamp())
			return this;
		if(this.children)
			for(var i=0;i<this.children.length;i++){
				var e=this.children[i].getLeafletAdapt(dataelement);
				if(e!=null)
					return e;
			}
		return null;
	},
	initialize: function(options) {
		options=options||{};
		this.middledata=options.middledata;
		this.mcssdata=options.mcssdata;
		this.data=this.model;
		
		this.stockedHiddenElement=[];
		this.children=[];
		
		this._event=[];
		
		this.initLfe(options);
		
		this.lfe.ctrl=this;
		this.listen(true);
	},
	initLfe :function(options){
		
		var zoomControl			=	options.zoomControl==null	?		true :	options.zoomControl,
			attributionControl	=	options.attributionControl==null	?		true :	options.attributionControl;
		
		
		var w=options.width||500,
			h=options.height||500;
		
		this.$el.children().remove();		//clean the element
		this.$el.attr('width',w).attr('height',h).css({'width':w+'px','height':h+'px'});		//set the dimension
		
		var tmpAppend=false;	
		if(!this.$el.parent()){				//the element given in param to the leaflet constructor must be in the DOW flow
			this.$el.appendTo($('body'));	//if not, add it temporaly
			tmpAppend=true;
		}
		
		this.lfe=new L.Map(this.$el.get(0),{
			zoomControl:zoomControl,
			attributionControl:attributionControl,
			scrollWheelZoom:false,
		});		//init the lfe
		
		if( tmpAppend )
			this.$el.detach();
	},
	getLfe:function(){
		return this.lfe;
	},
	addOne:function(dataElement){
		var type=dataElement.type;
		var al;
		switch(type){	// set up the adaptLeafletElement according to the type of the dataElement added
			case 'polygon':
				al = new AdaptLeafletPolygon({'data':dataElement , 'middledata':this.middledata , 'mcssdata':this.mcssdata , 'parentlfe' : this.lfe});
			break;
			case 'package':
				al = new AdaptLeafletPackage({'data':dataElement , 'middledata':this.middledata , 'mcssdata':this.mcssdata , 'parentlfe' : this.lfe});
			break;
			default: throw 'unkonw type';
		}
		this.lfe.addLayer(al.lfe);
		this.children.push( al );
		
		for(var i=0;i<this._event.length;i++)
			al.on( this._event[i].types , this._event[i].fn , this._event[i].ctx );
		
		
		if( this.fitToWorld2 )
			this.fitToWorld2();
	},
	addAll:function(){
		this.model.children.each(this.addOne,this);
	},
	removeOne:function(data){
		var index=0;
		var al=_.find( this.children , function( al , i ){
			index=i;
			return al.data.getStamp() == data.getStamp();
		});
		this.lfe.removeLayer(al.lfe);
		this.children.splice(index,1);
	},
	listen:function(enable){
		if(enable==this.listening)
			return;
		this.listening=enable;
		
		if( enable){
			this.listenTo(this.model.children, "add", this.addOne);
			this.listenTo(this.model.children, "remove", this.removeOne);
			this.addAll();
		}else{
			this.stopListening(this.model.children);
		}
	},
	fitToWorld2:function(){
		
		var b=this.computeWorldBound();
		// enlarger
		var marge= Math.max( b.getNorthWest().lat - b.getSouthEast().lat , b.getNorthWest().lng - b.getSouthEast().lng ) * 0.4;
		
		b=new L.LatLngBounds( new L.LatLng(b.getNorthEast().lat+marge , b.getNorthEast().lng+marge) , new L.LatLng(b.getSouthWest().lat-marge , b.getSouthWest().lng-marge) );
		
		this.lfe.setView( b.getNorthWest() , 3.5 , true );
	},
	
	//since i can get the leaflet function work, i write my own
	computeWorldBound:function(){
		if(this.children.length==0)
			return new L.LatLngBounds( new L.LatLng(-0.1,-0.1) , new L.LatLng(0.1,0.1) );
		var bound = this.children[0].computeWorldBound();
		for(var i=1;i<this.children.length;i++)
			bound=bound.extend( this.children[i].computeWorldBound() );
		return bound;
	},
	
	on:function(types, fn, ctx , options ){ 
		this.lfe.on(types, fn, ctx); 
		if(options.propage){
			_.each( this.children , function( e ){ e.on(types, fn, ctx); } );
			this._event.push( {types:types , fn:fn , ctx:ctx} );
		}
		return this;
	},
	off:function(types, fn, ctx , options ){
		this.lfe.off(types, fn, ctx); 
		if(options.propage){
			_.each( this.children , function( e ){ e.off(types, fn, ctx); } );
			this._event=_.filter( this._event , function( e ){return (e.types!=types||e.fn!=e.fn);  } );
		}
		return this;
	},
});

var AdaptLeafletPackage = function(){
	this.initialize.apply(this,arguments);
};
_.extend( AdaptLeafletPackage.prototype,{
	
	//models
	model:null,		//alias
	data:null,
	middledata:null,
	mcssdata:null,
	
	lfe:null,
	parentlfe:null,
	
	hidden:false,
	
	children:null,
	
	_event:null,
	
	initialize:function(option){
		this.data=option.data;
		this.model=this.data		//alias
		this.middledata=option.middledata;
		this.mcssdata=option.mcssdata;
		
		this.parentlfe=option.parentlfe;
		
		this.data.children.on({
			"add"			:	$.proxy(this.addOne,this),
			"remove"		:	$.proxy(this.removeOne,this),
		});
		if( this.middledata )
			this.middledata.on( "change:packageHidden" , $.proxy(this.changeHidden,this) );
		
		this.lfe=new L.LayerGroup();
		this.children=[];
		this._event=[];
		this.addAll();
		this.lfe.ctrl=this;
		
	},
	addOne: AdaptLeafletMap.prototype.addOne,
	addAll: AdaptLeafletMap.prototype.addAll,
	removeOne: AdaptLeafletMap.prototype.removeOne,
	changeHidden:function(){
		if( this.hidden==this.middledata.isPackageHidden( this.data ))
			return;
		this.hidden=!this.hidden;
		if(this.hidden)
			this.parentlfe.removeLayer(this.lfe);
		else
			this.parentlfe.addLayer(this.lfe);
	},
	
	computeWorldBound: AdaptLeafletMap.prototype.computeWorldBound,
	getLeafletAdapt:AdaptLeafletMap.prototype.getLeafletAdapt,
	
	on:function(types, fn, ctx , options ){ 
		_.each( this.children , function( e ){ e.on(types, fn, ctx); } );
		this._event.push( {types:types , fn:fn , ctx:ctx} );
		return this;
	},
	off:function(types, fn, ctx , options ){
		_.each( this.children , function( e ){ e.off(types, fn, ctx); } );
		this._event=_.filter( this._event , function( e ){return (e.types!=types||e.fn!=e.fn);  } );
		return this;
	},
});

var AdaptLeafletElement = function(){
	this.initialize.apply(this,arguments);
};
_.extend( AdaptLeafletElement.prototype,{
	
	//models
	data:null,
	middledata:null,
	mcssdata:null,
	
	lfe:null,
	
	dirty:false,
	
	selected:false,
	
	stylechain:null,  	//can be hold by the dataelement
	llstyle:null,
	getLeafletAdapt:AdaptLeafletMap.prototype.getLeafletAdapt,
	initialize:function(option){
		this.data=option.data;
		this.middledata=option.middledata;
		this.mcssdata=option.mcssdata;
		
		/*
		// not working
		this.data.on({
			"change:structure" 			: $.proxy(this.changeStructure,this),
			"change:attributes" 		: $.proxy(this.changeStyle,this),
			"change:name" 				: $.proxy(this.changeStyle,this),
			"change:classes" 			: $.proxy(this.changeStyle,this),
			"destroy"					: $.proxy(this.remove,this),
		});
		*/
		this.data
		.on("change:structure", 	this.changeStructure,this )
		.on("change:attributes", 	this.changeStyle,this )
		.on("change:name", 			this.changeStyle,this )
		.on("change:classes", 		this.changeStyle,this )
		.on("destroy", 				this.remove,this )
		;
		if( this.middledata )
		this.middledata.on({
			"change:elementSelected"	: $.proxy(this.changeSelected,this),
		});
		
		this.mcssdata.on({
			"change"					: $.proxy(this.changeStyle,this),
		});
	},
	needRedraw:function(){
		this.dirty=true;
		this.lfe.redraw();
	},
	changeStructure:function(){
		
	},
	changeSelected:function(){
		if(this.middledata.isElementSelected(this.data)==this.selected)
			return;
		this.selected=!this.selected;
		this.needRedraw();
		
		if(this.selected)
			this.lfe.setStyle({'fillColor':'#faefe1'});
		else
			this.lfe.setStyle(this.llstyle);
	},
	changeStyle:function(){
		this.stylechain=this.mcssdata.computeChain(this.data);
		var style=this._mergeStyleChain(this.stylechain,this.middledata);
		this.llstyle=this._interpretStyle(style);
		
		style['label-text']="hello bitch!";
		
		/*
		this.llstyle[ 'pattern' ]=true;
		this.llstyle[ 'patternColor' ]='#481348';
		this.llstyle[ 'patternSize' ]=18;
		this.llstyle[ 'patternPath' ]=" M 5 , 5        m -5, 0        a 5,5 0 1,0 10,0        a 5,5 0 1,0 -10,0";
		this.llstyle[ 'patternScale' ]=0.5;
		*/
		this.lfe.setStyle(this.llstyle);
		if(this.selected)
			this.lfe.setStyle({'fillColor':'#faefe1'});
		
		if(style['label-text']){
			
		}
	},
	remove:function(){
		// ..
	},
	_interpretStyle:function( mergedStyle ){
		/* assuming there is no collision in the mergedStyle */
		var JSONstyle = {
			strocke:false,
			pattern:false,
			};
		for( var p in mergedStyle ){
			var value = mergedStyle[ p ];
			switch( p ){
				case "strocke-width" :
					/* TODO : throw error if the style is not applicable to this item */
					JSONstyle.strocke = true;
					JSONstyle.weight = value;
					if( !JSONstyle.color )
						JSONstyle.color = "#000000";
					if( !JSONstyle.opacity )
						JSONstyle.opacity = "1";
				break;
				case "strocke-opacity" :
					JSONstyle.strocke = true;
					JSONstyle.opacity = value;
					if( !JSONstyle.color )
						JSONstyle.color = "#000000";
					if( !JSONstyle.weight )
						JSONstyle.weight = 1;
				break;
				case "strocke-color" :
					JSONstyle.strocke = true;
					JSONstyle.color = value;
					if( !JSONstyle.opacity )
						JSONstyle.opacity = "1";
					if( !JSONstyle.weight )
						JSONstyle.weight = 1;
				break;
				
				case "fill-opacity" :
					JSONstyle.fill = true;
					JSONstyle.fillOpacity = value;
					if( !JSONstyle.fillColor )
						JSONstyle.fillColor = "#000000";
				break;
				case "fill-color" :
					JSONstyle.fill = true;
					JSONstyle.fillColor = value;
					if( !JSONstyle.fillOpacity )
						JSONstyle.fillOpacity = 1;
				break;
				case "pattern-shape" :
					JSONstyle.pattern = true;
					JSONstyle.patternPath = this.mcssdata.getPatterns()[ value ];
				break;
				case "pattern-color" :
					JSONstyle.pattern = true;
					JSONstyle.patternColor=value;
					if( !JSONstyle.patternPath )
						JSONstyle.patternPath=this.mcssdata.getPatterns()[ 'dot' ];
				break;
				case "pattern-size" :
					JSONstyle.pattern = true;
					JSONstyle.patternSize=value;
					if( !JSONstyle.patternPath )
						JSONstyle.patternPath=this.mcssdata.getPatterns()[ 'dot' ];
				break;
				case "pattern-scale" :
					JSONstyle.pattern = true;
					JSONstyle.patternScale=value;
					if( !JSONstyle.patternPath )
						JSONstyle.patternPath=this.mcssdata.getPatterns()[ 'dot' ];
				break;
				case "pattern-opacity" :
					JSONstyle.pattern = true;
					JSONstyle.patternOpacity=value;
					if( !JSONstyle.patternPath )
						JSONstyle.patternPath=this.mcssdata.getPatterns()[ 'dot' ];
				break;
				case "label-text" :
					//ignore
				break;
				default : 
					throw 'unknow property "'+p+'" ';
			}
		}
		return JSONstyle;
	},
	_mergeStyleChain:function( stylechain , middledata ){
		var style = {};
		var dec;
		for( var i = 0 ; i < stylechain.length ; i ++ ){
			dec = stylechain[i].declaration;
			if( true ){		// condition on middledata ( on the zoom for example )
				var p=dec.get('properties');
				for( var j in p )
					style[ j ] = p[j];
			}
		}
		return style;
	},
	on:function(types, fn, context ){ 
		this.lfe.on(types, fn, context);
		return this;
	},
	off:function(types, fn, context ){
		this.lfe.off(types, fn, context);
		return this;
	},
});

var AdaptLeafletPolygon = function(){
	this.initialize.apply(this,arguments);
};
_.extend( AdaptLeafletPolygon.prototype,AdaptLeafletElement.prototype);
_.extend( AdaptLeafletPolygon.prototype,{
	initialize:function(option){
		AdaptLeafletElement.prototype.initialize.call(this,option);
		
		this.lfe = new L.LayerGroup();
		var r= new L.Polygon( L.cloneLatLngArray(this.data.get('structure')) );
		r.ctrl=this;
		this.lfe.addLayer( r );
		var s=L.cloneLatLngArray(this.data.get('structure'));
		for(var i=0;i<s.length;i++){
			var p=new L.Marker( s[i] );
			p.ctrl=this;
			this.lfe.addLayer( p );
		}
		this.lfe=new L.Polygon( L.cloneLatLngArray(this.data.get('structure')) );
		this.lfe.ctrl=this;
		
		this.changeStyle();
	},
	changeStructure:function(){
		this.lfe.setLatLngs( L.cloneLatLngArray(this.data.get('structure')) );
		this.needRedraw();
	},
	computeWorldBound:function(){
		var s=this.data.get('structure');
		var bound=new L.LatLngBounds( new L.LatLng(s[0].lat,s[0].lng) , new L.LatLng(s[0].lat,s[0].lng) );
		_.each(s,function(p){ bound=bound.extend(p); });
		return bound;
	},
});

/*
noneed
var AdaptLeafletPackage = function(){
	this.initialize(arguments);
};
_.extend( AdaptLeafletPackage.prototype,{
	datapackage:null,
	middledata:null,
	lfe:null,
	initialize:function(option){
		this.datapackage=option.datapackage;
		this.middledata=option.middledata;
		
		this.listenTo(this.model.children, "add", this.addOne);
		this.listenTo(this.model.children, "remove", this.removeOne);
	},
});
*/
/*
var AbstractAdaptLeafletElement = Backbone.View.extend({
	model : null,
	_event : null,
	_eventDirty : false,
	lfe : null,
	initialize:function(){
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

var AdaptLeafletPolygon = AbstractAdaptLeafletElement.extend({
	lfe:null, //the leaflet element
	initialize: function() {
		
		//this.listenTo(this.model , "remove", this.removeOne);
		
		this.initLfe();
	},
	initLfe :function(){
		var l=new L.LayerGroup();
		var s=L.cloneLatLngArray(this.model.get('struct') );
		for(var i=0;i<s.length;i++)
			l.addLayer( new L.Marker( s[i] ) );
		l.addLayer( new L.Polygon( L.cloneLatLngArray(this.model.get('struct') ) ) , {color: "#ff7800", weight: 1} );
		//this.lfe = new L.Polygon( L.cloneLatLngArray(this.model.get('struct') ) ); 	//init the lfe
		this.lfe=l;
	},
});
*/
return AdaptLeafletMap;

})();


var ViewActionMap=function(){
	this.initialize.apply(this,arguments);
};
_.extend( ViewActionMap.prototype ,{
	lfe:null,
	$el:null,
	viewleafletmap:null,
	
	middledata:null,
	data:null,
	mcssdata:null,
	
	initialize:function(options){
		options=options||{};
		
		this.middledata=options.middledata;
		this.mcssdata=options.mcssdata;
		this.data=options.model;
		
		var vlm=new ViewLeafletMap(options);
		this.lfe=vlm.lfe;
		this.$el=vlm.$el;
		this.viewleafletmap=vlm;
		this.initInteraction();
	},
	listen:function(enable){
		this.viewleafletmap.listen(enable);
		
	},
	initInteraction:function(){
		
		//elementSelectionnable
		(function( scope , data , middledata , viewleafletmap ){
			
			var acte = function(e){
				var dataelement = e.target.ctrl.data;
				switch( dataelement.type ){
					case 'map' :
						middledata.removeAllSelectedElement();
						return;
					break;
					default:
						if(!e.originalEvent.ctrlKey)
							middledata.removeAllSelectedElement({'silent':true});
						middledata.addSelectedElement(dataelement);
					break;
				}
			};
			var elementSelectionnable = function( unable ){	
				if( unable ){			
					viewleafletmap.on( "click" , acte , this , {propage:true} );
				}else{
					viewleafletmap.off( "click" , acte , this , {propage:true} );
				}
				return scope;
			};	
			scope.elementSelectionnable = elementSelectionnable;
			
		})( this , this.data , this.middledata , this.viewleafletmap );
		
		
		//polygonTracable
		(function( scope , middledata , viewleafletmap ){
			var datapolygon=null;
			var viewleafletelement=null;
			
			var ctrls=[];
			
			var ctrlon,
				anchorM={x:0,y:0},
				anchorE={x:0,y:0};
			
			var startDragCtrl=function(e){
				
				if(e.originalEvent.ctrlKey){
					//delete the point
					var newStructure=L.cloneLatLngArray( datapolygon.get('structure') );
					newStructure.splice(e.target.index,1);
					
					cmd.execute( cmd.SetPolygonStructure.create( datapolygon , newStructure ) );
					
				}else{
					//start dragging the point
					ctrlon=e.target;
					
					viewleafletmap.on( "mousemove" , dragCtrl , this , {propage:true} );
					viewleafletmap.on( "mouseup" , stopDragCtrl , this , {propage:true} );
					
					anchorM.x=e.originalEvent.pageX;
					anchorM.y=e.originalEvent.pageY;
					
					anchorE = viewleafletmap.lfe.project( e.target.getLatLng() );
				}
				e.originalEvent.stopPropagation();
				e.originalEvent.preventDefault();
			};
			var dragCtrl=function(e){
				
				var x = anchorE.x + ( e.originalEvent.pageX - anchorM.x ),
					y = anchorE.y + ( e.originalEvent.pageY - anchorM.y );
				
				var latLng = viewleafletmap.lfe.unproject( new L.Point( x , y ) )
					
				// modify the position of the squarre ctrl element
				ctrlon.setLatLng( latLng );
				
				//modify the lfe structure directly
				viewleafletelement.lfe.getLatLngs()[ ctrlon.index ]=latLng;
				viewleafletelement.lfe.setLatLngs( viewleafletelement.lfe.getLatLngs() );
				
				e.originalEvent.stopPropagation();
				e.originalEvent.preventDefault();
			};
			var stopDragCtrl=function(e){
				
				
				//execute the change
				newStructure=viewleafletelement.lfe.getLatLngs();
				cmd.execute( cmd.SetPolygonStructure.create( datapolygon , newStructure ) );
				
				viewleafletmap.off( "mousemove" , dragCtrl , this , {propage:true} );
				viewleafletmap.off( "mouseup" , stopDragCtrl , this , {propage:true} );
				
				e.originalEvent.stopPropagation();
				e.originalEvent.preventDefault();
			};
			
			var placeCtrlPoints=function(){
			
				removeCtrlPoints();
				
				//place the new ones
				_.each( datapolygon.get('structure') , function(latlng,i){
					var m=new L.Marker( new L.LatLng( latlng.lat , latlng.lng ) , {"icon" : L.icons.editableSquare } );
					viewleafletmap.lfe.addLayer( m );
					m.on('mousedown',$.proxy(startDragCtrl,this));
					m.index=i;		// so we now how to acces to the element in the array of latlng
					ctrls.push(m);
				},this);
			};
			var removeCtrlPoints=function(){
				//delete all the old ones
				_.each( ctrls , function(lf){
					lf.off('mousedown',$.proxy(startDragCtrl,this));
					viewleafletmap.lfe.removeLayer(lf);
				},this);
				
				ctrls=[];
			};
			
			var acte = function(e){
				
				var points=viewleafletelement.lfe._originalPoints //(x,y) tab relative to the screen
				
				//check if the point is on the polygon hull
				var res=null;
				if( points.length>1 )
					res=L.PolyUtil.collideWrap(points,e.layerPoint,33);
				
				var newStructure=L.cloneLatLngArray( datapolygon.get('structure') );
				if(!res){
					//add to the end of the path
					newStructure.push(e.latlng);
				}else{
					//add at the correct position
					newStructure.splice(res.b,0,e.latlng);
				}
				
				cmd.execute( cmd.SetPolygonStructure.create( datapolygon , newStructure ) );
				
			};
			var polygonTracable = function( unable , datapolygon_ ){	
				datapolygon=datapolygon_;
				if(datapolygon_)
					viewleafletelement=viewleafletmap.getLeafletAdapt(datapolygon_);
				if( unable ){			
					viewleafletmap.on( "click" , acte , this , {propage:true} );
					datapolygon_.on('change:structure' , placeCtrlPoints , this );
					placeCtrlPoints();
				}else{
					if(viewleafletmap)
						viewleafletmap.off( "click" , acte , this , {propage:true} );
					if(datapolygon)
						datapolygon.off('change:structure' , placeCtrlPoints , this );
					removeCtrlPoints();
				}
				return scope;
			};	
			scope.polygonTracable = polygonTracable;
			
		})( this , this.middledata , this.viewleafletmap );
		
	},
	elementSelectionnable:function(){return this;},
	polygonTracable:function(){return this;},
});



var ViewPackages = Backbone.View.extend({
  tagName:'div',
  toolmodel:null,
  middledatamap:null,
  
  hiddable:true,
  deletable:false,
  infoable:true,
  addable:false,
  selectionable:false,
  
  linkage:null,
  
   events: {
    "click [data-contain=trash-all]"       		      : "trashAll",
    "click [data-contain=new-package]"       		  : "newPackage",
  },
  
  initialize: function(options) {
	options=options||{};
	this.hiddable = options.hiddable!=null ? options.hiddable : this.hiddable;
	this.deletable = options.deletable!=null ? options.deletable : this.deletable;
	this.infoable = options.infoable!=null ? options.infoable : this.infoable;
	this.addable = options.addable!=null ? options.addable : this.addable;
	this.selectionable = options.selectionable!=null ? options.selectionable : this.selectionable;
	
	this.linkage=options.linkage;
	
	this.toolmodel=options.toolmodel;
	this.middledatamap=options.middledatamap;
	
	this.listenTo(this.model.children, "add", this.addOne);
    this.$el.html( $('#panel-package-template').html() );
	this.render();
	this.addAll();
  },
  
  trashAll:function(){
	var t=[];
	this.model.children.each(function(datapackage){
		t.push( cmd.RemovePackage.create(this.model,datapackage) );
	},this);
	cmd.execute(cmd.Multi.createWithTab(t) );
  },
  newPackage:function(){
	cmd.execute(cmd.AddPackage.create(this.model, new DataPackage() ) );
  },
  
  addOne:function(pack){
	var vp =new ViewPackage({
			model:pack,
			toolmodel:this.toolmodel,
			middledatamap:this.middledatamap,
			hiddable:this.hiddable,
			deletable:this.deletable,
			infoable:this.infoable,
			selectionable:this.selectionable,
		}).$el.appendTo( this.$el.find('table') );
	if(this.linkage)
		vp.linkable(this.linkage);
  },
  addAll: function() {
     this.model.children.each(this.addOne, this);
  },
  render: function() {
      if(!this.deletable) this.$el.find('[data-contain=trash-all]').remove();
      if(!this.addable) this.$el.find('[data-contain=new-package]').remove();
	  
	  return this;
  },
});

var ViewPackage = Backbone.View.extend({
  tagName:'tr',
  className:'item-package',
  toolmodel:null,
  middledatamap:null,
  
  hiddable:true,
  deletable:true,
  infoable:true,
  selectionable:true,
  
  events: {
    "click [data-contain=visible]"          	  : "toggleVisibility",
    "click [data-contain=trash]"       		      : "trash",
    "click [data-contain=pop]"       		      : "pop",
    "click"       		      					  : "select",
  },
  initialize: function(options) {
    options=options||{};
	this.hiddable = options.hiddable!=null ? options.hiddable : this.hiddable;
	this.deletable = options.deletable!=null ? options.deletable : this.deletable;
	this.infoable = options.infoable!=null ? options.infoable : this.infoable;
	this.selectionable = options.selectionable!=null ? options.selectionable : this.selectionable;
	
	this.toolmodel=options.toolmodel;
    this.middledatamap=options.middledatamap;
	
	this.listenTo(this.model, "change:name", this.render);
    this.listenTo(this.model, "destroy", this.remove);
    this.listenTo(this.middledatamap , "change:elementSelected", this.visibilityChange);
	if(this.selectionable)
		 this.listenTo(this.middledatamap , "change:packageSelected", this.render);
	
	this.$el.html( $('#item-package-template').html() );
	this.$el.data('datapackage',this.model);
	this.render();
  },
  
  select:function(){
	if(this.selectionable)
		this.middledatamap.set('packageSelected',this.model);
  },
  pop:function(){
	var e=this.$el.find('[data-contain=pop]');
	if(!e.data('popover'))
		e.popover({
			'animation' : true,
			'placement' : 'right',
			'html'		: new ViewPackageInfo({model:this.model,container:e}).$el,
		});
	e.popover('show');
  },
  toggleVisibility:function(){
	this.middledatamap.toggleVisibility(this.model);
  },
  trash:function(){
	cmd.execute( cmd.RemovePackage.create(this.model.getParent(),this.model) );
  },
  
  
  remove:function(){
	this.$el.remove();
  },
  visibilityChange:function(){
	if( this.middledatamap.isPackageHidden(this.model) )
		this.$el.find('[data-contain=visible]').removeClass('icon-eye-open').addClass('icon-eye-close');
	else
		this.$el.find('[data-contain=visible]').removeClass('icon-eye-close').addClass('icon-eye-open');
  },
  render: function() {
	this.$el.removeClass('selected');
	if(this.selectionable && this.middledatamap.get('packageSelected') && this.middledatamap.get('packageSelected').getStamp() == this.model.getStamp() )
		this.$el.addClass('selected');
	if(!this.hiddable)this.$el.find('[data-contain=visible]').remove();
	if(!this.deletable)this.$el.find('[data-contain=trash]').remove();
	if(!this.infoable)this.$el.find('[data-contain=pop]').remove();
	
	this.$el.find('[data-contain=name]').html(this.model.get('name'));
	this.visibilityChange();
    return this;
  },

});

var ViewPackageInfo = Backbone.View.extend({
	initialize: function(option) {
		this.$el.html( $('#item-package-info-template').html() );
		this.render();
	 },
});

///////////////////////////////////
////  result displayer

var ViewResults = Backbone.View.extend({
  initialize: function() {
	this.listenTo(this.model.results, "reset", this.render);
	this.addAll();
  },
  addOne:function(result){
	new ViewResult({model:result,resultsmgr:this.model}).$el.appendTo( this.$el.find('#list-result') );
  },
  addAll: function() {
     this.model.results.each(this.addOne, this );
  },
  removeAll:function(){
	this.$el.find('#list-result').children().remove();
  },
  render: function() {
      this.removeAll();
	  this.addAll();
  },
});

var ViewResult = Backbone.View.extend({
  tagName:'div',
  className:'result',
  resultsmgr:null,
  initialize: function(options) {
	options=options||{};
	this.resultsmgr=options.resultsmgr;
    this.$el.html( $('#item-result-template').html() );
	this.render();
  },
  events: {
    "click"                : "select",
  },
  select:function(){
	 this.resultsmgr.set({'selected':this.model});
  },
  remove:function(){
	this.$el.remove();
  },
  render: function() {
	this.$el.find('[data-contain=name]').html(this.model.get('name'));
	this.$el.find('[data-contain=author]').html(this.model.get('author'));
    return this;
  },
});

var ViewResultInfo = Backbone.View.extend({
  tagName:'div',
  mcssdata:null,
  initialize: function(options) {
	this.mcssdata=options.mcssdata||new DatamCSS();
	this.listenTo(this.model, "change:selected", this.render);
	this.render();
  },
  events: {
    "click .btn"                : "add",
  },
  add:function(){
	 this.$el.find('.btn').hide();
	 
	 var datamap=this.model.datamap;
	 var datapackage=this.model.get('selected').datapackage.clone();
	 cmd.execute( cmd.AddPackage.create(datamap,datapackage) );
  },
  render: function() {
	this.$el.empty();
	var r=this.model.get('selected');
	if(!r)
		return null;
	
	
	
	
	this.$el.html( $('#item-result-info-template').html() );
	this.$el.find('[data-contain=name]').html(r.get('name'));
	this.$el.find('[data-contain=author]').html(r.get('author'));
	this.$el.find('[data-contain=description]').html(r.get('description'));
	this.$el.find('img').attr('src','http://www.gravatar.com/avatar/'+r.get('hashMail')+'?s=60&d=mm');
	this.$el.find('.btn').show();
	
	var cm=this.$el.find('[data-contain=map]');
	var map=new ViewLeafletMap({ 
		'model':r.datamap ,
		'mcssdata':this.mcssdata ,
		'width':cm.width() ,
		'height':cm.height(),
		'zoomControl':false,
		'attributionControl':false,
		});
	cm
	.empty()
	.append( map.$el );
	
	window[ 'map'+r.get('name') ]=map;
	
    return this;
  },
});



var ViewAttributes = Backbone.View.extend({
  tagName:'div',
  toolmodel:null,
  middledatamap:null,
  binded:null,
  initialize: function(option) {
  
	this.toolmodel=option.toolmodel;
	this.middledatamap=option.middledatamap;
	
    this.$el.html( $('#panel-attributes-template').html() );
	
	this.listenTo( this.middledatamap , "change:elementSelected" , this.listenSelectedChange  );
	
	this.binded=[];
	this.render();
  },
  listenSelectedChange:function(){
	var i=this.binded.length;
	while(i--)
		this.binded[i].off({
			"change:name"	:	$.proxy(this.render,this),
			"change:attributes"	:	$.proxy(this.render,this),
			"change:classes"	:	$.proxy(this.render,this),
		});
		
	this.binded=[];
	for(var i=0;i<this.middledatamap.elementSelected.length;i++)
		this.binded.push( this.middledatamap.elementSelected[i] );
	
	var i=this.binded.length;
	while(i--)
		this.binded[i].on({
			"change:name"	:	$.proxy(this.render,this),
			"change:attributes"	:	$.proxy(this.render,this),
			"change:classes"	:	$.proxy(this.render,this),
		});
	this.render();
  },
  computeIntersectElement:function(){
	var intersect={
		name:null,
		classes:{},
	};
	if( this.middledatamap.elementSelected.length==0 )
		return intersect;
		
	for( var c in this.middledatamap.elementSelected[0].get('classes') )
		intersect.classes[c]=true;
	intersect.name = this.middledatamap.elementSelected[0].get('name');
	
	for(var i=1;i<this.middledatamap.elementSelected.length;i++){
		for( var c in intersect.classes )
			if( !this.middledatamap.elementSelected[i].get('classes')[c] ){
				intersect.classes[c]=null;
				delete intersect.classes[c];
			}
		intersect.name=null;
	}
	
	return intersect;
  },
  render: function() {
      
	  var o=this.computeIntersectElement();
	  
	  this.$el.find('[data-contain=name]')
	  .empty()
	  .append( $('<span>'+ o.name +'</span>').smartlyEditable({'finish':$.proxy(this.finishName,this) , 'correcter':this.correcter})  ); 
	  
	  var cc = this.$el.find('[data-contain=class]')
	  .empty();
	  
	  for(var c in o.classes )
		cc.append( $('<span>'+ c +'</span>').smartlyEditable({'finish':$.proxy(this.finishClass,this) , 'correcter':this.correcter}) );
	  
	  cc.append( $('<span>&nbsp;&nbsp;&nbsp;+&nbsp;&nbsp;&nbsp;</span>').smartlyEditable({'finish':$.proxy(this.finishNewClass,this) , 'correcter':this.correcter}) );
  },
  correcter:function(v){
	return v.trim().toLowerCase().replace(" ","-");
  },
  finishName:function(element,prevValue){
	cmd.execute( cmd.Set.create( this.middledatamap.elementSelected[0] , 'name' , element.text() ) );
  },
  finishNewClass:function(element,prevValue){
	var cmds=[];
	var className=element.text();
	if( className == "" ){
		this.render();
		return;
	}
	for(var i=0;i<this.middledatamap.elementSelected.length;i++)
		cmds.push( cmd.AddClass.create( this.middledatamap.elementSelected[i] , className ) );
	cmd.execute( cmd.Multi.createWithTab( cmds ) );
  },
  finishClass:function(element,prevValue){
	var cmds=[];
	var className=element.text();
	if( className != "" )
		for(var i=0;i<this.middledatamap.elementSelected.length;i++)
			cmds.push( cmd.ModifyClass.create( this.middledatamap.elementSelected[i] , prevValue , className ) );
	else
		for(var i=0;i<this.middledatamap.elementSelected.length;i++)
			cmds.push( cmd.RemoveClass.create( this.middledatamap.elementSelected[i] , prevValue  ) );
	cmd.execute( cmd.Multi.createWithTab( cmds ) );
  },
});


var ViewPropertyStack = Backbone.View.extend({
  tagName:'div',
  toolmodel:null,
  middledatamap:null,
  initialize: function(option) {
  
	this.toolmodel=option.toolmodel;
	this.middledatamap=option.middledatamap;
	
    this.$el.html( $('#panel-property-stack-template').html() );
	
	this.listenTo( this.model , "add" , this.addOne  );
	this.listenTo( this.model , "reset" , this.addAll  );
	
	this.addAll();
  },
  addOne:function(declaration){
	 this.$el.find('[data-contain=stack]').append( new ViewProperty({ 'model':declaration , 'mcssdata':this.model}).$el );
  },
  addAll:function() {
     this.model.each(this.addOne,this);
  },
});

ViewProperty = Backbone.View.extend({
  tagName:'div',
  toolmodel:null,
  middledatamap:null,
  binded:null,
  mcssdata:null,
  _missSpell:null,
  initialize: function(options) {
	options=options||{};
	this.mcssdata=options.mcssdata;
	this.toolmodel=options.toolmodel;
	this.middledatamap=options.middledatamap;
	
	this.listenTo( this.model , "change" , this.render  );
	this.listenTo( this.model , 'destroy' , this.remove );
	
	this.listenTo( this.model , 'change:properties' , this.render );
	
	this._missSpell=[];
	this.render();
  },
  remove:function(){
	this.$el.remove();
  },
  render:function(){
	
	this.$el
	.empty()
	.append( this.model.toHTML() );		//append the property from the data
	
	for(var i=0;i<this._missSpell.length;i++){		//append the invalid properties, they are waiting for correction
		var prop=$("<span>").addClass("css-property").addClass('invalid');
		$("<span>").addClass("css-property-name").wrapInner(this._missSpell[i].name).appendTo(prop);
		$("<span>").addClass("css-property-separator").wrapInner(":").appendTo(prop);
		$("<span>").addClass("css-property-value").wrapInner(this._missSpell[i].value).appendTo(prop);
		$("<span>").addClass("css-property-end").wrapInner(";").appendTo(prop);
		this.$el.find('.css-properties').append( prop );
	}
	
	
	
	this.$el.find('.css-property-value').smartlyEditable({'finish':$.proxy(this.finishValue,this) , 'correcter':this.correcter });
	this.$el.find('.css-property-name').smartlyEditable({'finish':$.proxy(this.finishName,this) , 'correcter':this.correcter })
	
	
	var nameSpan=$("<span>&nbsp;&nbsp;&nbsp;+&nbsp;&nbsp;&nbsp;</span>").addClass("css-property-name")
	var prop=$("<span>")			//append the '+' property, form add
	.addClass("css-property")
	.append(nameSpan)
	.appendTo( this.$el.find('.css-properties') );
	
	nameSpan.smartlyEditable({'finish':$.proxy(this.finishNewName,this) , 'correcter':this.correcter });
	
	
	return this;
  },
  correcter:function(v){
	v=v.trim().toLowerCase().replace(" ","-");
	if(v=="+")v="";
	return v;
  },
  finishValue:function(element,prevValue){
	var value=element.text();
	var name=element.parents('.css-property').find('.css-property-name').text();
	
	if(value==""){
		this.render();
		return;
	}
	
	if( element.parents('.css-property').hasClass('invalid') )
		this._missSpell=_.filter( this._missSpell , function(o){ return (o.name!=name||o.value!=prevValue); } );
	
	if( this.mcssdata.syntaxChecker(name,value) )
		cmd.execute( cmd.SetProperty.create( this.model , name , value ) );
	else{
		element.parents('.css-property').addClass('invalid');
		this._missSpell.push({name:name, value:value});
		cmd.execute( cmd.RemoveProperty.create( this.model , name ) );
	}
  },
  finishName:function(element,prevValue){
	var name=element.text();
	var value=element.parents('.css-property').find('.css-property-value').text();
	
	if( element.parents('.css-property').hasClass('invalid') )
		this._missSpell=_.filter( this._missSpell , function(o){ return (o.name!=prevValue||o.value!=value); } );
	
	if(name=="")
		cmd.execute( cmd.RemoveProperty.create( this.model , prevValue ) );
	else{
		if( this.mcssdata.syntaxChecker(name,value) )
			cmd.execute( cmd.SetProperty.create( this.model , name , value ) );
		else{
			element.parents('.css-property').addClass('invalid');
			this._missSpell.push({name:name, value:value});
			cmd.execute( cmd.RemoveProperty.create( this.model , prevValue ) );
		}
	}
  },
  finishNewName:function(element,prevValue){
	var name=element.text();
	var valSpan=$("<span>").addClass("css-property-value");
	if( name=="" ){
		this.render();
		return;
	}
	element.parents('.css-property')
	.append( $("<span>").addClass("css-property-separator").wrapInner(":") )
	.append( valSpan )
	.append( $("<span>").addClass("css-property-end").wrapInner(";") );
	
	valSpan.smartlyEditable({'finish':$.proxy(this.finishValue,this) })
	.click();
  },
});



var ViewChunks = Backbone.View.extend({
  tagName:'div',
  viewpackage:null,
  events:{
	'click .btn[data-contain=addChunk]'				:	"createChunk",
	'click a[data-contain=trash-intersection]'		:	"trashIntersection",
  },
  initialize: function(options) {
    options=options||{};
	this.middledata=options.middledata;
	
    this.$el.html( $('#panel-chunk-template').html() );
	
	this.listenTo( this.model , "add" , this.addOne  );
	this.listenTo( this.model , "remove" , this.render  );
	this.listenTo( this.model , "reset" , this.addAll  );
	
	this.listenTo( this.model , "change:intersection" , this.render );
	
	this.addAll();
	this.render();
  },
  trashIntersection:function(e){
	var datachunk1=$(e.target).data('ch1');
	var datachunk2=$(e.target).data('ch2');
	
	cmd.execute( cmd.RemoveIntersection.create( datachunk1 , datachunk2 ) );
	cmd.execute( cmd.RemoveIntersection.create( datachunk2 , datachunk1 ) );
	
  },
  createChunk:function(){
	this.model.add( new DataChunk({}) );
  },
  addOne:function(datachunk){
	 this.$el.find('[data-contain=list-chunk]').append( new ViewChunk({ 'model':datachunk , 'middledata':this.middledata }).$el );
	 this.render();
  },
  addAll:function() {
     this.model.each(this.addOne,this);
  },
  render:function() {
	
	var canvas=this.$el.find('canvas');
	var pa=canvas.parent();
	var w=this.$el.width(),
		h=pa.height();
	
	canvas
	.css({ 'width':w+'px' , 'height':h+'px'}).attr('width',w).attr('height',h);
	
	var ctx=canvas[0].getContext('2d');
	ctx.clearRect(0,0,w,h);
	ctx.lineWidth=2;
	
	
	var line=[];
	this.model.each(function(ch1){
		_.each(ch1.get('intersection'),function(ch2){
			if(ch1.getStamp()<ch2.getStamp())
				line.push({a:ch1,b:ch2,type:'intersection'});
		},this)
	},this);
	
	pa.find("[data-contain=trash-intersection]").remove();
	
	var pas=12;
	var pasy=6;
	for(var i=0;i<line.length;i++){
		var ela=this.$el.find('#'+line[i].a.getStamp());
		var elb=this.$el.find('#'+line[i].b.getStamp());
		
		var ax=ela.offset().left-pa.offset().left+ela.outerWidth(),
			ay=ela.offset().top -pa.offset().top +ela.outerHeight()/2;
			
		var bx=elb.offset().left-pa.offset().left+elb.outerWidth(),
			by=elb.offset().top -pa.offset().top +elb.outerHeight()/2;
		
		if(line[i].type=='intersection')
			ctx.strokeStyle="#888888";
		
		var dx=(i+1)*pas;
		var dy=(-line.length/2+i)*pasy;
		
		ctx.beginPath()
		ctx.moveTo( ax    , ay+dy );
		ctx.lineTo( ax+dx , ay+dy );
		ctx.lineTo( ax+dx , by+dy );
		ctx.lineTo( ax    , by+dy );
		ctx.stroke();
		
		$('<a class="icon-fire" data-contain="trash-intersection" ></a>')
		.css({'position':'absolute' , 'top':((ay+by)/2+dy-5)+'px' , 'left': (ax+dx-5)+'px' })
		.appendTo(pa)
		.data('ch1',line[i].a)
		.data('ch2',line[i].b)
		;
	}
	/*
	var c=svg.parent();
	var s=c[0].innerHTML;
	svg.remove();
	c[0].innerHTML=s;
	*/
	return this;
  },
});

var ViewChunk = Backbone.View.extend({
  tagName:'div',
  className:'chunk',
  events:{
	'change input[type=checkbox]'				:	"toggleVisibility",
	'click a[data-contain=trash-chunk]'			:	"trash",
  },
  
  toggleVisibility:function(e){
	var visible=$(e.target).is(":checked");
	
	if(visible){
		//toggle all the packages from chunk that are in conflict ( intersection ) to hidden
		_.each( this.model.get('intersection') , function(datachunk){
			_.each( datachunk.get('packages') , function(datapackage){
				this.middledata.hidePackage(datapackage);
			},this);
			//is bad :( but im too tired to make a model of this
			var cb=this.$el.parent().find('.chunk#'+ datachunk.getStamp() ).find('input[type=checkbox]');
			if(cb.is(':checked'))
				cb.click();
		},this);
	}
	//toggle all the packages to visible
	_.each( this.model.get('packages') , function(datapackage){
		if(visible)
			this.middledata.showPackage(datapackage);
		else
			this.middledata.hidePackage(datapackage);
	},this);
  },
  trash:function(e){
	var t=[];
	_.each( this.model.get('intersection') , function(datachunk){
			t.push( cmd.AddOrDelete.create( datachunk , 'removeIntersection' , 'addIntersection' , this.model ) );
	},this);
	t.push( cmd.AddOrDelete.create(this.model.collection,'remove','add',this.model) );
	cmd.execute( cmd.Multi.createWithTab(t) );
  },
  
  initialize: function(options) {
    options=options||{};
	this.middledata=options.middledata;
	
	this.model.on({
		'change:name'		:	$.proxy(this.render,this),
		'change:packages'	:	$.proxy(this.render,this),
		'destroy'			:	$.proxy(this.remove,this),
		'remove'			:	$.proxy(this.remove,this),
	});
	
    this.$el.html( $('#item-chunk-template').html() );
	
	this.$el.find('a[data-contain=tic-intersection]').linkable({'selector':'.chunk:not(#'+ this.model.getStamp() +')' , 'finish':this.finishLinkIntersection });
	this.$el.attr('id',this.model.getStamp());
	
	this.$el.data('datachunk',this.model);
	
	this.toggleVisibility( this.$el.find('input[type=checkbox]') );
	
	this.render();
  },
  remove:function() {
	this.$el.remove();
  },
  render:function() {
	
	var cl=this.$el.find('[data-contain=list-package]');
	cl.children().remove();
	
	_.each( this.model.get('packages') , function(datapackage){
			cl.append( new ViewPackageChunk( {'model':datapackage , 'datachunk':this.model } ).$el );
	},this)
	
	this.$el.find('[data-contain=name-chunk]')
	.html( this.model.get('name') )
	.smartlyEditable({'finish':$.proxy(this.finishName,this) } );
	
	return this;
  },
  finishName:function(el,prevValue){
	var name=el.text().trim();
	if(name=="")
		this.render();
	else
		cmd.execute( cmd.Set.create( this.model , 'name' , name ) );
  },
  finishLinkIntersection:function(el,elchunk2){
	var datachunk1=el.parents('.chunk').data('datachunk');
	var datachunk2=elchunk2.data('datachunk');
	
	cmd.execute( cmd.AddIntersection.create( datachunk1 , datachunk2 ) );
	cmd.execute( cmd.AddIntersection.create( datachunk2 , datachunk1 ) );
	
  },
 });
 
var ViewPackageChunk = Backbone.View.extend({
  tagName:'tr',
  events: {
    "click [data-contain=trash-package]"       		      : "trash",
  },
  initialize: function(options) {
	options=options||{};
	this.datachunk=options.datachunk;
	
	
	this.model.on({
		'change:name'	:	$.proxy(this.render,this),
		'destroy'		:	$.proxy(this.remove,this),
	});
	
    this.$el.html( $('#item-package-chunk-template').html() );
	this.render();
  },
  trash:function() {
	cmd.execute( cmd.RemovePackageToChunk.create( this.datachunk , this.model ) );
  },
  remove:function() {
	this.$el.remove();
  },
  render:function() {
	this.$el.find('[data-contain=name-package]').html( this.model.get('name') );
	return this;
  },
});



var ViewDataTools = Backbone.View.extend({
  middledata:null,
  viewactionmap:null,
  events:{
	'click .btn[data-contain=add-polygon]'				:	"newPolygon",
	'click .btn[data-contain=remove-element]'			:	"trashElement",
	'click .btn[data-contain=edit-element]'				:	"editElement",
	'click .btn[data-contain=select-mode]'				:	"goSelectMode",
  },
  initialize: function(options) {
    options=options||{};
	this.middledata=options.middledata;
	this.toolmodel=options.toolmodel;
	
    this.$el.html( $('#data-tool-panel-template').html() );
	
	this.listenTo( this.toolmodel , "change:avaibleTool" , this.render  );
	
	this.render();
  },
  goSelectMode:function(){
	if(this.toolmodel.get('avaibleTool')['selection'])
		this.toolmodel.set('state','selection');
	else
		hintdisplayer.pop({'title':'No' , 'body':'I am affraid I can\'t let you do that dave...'});
  },
  newMarker:function(){
   if(this.toolmodel.get('avaibleTool')['marker-creation'])
		this.toolmodel.newMarker();
	else
		hintdisplayer.pop({'title':'No' , 'body':'I am affraid I can\'t let you do that dave...'});
  },
  newPolygon:function(){
   if(this.toolmodel.get('avaibleTool')['polygon-creation'])
		 this.toolmodel.newPolygon();
	else
		hintdisplayer.pop({'title':'No' , 'body':'I am affraid I can\'t let you do that dave...'});
  },
  trashElement:function(){
	if(!this.toolmodel.get('avaibleTool')['trash-element']){
		hintdisplayer.pop({'title':'No' , 'body':'I am affraid I can\'t let you do that dave...'});
		return;
	}
    var t=[];
	_.each(this.middledata.elementSelected,function(dataelement){
		t.push( cmd.AddOrDelete.create( dataelement.getParent() , 'removeElement' , 'addElement' , dataelement ) );
	});
	cmd.execute( cmd.Multi.createWithTab(t) );
  },
  editElement:function(){
	if(this.toolmodel.get('avaibleTool')['edition'])
		this.toolmodel.editElement();
	else
		hintdisplayer.pop({'title':'No' , 'body':'I am affraid I can\'t let you do that dave...'});
  },
  render:function(){
	if(this.toolmodel.get('avaibleTool')['trash-element'])
		this.$el.find('[data-contain=remove-element]').show();
	else
		this.$el.find('[data-contain=remove-element]').hide();
		
		
	if(this.toolmodel.get('avaibleTool')['edition'])
		this.$el.find('[data-contain=edit-element]').show();
	else
		this.$el.find('[data-contain=edit-element]').hide();
	
	if(this.toolmodel.get('avaibleTool')['selection'])
		this.$el.find('[data-contain=select-mode]').show();
	else
		this.$el.find('[data-contain=select-mode]').hide();
	
	if(this.toolmodel.get('avaibleTool')['polygon-creation'])
		this.$el.find('[data-contain=add-polygon]').show();
	else
		this.$el.find('[data-contain=add-polygon]').hide();
		
		
	if(this.toolmodel.get('avaibleTool')['trash'])
		this.$el.find('[data-contain=trash-element]').show();
	else
		this.$el.find('[data-contain=trash-element]').hide();
  },
});
  


window.ViewResults = ViewResults;
window.ViewPackages = ViewPackages;
window.ViewResultInfo = ViewResultInfo;
window.ViewLeafletMap = ViewLeafletMap;
window.ViewActionMap = ViewActionMap;
window.ViewAttributes = ViewAttributes;
window.ViewPropertyStack = ViewPropertyStack;
window.ViewChunks = ViewChunks;
window.ViewDataTools = ViewDataTools;
/*
map=new AdaptLeafletMap({'model':middle});
map.$el.appendTo( $('body') )
.css({'display':'inline-block'});

map2=new AdaptLeafletMap({'model':new MiddleDataPackage({'model':pack})});
map2.$el.appendTo( $('body') )
.css({'display':'inline-block'});

/*
var w=500,
	h=500;
var el=$('<div>')
.attr('width',w).attr('height',h).css({'width':w+'px','height':h+'px'});
new L.Map(el.get(0));
el.appendTo($('body'));
*/

});


















