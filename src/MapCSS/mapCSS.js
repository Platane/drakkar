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
 *		stamp : {string},
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

var extend = function( child , f ){
	for( var p in f )
		child.prototype[ p ] = f[ p ];
	if( !child.prototype.superDad )
		child.prototype.superDad = f;
};
var mCSS = mCSS || {};

(function( scope ){
	
	var uid=0;
	
	var declarations ;
	
	var specif=[
		"strocke",
		"strocke-width",
		"strocke-color",
		"strocke-opacity",
		"fill",
		"fill-color",
		"fill-opacity",
	];
	
	// iam a ugly structuren dotn judge me please
	var notifier;
	
	var rvb2hex = function( r , v , b ){
		return "#"+new Number(r).toString( 16 )+new Number(v).toString( 16 )+new Number(b).toString( 16 );
	}
	
	var parse = function( s ){
		if( !scope._parser )
			throw "missing dependancy MapCSSParser.js";
		var p=scope._parser.parse( s , "start" );
		
		//add unique stamp
		for(var i=0;i<p.length;i++)
			p[i].stamp= 'dec'+(uid++);
		return p;
	};
	var semanticBuild = function( rawTree ){
		for(var i=0;i<rawTree.length;i++){
			var props = {};
			for(var j=0;j<rawTree[i].props.length;j++){
				var p = rawTree[i].props[j];
				switch(p.name){
					case "strocke" :
						//if( p.value[0].length!=2 || !p.value[0][0].value || p.value[0][0].value<0 || !p.value[0][1].r  ) throw "strocke invalid params"; //type check
						props[ "strocke-width" ] = p.value[0][0].value;
						var e = p.value[0][1];
						props[ "strocke-color" ] = rvb2hex( e.r , e.v , e.b );
						props[ "strocke-opacity" ] = e.a;
					break;
					case "strocke-width" :
						//if( p.value[0].length!=1 || !p.value[0][0].value || !p.value[0][0].value <0 ) throw "strocke-width invalid params"; //type check
						props[ "strocke-width" ] = p.value[0][0].value;
					break;
					case "strocke-opacity" :
						//if( p.value[0].length!=1 || !p.value[0][0].value || !p.value[0][0].value <0  ) throw "strocke-opacity invalid params"; //type check
						props[ "strocke-opacity" ] = p.value[0][0].value;
					break;
					case "strocke-color" :
						//if( p.value[0].length!=1 || !p.value[0][0].r ) throw "strocke-color invalid params"; //type check
						var e = p.value[0][0];
						props[ "strocke-color" ] = rvb2hex( e.r , e.v , e.b );
					break;
					case "fill" :
					//	if( p.value[0].length!=1 || !p.value[0][0].r ) throw "fill invalid params"; //type check
						var e = p.value[0][0];
						props[ "fill-color" ] = rvb2hex( e.r , e.v , e.b );
						props[ "fill-opacity" ] = e.a;
					break;
					case "fill-color" :
						//if( p.value[0].length!=1 || !p.value[0][0].r ) throw "fill-color invalid params"; //type check
						var e = p.value[0][0];
						props[ "fill-color" ] = rvb2hex( e.r , e.v , e.b );
					break;
					case "fill-opacity" :
						//if( p.value[0].length!=1 || !p.value[0][0] ) throw "fill-opacity invalid params"; //type check
						props[ "fill-opacity" ] = p.value[0][0].value;
					break;
					default : 
						//throw ( 'unknown property "' + p.name + '" ' );
					break;
				}	
			}
			rawTree[i].props = props;
		}
		return rawTree;
	};
	var init = function( s ){
		declarations = semanticBuild( parse( s ) );
		notifier=new AbstractNotifier();
	};
	
	/** Test if the element satisfy the selector
	 *@param {AbstractAttributeHolder} the element ( have to implement hasClass() , id , type , getParent() , getAttribute ) 
	 *@param {Selector[]} set of selector, the element have to satisfy at least one selector. ( a selector is a array of condition )
	 *@returns {Boolean} true if the element satisfy at least one selector of the set
	 */
	 var isConcernBy = function( element , s , bubbling ){
		var accept = true;
		bubbling = bubbling || false;
		for( var j = 0 ; j < s.length ; j ++ ){
				var condition = s[j];
				
				// condition on class
				if( condition.class ){
					if( !element.hasClass( condition.class ) )
						accept = false;
					continue;
				}
				
				// condition on id
				if( condition.id ){
					if( !(element.id == condition.id) )
						accept = false;
					continue;
				}
				
				// condition on attribute
				if( condition.attributeQuery ){
					if( !condition.attributeQuery.testFunction( element.getAttribute( condition.attributeQuery.attribute ) )  )
						accept = false;
					continue;
				}
				
				// condition on ancestor
				if( condition.parent ){
					if( !element.getParent() || !isConcernBy( element.getParent() , condition.parent , true ) )
						accept = false;
					continue;
				}
				
				// condition on tag
				if( condition.tag ){
					if( !(element.type == condition.tag) )
						accept = false;
					continue;
				}
		}
		if( accept )
			return true;
		return ( bubbling && element.getParent() && isConcernBy( element.getParent() , s , true ) );
	};
	
	var priorite = function( selector ){
		
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
	}
	
	/**
	 * @param an alement, must implement attributeholder
	 * @brief check all the declaration, select the ones that match, ordone them in a array
	 * @return styleChain, an array of declaration, ordonned by priority, less prior first
	 */
	var computeChain = function( element ){
		var styleChain = [];
		if( declarations )
			for( var i = 0 ; i < declarations.length ; i ++ )
				for( var j = 0 ; j < declarations[ i ].selectors.length ; j ++ ) 
					if( element == null || isConcernBy( element , declarations[ i ].selectors[ j ] ) ){
						styleChain.push({ dynCondition:null , priority : priorite( declarations[ i ].selectors[ j ] ) , props : declarations[ i ].props , origin:declarations[ i ]});
						break;
					}
		
		styleChain = styleChain.sort( function( a , b ){ return(a.priority>b.priority)?1:-1; } );
		return styleChain;
	}
	
	
	var alterDeclaration=function( exDec , newDec ){
		try{
			if( typeof(newDec) == "string")
				newDec=semanticBuild(parse(newDec))[0];
			for(var i=0;i<declarations.length;i++)
				if( declarations[i].stamp==exDec.stamp )
					declarations[i]=newDec;
		}catch(e){ console.log(e); }	//nevermind
		
		notifier.notify("set-css");
	};
	var addDeclaration=function( newDec ){
		try {
			if( typeof(newDec) == "string")
				newDec=semanticBuild(parse(newDec))[0];
			declarations.push(newDec);
		}catch(e){ console.log(e); }	//nevermind
		notifier.notify("set-css");
	};
	var removeDeclaration=function( dec ){
		for(var i=0;i<declarations.length;i++)
			if( declarations[i].stamp==dec.stamp )
				declarations.splice(i,1);
		notifier.notify("set-css");
	};
	
	var setDeclarations=function(newDec){
		if( typeof(newDec) == "string")
			newDec=semanticBuild(parse(newDec));
		declarations=newDec;
		notifier.notify("set-css");
	};
	
	
	var declarationsToXML=function(declsD){
		if(!declsD)
			declsD=declarations;
		var declarations=$("<span></span>");
		var i=declsD.length;
		while(i--){
			var decl=declsD[i];
			var declaration=$("<span>").addClass("css-declaration");
			
			
			//selectors
			var selectors=$("<span>").addClass("css-selectors");
			
			for( var j=0;j<decl.selectors.length;j++){
				var selector=$("<span>").addClass("css-selector");
				for( var k=0;k<decl.selectors[j].length;k++){
					var condition=$("<span>").addClass("css-condition");
					
					var c = decl.selectors[j][k];
					if( c.class )
						condition.wrapInner("."+c.class ).addClass("css-class");
					if( c.attributeQuery )
						condition.wrapInner("["+c.attribute+"]" ).addClass("css-attribute");
					if( c.id )
						condition.wrapInner("#"+c.id ).addClass("css-id");
					if( c.tag )
						condition.wrapInner(""+c.tag ).addClass("css-tag");
					if( c.parent ){
						condition.wrapInner(" " ).addClass("css-ancestor");
					}
					
					condition.appendTo( selector );
				}
			}
			
			//properties
			var props=$("<div>").addClass("css-properties");
			for( var j in decl.props ){
				var prop=$("<span>").addClass("css-property");
				
				$("<span>").addClass("css-property-name").wrapInner(j).appendTo(prop);
				$("<span>").addClass("css-property-separator").wrapInner(":").appendTo(prop);
				$("<span>").addClass("css-property-value").wrapInner(decl.props[j]).appendTo(prop);
				$("<span>").addClass("css-property-end").wrapInner(";").appendTo(prop);
				
				prop.appendTo( props );
			};
			
			selector.appendTo( declaration );
			$("<span>").addClass("css-bracket").wrapInner("{").appendTo(declaration);
			props.appendTo( declaration );
			$("<span>").addClass("css-bracket").wrapInner("}").appendTo(declaration);
			
			declaration.appendTo(declarations);
		}
		return declarations;
		
	};
	var declarationsToString=function(declsD){
		return declarationsToXML(declsD).text();
	}
	
	scope.parse = parse;					// should be private		//cant 
	scope.semanticBuild = semanticBuild;	// should be private		//cant
	scope.isConcernBy = isConcernBy;		// should be private
	scope.init = init;
	scope.computeChain = computeChain;
	
	scope.alterDeclaration=alterDeclaration;
	scope.addDeclaration=addDeclaration;
	scope.removeDeclaration=removeDeclaration;
	
	scope.removeListener=function(){notifier.removeListener.apply(notifier,arguments);};
	scope.registerListener=function(){notifier.registerListener.apply(notifier,arguments);};
	
	scope.declarationsToXML = declarationsToXML;
	scope.declarationsToString = declarationsToString;
	
	scope.getDeclarations = function(){ return declarations; };
})( mCSS );

