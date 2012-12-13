
// change the behavior of the random function
		var _seed = 45678951585432565678;
		_seed = Math.floor( Math.random() * 10000000000 );


		//_seed = 8806672480     ;

		console.log( "seed = "+_seed );
		var _offset = _seed;
		Math.random = function(){
				
			var s = _seed;
			var square = s *s;
			
			var nseed = Math.floor( square / 1000 ) % 10000000000;
			
			if( nseed != _seed )
				_seed = nseed;
			else
				_seed = nseed + _offset;
			return ( _seed / 10000000000 );
		}

describe("Analyser", function() {
	describe("declaration structure", function() {
		describe("with empty file", function() {
			var res = null;
			beforeEach( function(){
				
				var s ="";
				res = mCSS.parse( s );
			} );
			it( "should return an empty array" , function(){
				expect( res.length ).toBe( 0 );
			});
		} );
		
		describe("with one empty declaration", function() {
			var res = null;
			beforeEach( function(){
				
				var s ="declaration{}";
				res = mCSS.parse( s );
			} );
			it( "should return a single element array" , function(){
				expect( res.length ).toBe( 1 );
			});
			it( "should have 'selector' and 'props' fields" , function(){
				expect( !res[ 0 ].selector ).toBe( false );
				expect( !res[ 0 ].props ).toBe( false );
			});
			it( "'props' field shoul be an empty array" , function(){
				expect( res[ 0 ].props.length ).toBe( 0 );
			});
		});
		
		describe("with two empty declarations", function() {
			var res = null;
			beforeEach( function(){
				
				var s ="declaration{}declaration{}";
				res = mCSS.parse( s );
			} );
			it( "should return a two element array"  , function(){
				expect( res.length ).toBe( 2 );
			});
			it( "should have 'selector' and 'props' fields" , function(){
				expect( !res[ 0 ].selector ).toBe( false );
				expect( !res[ 0 ].props ).toBe( false );
				
				expect( !res[ 1 ].selector ).toBe( false );
				expect( !res[ 1 ].props ).toBe( false );
			});
			it( "'props' field shoul be an empty array" , function(){
				expect( res[ 0 ].props.length ).toBe( 0 );
				expect( res[ 1 ].props.length ).toBe( 0 );
			});
		});
		
		describe("with one declaration that contains one property", function() {
			var res = null;
			beforeEach( function(){
				
				var s ="declaration{property:5;}";
				res = mCSS.parse( s );
			} );
			it( "'props' field shoul be an one element array" , function(){
				expect( res[ 0 ].props.length ).toBe( 1 );
			});
			it( "property 's field 'name' should be correct" , function(){
				expect( res[ 0 ].props[ 0 ].name ).toBe( "property" );
			});
		} );
		
		describe("with one declaration that contains severals property", function() {
			var res = null;
			beforeEach( function(){
				
				var s ="declaration{property1:5;property2:5;property3:5;}";
				res = mCSS.parse( s );
			} );
			it( "'props' field shoul be array with correct size" , function(){
				expect( res[ 0 ].props.length ).toBe( 3 );
			});
			it( "property 's field 'name' should be correct, and in the correct order" , function(){
				expect( res[ 0 ].props[ 0 ].name ).toBe( "property1" );
				expect( res[ 0 ].props[ 1 ].name ).toBe( "property2" );
				expect( res[ 0 ].props[ 2 ].name ).toBe( "property3" );
			});
		} );
	});
	
	describe("property", function() {
		
		describe("multiple entry property", function() {
			var res = null;
			beforeEach( function(){
				
				var s ="declaration{property:1 2 3;}";
				res = mCSS.parse( s );
			} );
			it( "should have register all the entry" , function(){
				expect( res[ 0 ].props[ 0 ].value[ 0 ].length ).toBe( 3 );
			});
			it( "should have register the entry in correct order" , function(){
				expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].value ).toBe( 1 );
				expect( res[ 0 ].props[ 0 ].value[ 0 ][ 1 ].value ).toBe( 2 );
				expect( res[ 0 ].props[ 0 ].value[ 0 ][ 2 ].value ).toBe( 3 );
			});
		});
		describe("multiple set of entry property", function() {
			var res = null;
			beforeEach( function(){
				
				var s ="declaration{property:1 2 3,4 5 6;}";
				res = mCSS.parse( s );
			} );
			it( "should have register all the set" , function(){
				expect( res[ 0 ].props[ 0 ].value.length ).toBe( 2 );
			});
			it( "should have register the set in correct order" , function(){
				expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].value ).toBe( 1 );
				expect( res[ 0 ].props[ 0 ].value[ 0 ][ 1 ].value ).toBe( 2 );
				expect( res[ 0 ].props[ 0 ].value[ 0 ][ 2 ].value ).toBe( 3 );
				
				expect( res[ 0 ].props[ 0 ].value[ 1 ][ 0 ].value ).toBe( 4 );
				expect( res[ 0 ].props[ 0 ].value[ 1 ][ 1 ].value ).toBe( 5 );
				expect( res[ 0 ].props[ 0 ].value[ 1 ][ 2 ].value ).toBe( 6 );
			});
		});
		
		describe("float values", function() {
			describe("value with no mesure", function() {
				var res = null;
				beforeEach( function(){
					
					var s ="declaration{property:1;}";
					res = mCSS.parse( s );
				} );
				it( "should have the 'mesure' field to 'none'" , function(){
					expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].mesure ).toBe( 'none' );
				});
			});
			describe("value with 'px' mesure", function() {
				var res = null;
				beforeEach( function(){
					
					var s ="declaration{property:1px;}";
					res = mCSS.parse( s );
				} );
				it( "should have the 'mesure' field to 'px'" , function(){
					expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].mesure ).toBe( 'px' );
				});
			});
			describe("value with '%' mesure", function() {
				var res = null;
				beforeEach( function(){
					
					var s ="declaration{property:1%;}";
					res = mCSS.parse( s );
				} );
				it( "should have the 'mesure' field to 'px'" , function(){
					expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].mesure ).toBe( '%' );
				});
			});
			describe("floating value", function() {
				var res = null;
				beforeEach( function(){
					
					var s ="declaration{property:1.559;}";
					res = mCSS.parse( s );
				} );
				it( "should be a float" , function(){
					expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].value ).toBe( 1.559 );
				});
			});
		});
		
		describe("color", function() {
			
		});
		describe("string value", function() {
			var res = null;
			beforeEach( function(){
				
				var s ="declaration{property:align-left;}";
				res = mCSS.parse( s );
			} );
			it( "should be a string" , function(){
				expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ] ).toBe( "align-left" );
			});
		});
	});
	
	describe("selector", function() {	
		describe("class selector", function() {
			var res = null;
			beforeEach( function(){
				
				var s =".class{}";
				res = mCSS.parse( s );
			} );
			it( "should have the class" , function(){
				expect( res[ 0 ].selector[0].class ).toBe( "class" );
			});
		});
		describe("id selector", function() {
			var res = null;
			beforeEach( function(){
				
				var s ="#id{}";
				res = mCSS.parse( s );
			} );
			it( "should have the id" , function(){
				expect( res[ 0 ].selector[0].id ).toBe( "id" );
			});
		});
		describe("tag selector", function() {
			var res = null;
			beforeEach( function(){
				
				var s ="id{}";
				res = mCSS.parse( s );
			} );
			it( "should have the tag" , function(){
				expect( res[ 0 ].selector[0].tag ).toBe( "id" );
			});
		});
		
		describe("attribute selector", function() {
			describe("has attribute", function() {
				var res = null;
				beforeEach( function(){
					
					var s ="[attribute]{}";
					res = mCSS.parse( s );
				} );
				it( "should have the attribute query" , function(){
					expect( !res[ 0 ].selector[0].attributeQuery.attribute ).toBe( false );
				});
				it( "should have the attribute name" , function(){
					expect( res[ 0 ].selector[0].attributeQuery.attribute ).toBe( "attribute" );
				});
				it( "should have the testFunction" , function(){
					expect( !res[ 0 ].selector[0].attributeQuery.testFunction ).toBe( false );
				});
				it( "should have the testFunction doing what it should" , function(){
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( null ) ).toBe( false );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( 0 ) ).toBe( true );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( "48" ) ).toBe( true );
				});
			});
			
			describe("attribute is equal to", function() {
				describe("with number", function() {
					var res = null;
					beforeEach( function(){
						var s ="[attribute=4.8]{}";
						res = mCSS.parse( s );
					} );
					it( "should have the attribute query" , function(){
						expect( !res[ 0 ].selector[0].attributeQuery.attribute ).toBe( false );
					});
					it( "should have the attribute name" , function(){
						expect( res[ 0 ].selector[0].attributeQuery.attribute ).toBe( "attribute" );
					});
					it( "should have the testFunction" , function(){
						expect( !res[ 0 ].selector[0].attributeQuery.testFunction ).toBe( false );
					});
					it( "should have the testFunction doing what it should" , function(){
						expect( res[ 0 ].selector[0].attributeQuery.testFunction( null ) ).toBe( false );
						expect( res[ 0 ].selector[0].attributeQuery.testFunction( 0 ) ).toBe( false );
						expect( res[ 0 ].selector[0].attributeQuery.testFunction( "48" ) ).toBe( false );
						expect( res[ 0 ].selector[0].attributeQuery.testFunction( "sdqsd8" ) ).toBe( false );
						expect( res[ 0 ].selector[0].attributeQuery.testFunction( "4.8" ) ).toBe( true );
						expect( res[ 0 ].selector[0].attributeQuery.testFunction( 4.8 ) ).toBe( true );
					});
				});
				describe("with string", function() {
					var res = null;
					beforeEach( function(){
						var s ="[attribute=paris]{}";
						res = mCSS.parse( s );
					} );
					it( "should have the attribute query" , function(){
						expect( !res[ 0 ].selector[0].attributeQuery.attribute ).toBe( false );
					});
					it( "should have the attribute name" , function(){
						expect( res[ 0 ].selector[0].attributeQuery.attribute ).toBe( "attribute" );
					});
					it( "should have the testFunction" , function(){
						expect( !res[ 0 ].selector[0].attributeQuery.testFunction ).toBe( false );
					});
					it( "should have the testFunction doing what it should" , function(){
						expect( res[ 0 ].selector[0].attributeQuery.testFunction( null ) ).toBe( false );
						expect( res[ 0 ].selector[0].attributeQuery.testFunction( 0 ) ).toBe( false );
						expect( res[ 0 ].selector[0].attributeQuery.testFunction( "48" ) ).toBe( false );
						expect( res[ 0 ].selector[0].attributeQuery.testFunction( "paris" ) ).toBe( true );
					});
				});
			});
			
			describe("attribute is upper than", function() {
				var res = null;
				beforeEach( function(){
					
					var s ="[attribute>4.8]{}";
					res = mCSS.parse( s );
				} );
				it( "should have the attribute query" , function(){
					expect( !res[ 0 ].selector[0].attributeQuery.attribute ).toBe( false );
				});
				it( "should have the attribute name" , function(){
					expect( res[ 0 ].selector[0].attributeQuery.attribute ).toBe( "attribute" );
				});
				it( "should have the testFunction" , function(){
					expect( !res[ 0 ].selector[0].attributeQuery.testFunction ).toBe( false );
				});
				it( "should have the testFunction doing what it should" , function(){
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( null ) ).toBe( false );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( 0 ) ).toBe( false );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( "48" ) ).toBe( true );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( "3" ) ).toBe( false );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( "aad" ) ).toBe( false );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( 4.8 ) ).toBe( false );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( 5 ) ).toBe( true );
				});
			});
			describe("attribute is upper than or equal", function() {
				var res = null;
				beforeEach( function(){
					
					var s ="[attribute>=4.8]{}";
					res = mCSS.parse( s );
				} );
				it( "should have the attribute query" , function(){
					expect( !res[ 0 ].selector[0].attributeQuery.attribute ).toBe( false );
				});
				it( "should have the attribute name" , function(){
					expect( res[ 0 ].selector[0].attributeQuery.attribute ).toBe( "attribute" );
				});
				it( "should have the testFunction" , function(){
					expect( !res[ 0 ].selector[0].attributeQuery.testFunction ).toBe( false );
				});
				it( "should have the testFunction doing what it should" , function(){
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( null ) ).toBe( false );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( 0 ) ).toBe( false );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( "48" ) ).toBe( true );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( "3" ) ).toBe( false );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( "qqq" ) ).toBe( false );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( 4.8 ) ).toBe( true );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( 5 ) ).toBe( true );
				});
			});
			describe("attribute is lower than", function() {
				var res = null;
				beforeEach( function(){
					
					var s ="[attribute<4.8]{}";
					res = mCSS.parse( s );
				} );
				it( "should have the attribute query" , function(){
					expect( !res[ 0 ].selector[0].attributeQuery.attribute ).toBe( false );
				});
				it( "should have the attribute name" , function(){
					expect( res[ 0 ].selector[0].attributeQuery.attribute ).toBe( "attribute" );
				});
				it( "should have the testFunction" , function(){
					expect( !res[ 0 ].selector[0].attributeQuery.testFunction ).toBe( false );
				});
				it( "should have the testFunction doing what it should" , function(){
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( null ) ).toBe( false );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( 0 ) ).toBe( true );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( "48" ) ).toBe( false );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( "ssfs8" ) ).toBe( false );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( "3" ) ).toBe( true );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( 4.8 ) ).toBe( false );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( 5 ) ).toBe( false );
				});
			});
			describe("attribute is lower than or equal", function() {
				var res = null;
				beforeEach( function(){
					
					var s ="[attribute<=4.8]{}";
					res = mCSS.parse( s );
				} );
				it( "should have the attribute query" , function(){
					expect( !res[ 0 ].selector[0].attributeQuery.attribute ).toBe( false );
				});
				it( "should have the attribute name" , function(){
					expect( res[ 0 ].selector[0].attributeQuery.attribute ).toBe( "attribute" );
				});
				it( "should have the testFunction" , function(){
					expect( !res[ 0 ].selector[0].attributeQuery.testFunction ).toBe( false );
				});
				it( "should have the testFunction doing what it should" , function(){
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( null ) ).toBe( false );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( 0 ) ).toBe( true );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( "48" ) ).toBe( false );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( "qsqq8" ) ).toBe( false );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( "3" ) ).toBe( true );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( 4.8 ) ).toBe( true );
					expect( res[ 0 ].selector[0].attributeQuery.testFunction( 5 ) ).toBe( false );
				});
			});
		});
	});
});




