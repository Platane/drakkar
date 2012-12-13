var mCSS = mCSS || {};

(function( scope ){
	
	var parse = function( s ){
		if( !scope._parser )
			throw "missing dependancy MapCSSParser.js";
		return scope._parser.parse( s , "start" );
	}
	
	
	scope.parse = parse;
	
})( mCSS );