/**  @class Element that know how to compute the style chain to apply render effect.
 *
 */
var AbstractStyleHolder = function(){};
extend( AbstractStyleHolder , {
	_styleChain : null,			// ordoned set of property ( some of these can be dynamic )
	_style : null,				// set of property 
	_styleDirty : true,			// set of property style need to be update from the style Chain
	_chainDirty : true,			// set of property style need to be update from the style Chain
	init:function(){
		this._styleChain=[];
		this._style={};
	},
	globalAttrChanged:function(){
		this._styleDirty=true;
	},
	_interpretStyle:function( mergedStyle ){
		/* assuming there is no collision in the mergedStyle */
		var JSONstyle = {};
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
				default : 
					throw 'unknow property "'+p+'" ';
			}
		}
		return JSONstyle;
	},
	_mergeStyleChain:function( globalAttr ){
		var style = {};
		var dec;
		for( var i = 0 ; i < this._styleChain.length ; i ++ ){
			dec = this._styleChain[i];
			if( (dec.dynCondition && dec.dynCondition( globalAttr )) || !dec.dynCondition )
				for( var j in dec.props )
					style[ j ] = dec.props[j];
		}
		return style;
	},
	clone:function(){
		var c = new AbstractStyleHolder();
		var superDad = null;
		if( superDad != null ){
			var cP = superDad.prototype.clone.call( this );
			for(var i in cP)
				c[i]=cP[i];
		}
		if( this._styleChain ){
			c._styleChain = new Array(this._styleChain.length);
			for(var i=0;i<this._styleChain.length;i++)
				c._styleChain[i] = this._styleChain[i];
		}
		c._styleDirty = true;
		return c;
	},
});

