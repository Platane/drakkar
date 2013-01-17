

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
				expect( res[ 0 ].selectors ).not.toBeNull();
				expect( res[ 0 ].props ).not.toBeNull();
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
				expect( res[ 0 ].selectors ).not.toBeNull();
				expect( res[ 0 ].props ).not.toBeNull();
				
				expect( !res[ 1 ].selectors ).not.toBeNull();
				expect( !res[ 1 ].props ).not.toBeNull();
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
				
				var s ="declaration{property:1 2 3,4 5 6,7 8 9;}";
				res = mCSS.parse( s );
			} );
			it( "should have register all the sets" , function(){
				expect( res[ 0 ].props[ 0 ].value.length ).toBe( 3 );
			});
			it( "should have register the set in correct order" , function(){
				expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].value ).toBe( 1 );
				expect( res[ 0 ].props[ 0 ].value[ 0 ][ 1 ].value ).toBe( 2 );
				expect( res[ 0 ].props[ 0 ].value[ 0 ][ 2 ].value ).toBe( 3 );
				
				expect( res[ 0 ].props[ 0 ].value[ 1 ][ 0 ].value ).toBe( 4 );
				expect( res[ 0 ].props[ 0 ].value[ 1 ][ 1 ].value ).toBe( 5 );
				expect( res[ 0 ].props[ 0 ].value[ 1 ][ 2 ].value ).toBe( 6 );
				
				expect( res[ 0 ].props[ 0 ].value[ 2 ][ 0 ].value ).toBe( 7 );
				expect( res[ 0 ].props[ 0 ].value[ 2 ][ 1 ].value ).toBe( 8 );
				expect( res[ 0 ].props[ 0 ].value[ 2 ][ 2 ].value ).toBe( 9 );
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
			describe("hexadecimal value ( 3 chars )", function() {
				describe("with lower case", function() {
					var res = null;
					beforeEach( function(){
						
						var s ="declaration{property:#af2;}";
						res = mCSS.parse( s );
					} );
					it( "should return correct rvba value" , function(){
						expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].r ).toBe( 170 );
						expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].v ).toBe( 255 );
						expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].b ).toBe( 34 );
						expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].a ).toBe( 1 );
					});
				});
				describe("with upper case", function() {
					var res = null;
					beforeEach( function(){
						
						var s ="declaration{property:#AF2;}";
						res = mCSS.parse( s );
					} );
					it( "should return correct rvba value" , function(){
						expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].r ).toBe( 170 );
						expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].v ).toBe( 255 );
						expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].b ).toBe( 34 );
						expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].a ).toBe( 1 );
					});
				});
			});
			describe("hexadecimal value ( 6 chars )", function() {
				describe("with lower case", function() {
					var res = null;
					beforeEach( function(){
						
						var s ="declaration{property:#84a202;}";
						res = mCSS.parse( s );
					} );
					it( "should return correct rvba value" , function(){
						expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].r ).toBe( 132 );
						expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].v ).toBe( 162 );
						expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].b ).toBe( 2 );
						expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].a ).toBe( 1 );
					});
				});
				describe("with upper case", function() {
					var res = null;
					beforeEach( function(){
						
						var s ="declaration{property:#84A202;}";
						res = mCSS.parse( s );
					} );
					it( "should return correct rvba value" , function(){
						expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].r ).toBe( 132 );
						expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].v ).toBe( 162 );
						expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].b ).toBe( 2 );
						expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].a ).toBe( 1 );
					});
				});
			});
			describe("rgb( x , x , x ) form", function() {
				var res = null;
				beforeEach( function(){
					
					var s ="declaration{property:rgb(132,162,2);}";
					res = mCSS.parse( s );
				} );
				it( "should return correct rvba value" , function(){
					expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].r ).toBe( 132 );
					expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].v ).toBe( 162 );
					expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].b ).toBe( 2 );
					expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].a ).toBe( 1 );
				});
			});
			describe("rgba( x , x , x , x ) form", function() {
				var res = null;
				beforeEach( function(){
					
					var s ="declaration{property:rgba(132,162,2,0.33);}";
					res = mCSS.parse( s );
				} );
				it( "should return correct rvba value" , function(){
					expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].r ).toBe( 132 );
					expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].v ).toBe( 162 );
					expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].b ).toBe( 2 );
					expect( res[ 0 ].props[ 0 ].value[ 0 ][ 0 ].a ).toBe( 0.33 );
				});
			});
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
				expect( res[ 0 ].selectors[0][0].class ).not.toBeNull();
				expect( res[ 0 ].selectors[0][0].class ).toBe( "class" );
			});
		});
		describe("id selector", function() {
			var res = null;
			beforeEach( function(){
				
				var s ="#id{}";
				res = mCSS.parse( s );
			} );
			it( "should have the id" , function(){
				expect( res[ 0 ].selectors[0][0].id ).not.toBeNull();
				expect( res[ 0 ].selectors[0][0].id ).toBe( "id" );
			});
		});
		describe("tag selector", function() {
			var res = null;
			beforeEach( function(){
				
				var s ="id{}";
				res = mCSS.parse( s );
			} );
			it( "should have the tag" , function(){
				expect( res[ 0 ].selectors[0][0].tag ).not.toBeNull();
				expect( res[ 0 ].selectors[0][0].tag ).toBe( "id" );
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
					expect( !res[ 0 ].selectors[0][0].attributeQuery.attribute ).toBe( false );
				});
				it( "should have the attribute name" , function(){
					expect( res[ 0 ].selectors[0][0].attributeQuery.attribute ).toBe( "attribute" );
				});
				it( "should have the testFunction" , function(){
					expect( !res[ 0 ].selectors[0][0].attributeQuery.testFunction ).toBe( false );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction ).not.toBeNull();
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction ).not.toBeUndefined();
					
				});
				it( "should have the testFunction doing what it should" , function(){
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( null ) ).toBe( false );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( 0 ) ).toBe( true );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( "48" ) ).toBe( true );
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
						expect( !res[ 0 ].selectors[0][0].attributeQuery.attribute ).toBe( false );
					});
					it( "should have the attribute name" , function(){
						expect( res[ 0 ].selectors[0][0].attributeQuery.attribute ).toBe( "attribute" );
					});
					it( "should have the testFunction" , function(){
						expect( !res[ 0 ].selectors[0][0].attributeQuery.testFunction ).toBe( false );
						expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction ).not.toBeNull();
						expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction ).not.toBeUndefined();
					
					});
					it( "should have the testFunction doing what it should" , function(){
						expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( null ) ).toBe( false );
						expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( 0 ) ).toBe( false );
						expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( "48" ) ).toBe( false );
						expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( "sdqsd8" ) ).toBe( false );
						expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( "4.8" ) ).toBe( true );
						expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( 4.8 ) ).toBe( true );
					});
				});
				describe("with string", function() {
					var res = null;
					beforeEach( function(){
						var s ="[attribute=paris]{}";
						res = mCSS.parse( s );
					} );
					it( "should have the attribute query" , function(){
						expect( !res[ 0 ].selectors[0][0].attributeQuery.attribute ).toBe( false );
					});
					it( "should have the attribute name" , function(){
						expect( res[ 0 ].selectors[0][0].attributeQuery.attribute ).toBe( "attribute" );
					});
					it( "should have the testFunction" , function(){
						expect( !res[ 0 ].selectors[0][0].attributeQuery.testFunction ).toBe( false );
						expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction ).not.toBeNull();
						expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction ).not.toBeUndefined();
					
					});
					it( "should have the testFunction doing what it should" , function(){
						expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( null ) ).toBe( false );
						expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( 0 ) ).toBe( false );
						expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( "48" ) ).toBe( false );
						expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( "paris" ) ).toBe( true );
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
					expect( !res[ 0 ].selectors[0][0].attributeQuery.attribute ).toBe( false );
				});
				it( "should have the attribute name" , function(){
					expect( res[ 0 ].selectors[0][0].attributeQuery.attribute ).toBe( "attribute" );
				});
				it( "should have the testFunction" , function(){
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction ).not.toBeNull();
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction ).not.toBeUndefined();
					expect( !res[ 0 ].selectors[0][0].attributeQuery.testFunction ).toBe( false );
				});
				it( "should have the testFunction doing what it should" , function(){
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( null ) ).toBe( false );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( 0 ) ).toBe( false );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( "48" ) ).toBe( true );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( "3" ) ).toBe( false );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( "aad" ) ).toBe( false );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( 4.8 ) ).toBe( false );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( 5 ) ).toBe( true );
				});
			});
			describe("attribute is upper than or equal", function() {
				var res = null;
				beforeEach( function(){
					
					var s ="[attribute>=4.8]{}";
					res = mCSS.parse( s );
				} );
				it( "should have the attribute query" , function(){
					expect( !res[ 0 ].selectors[0][0].attributeQuery.attribute ).toBe( false );
				});
				it( "should have the attribute name" , function(){
					expect( res[ 0 ].selectors[0][0].attributeQuery.attribute ).toBe( "attribute" );
				});
				it( "should have the testFunction" , function(){
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction ).not.toBeNull();
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction ).not.toBeUndefined();
					expect( !res[ 0 ].selectors[0][0].attributeQuery.testFunction ).toBe( false );
				});
				it( "should have the testFunction doing what it should" , function(){
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( null ) ).toBe( false );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( 0 ) ).toBe( false );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( "48" ) ).toBe( true );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( "3" ) ).toBe( false );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( "qqq" ) ).toBe( false );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( 4.8 ) ).toBe( true );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( 5 ) ).toBe( true );
				});
			});
			describe("attribute is lower than", function() {
				var res = null;
				beforeEach( function(){
					
					var s ="[attribute<4.8]{}";
					res = mCSS.parse( s );
				} );
				it( "should have the attribute query" , function(){
					expect( !res[ 0 ].selectors[0][0].attributeQuery.attribute ).toBe( false );
				});
				it( "should have the attribute name" , function(){
					expect( res[ 0 ].selectors[0][0].attributeQuery.attribute ).toBe( "attribute" );
				});
				it( "should have the testFunction" , function(){
					expect( !res[ 0 ].selectors[0][0].attributeQuery.testFunction ).toBe( false );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction ).not.toBeNull();
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction ).not.toBeUndefined();
					
				});
				it( "should have the testFunction doing what it should" , function(){
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( null ) ).toBe( false );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( 0 ) ).toBe( true );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( "48" ) ).toBe( false );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( "ssfs8" ) ).toBe( false );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( "3" ) ).toBe( true );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( 4.8 ) ).toBe( false );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( 5 ) ).toBe( false );
				});
			});
			describe("attribute is lower than or equal", function() {
				var res = null;
				beforeEach( function(){
					
					var s ="[attribute<=4.8]{}";
					res = mCSS.parse( s );
				} );
				it( "should have the attribute query" , function(){
					expect( !res[ 0 ].selectors[0][0].attributeQuery.attribute ).toBe( false );
				});
				it( "should have the attribute name" , function(){
					expect( res[ 0 ].selectors[0][0].attributeQuery.attribute ).toBe( "attribute" );
				});
				it( "should have the testFunction" , function(){
					expect( !res[ 0 ].selectors[0][0].attributeQuery.testFunction ).toBe( false );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction ).not.toBeNull();
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction ).not.toBeUndefined();
					
				});
				it( "should have the testFunction doing what it should" , function(){
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( null ) ).toBe( false );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( 0 ) ).toBe( true );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( "48" ) ).toBe( false );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( "qsqq8" ) ).toBe( false );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( "3" ) ).toBe( true );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( 4.8 ) ).toBe( true );
					expect( res[ 0 ].selectors[0][0].attributeQuery.testFunction( 5 ) ).toBe( false );
				});
			});
		});
		describe("ancestor selector", function() {
			var res = null;
			beforeEach( function(){
				
				var s ="id1.class1 id2.class2 id3.class3 id4.class4{}";
				res = mCSS.parse( s );
			} );
			it( "should target the children" , function(){
				expect( res[ 0 ].selectors[0][0].tag ).not.toBeNull();
				expect( res[ 0 ].selectors[0][0].tag ).not.toBeUndefined();
				expect( res[ 0 ].selectors[0][0].tag ).toBe( "id4" );
				expect( res[ 0 ].selectors[0][1].class ).not.toBeNull();
				expect( res[ 0 ].selectors[0][1].class ).toBe( "class4" );
			});
			it( "should have the ancestor selector" , function(){
				expect( res[ 0 ].selectors[0][2].parent ).not.toBeNull();
				expect( res[ 0 ].selectors[0][2].parent ).not.toBeUndefined();
			});
			it( "should have the correct ancestor" , function(){
				expect( res[ 0 ].selectors[0][2].parent[0].tag ).not.toBeNull();
				expect( res[ 0 ].selectors[0][2].parent[0].tag ).not.toBeUndefined();
				expect( res[ 0 ].selectors[0][2].parent[0].tag ).toBe( "id3" );
				expect( res[ 0 ].selectors[0][2].parent[1].class ).not.toBeNull();
				expect( res[ 0 ].selectors[0][2].parent[1].class ).not.toBeUndefined();
				expect( res[ 0 ].selectors[0][2].parent[1].class ).toBe( "class3" );
			});
			it( "should have the correct ancestors" , function(){
				expect( res[ 0 ].selectors[0][2].parent[2].parent[0].tag ).not.toBeNull();
				expect( res[ 0 ].selectors[0][2].parent[2].parent[0].tag ).not.toBeUndefined();
				expect( res[ 0 ].selectors[0][2].parent[2].parent[0].tag ).toBe( "id2" );
				expect( res[ 0 ].selectors[0][2].parent[2].parent[1].class ).not.toBeNull();
				expect( res[ 0 ].selectors[0][2].parent[2].parent[1].class ).not.toBeUndefined();
				expect( res[ 0 ].selectors[0][2].parent[2].parent[1].class ).toBe( "class2" );
				
				expect( res[ 0 ].selectors[0][2].parent[2].parent[2].parent[0].tag ).not.toBeNull();
				expect( res[ 0 ].selectors[0][2].parent[2].parent[2].parent[0].tag ).not.toBeUndefined();
				expect( res[ 0 ].selectors[0][2].parent[2].parent[2].parent[0].tag ).toBe( "id1" );
				expect( res[ 0 ].selectors[0][2].parent[2].parent[2].parent[1].class ).not.toBeNull();
				expect( res[ 0 ].selectors[0][2].parent[2].parent[2].parent[1].class ).not.toBeUndefined();
				expect( res[ 0 ].selectors[0][2].parent[2].parent[2].parent[1].class ).toBe( "class1" );
			});
		});
	});
	describe("meaningless chars acceptation", function() {
		var charTable = [ {c:" " , lbl:"space"} , {c:"\t" , lbl:"tabulation"} , {c:"\n" , lbl:"line break"} , {c:" \t \n\n  ", lbl:"mix" } ];
		for( var i = 0 ; i < charTable.length ; i++ )
			(function(){
				var j = i;
				var c = charTable[j].c;
				describe("insert "+charTable[j].lbl , function() {
					describe("before declarations", function() {
						var res = null;
						beforeEach( function(){
							var s = c+"declaration .child{property:1px 2,1% align;}";
							res = mCSS.parse( s );
						} );
						it( "should return the structure" , function(){
							expect( res.length ).toBe( 1 );
							expect( res[ 0 ].props.length ).toBe( 1 );
							expect( res[ 0 ].props[ 0 ].name ).toBe( "property" );
							expect( res[ 0 ].selectors.length ).toBe( 1 );
							expect( res[ 0 ].selectors[0][0].class ).toBe( "child" );
							expect( res[ 0 ].selectors[0][1].parent[0].tag ).toBe( "declaration" );
						});
					});
					describe("after declarations", function() {
						var res = null;
						beforeEach( function(){
							var s = "declaration .child{property:1px 2,1% align;}"+c;
							res = mCSS.parse( s );
						} );
						it( "should return the structure" , function(){
							expect( res.length ).toBe( 1 );
							expect( res[ 0 ].props.length ).toBe( 1 );
							expect( res[ 0 ].props[ 0 ].name ).toBe( "property" );
							expect( res[ 0 ].selectors.length ).toBe( 1 );
							expect( res[ 0 ].selectors[0][0].class ).toBe( "child" );
							expect( res[ 0 ].selectors[0][1].parent[0].tag ).toBe( "declaration" );
						});
					});
					describe("between declarations", function() {
						var res = null;
						beforeEach( function(){
							var s = "declaration .child{property:1px 2,1% align;}"+c+"declaration{}";
							res = mCSS.parse( s );
						} );
						it( "should return the structure" , function(){
							expect( res.length ).toBe( 2 );
							expect( res[ 0 ].props.length ).toBe( 1 );
							expect( res[ 0 ].props[ 0 ].name ).toBe( "property" );
							expect( res[ 0 ].selectors.length ).toBe( 1 );
							expect( res[ 0 ].selectors[0][0].class ).toBe( "child" );
							expect( res[ 0 ].selectors[0][1].parent[0].tag ).toBe( "declaration" );
						});
					});
					describe("between selector and bracket", function() {
						var res = null;
						beforeEach( function(){
							var s = "declaration .child"+c+"{property:1px 2,1% align;}";
							res = mCSS.parse( s );
						} );
						it( "should return the structure" , function(){
							expect( res.length ).toBe( 1 );
							expect( res[ 0 ].props.length ).toBe( 1 );
							expect( res[ 0 ].props[ 0 ].name ).toBe( "property" );
							expect( res[ 0 ].selectors.length ).toBe( 1 );
							expect( res[ 0 ].selectors[0][0].class ).toBe( "child" );
							expect( res[ 0 ].selectors[0][1].parent[0].tag ).toBe( "declaration" );
						});
					});
					describe("before properties", function() {
						var res = null;
						beforeEach( function(){
							var s = "declaration .child{"+c+"property:1px 2,1% align;property2:1px 2,1% align;}";
							res = mCSS.parse( s );
						} );
						it( "should return the structure" , function(){
							expect( res.length ).toBe( 1 );
							expect( res[ 0 ].props.length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].name ).toBe( "property" );
							expect( res[ 0 ].props[ 1 ].name ).toBe( "property2" );
							expect( res[ 0 ].selectors.length ).toBe( 1 );
							expect( res[ 0 ].selectors[0][0].class ).toBe( "child" );
							expect( res[ 0 ].selectors[0][1].parent[0].tag ).toBe( "declaration" );
						});
					});
					describe("after properties", function() {
						var res = null;
						beforeEach( function(){
							var s = "declaration .child{property:1px 2,1% align;property2:1px 2,1% align;"+c+"}";
							res = mCSS.parse( s );
						} );
						it( "should return the structure" , function(){
							expect( res.length ).toBe( 1 );
							expect( res[ 0 ].props.length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].name ).toBe( "property" );
							expect( res[ 0 ].props[ 1 ].name ).toBe( "property2" );
							expect( res[ 0 ].selectors.length ).toBe( 1 );
							expect( res[ 0 ].selectors[0][0].class ).toBe( "child" );
							expect( res[ 0 ].selectors[0][1].parent[0].tag ).toBe( "declaration" );
						});
					});
					describe("between properties", function() {
						var res = null;
						beforeEach( function(){
							var s = "declaration .child{property:1px 2,1% align;"+c+"property2:1px 2,1% align;}";
							res = mCSS.parse( s );
						} );
						it( "should return the structure" , function(){
							expect( res.length ).toBe( 1 );
							expect( res[ 0 ].props.length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].name ).toBe( "property" );
							expect( res[ 0 ].props[ 1 ].name ).toBe( "property2" );
							expect( res[ 0 ].selectors.length ).toBe( 1 );
							expect( res[ 0 ].selectors[0][0].class ).toBe( "child" );
							expect( res[ 0 ].selectors[0][1].parent[0].tag ).toBe( "declaration" );
						});
					});
					describe("between property name and points", function() {
						var res = null;
						beforeEach( function(){
							var s = "declaration .child{property"+c+":1px 2,1% align;property2:1px 2,1% align;}";
							res = mCSS.parse( s );
						} );
						it( "should return the structure" , function(){
							expect( res.length ).toBe( 1 );
							expect( res[ 0 ].props.length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].name ).toBe( "property" );
							expect( res[ 0 ].props[ 0 ].value.length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[0].length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[0][0].value ).toBe( 1 );
							expect( res[ 0 ].props[ 0 ].value[0][1].value ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[1][0].value ).toBe( 1 );
							expect( res[ 0 ].props[ 0 ].value[1][1] ).toBe( "align" );
							expect( res[ 0 ].props[ 1 ].name ).toBe( "property2" );
							expect( res[ 0 ].selectors.length ).toBe( 1 );
							expect( res[ 0 ].selectors[0][0].class ).toBe( "child" );
							expect( res[ 0 ].selectors[0][1].parent[0].tag ).toBe( "declaration" );
						});
					});
					describe("between property points and entries sets", function() {
						var res = null;
						beforeEach( function(){
							var s = "declaration .child{property:"+c+"1px 2,1% align;property2:1px 2,1% align;}";
							res = mCSS.parse( s );
						} );
						it( "should return the structure" , function(){
							expect( res.length ).toBe( 1 );
							expect( res[ 0 ].props.length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].name ).toBe( "property" );
							expect( res[ 0 ].props[ 0 ].value.length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[0].length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[0][0].value ).toBe( 1 );
							expect( res[ 0 ].props[ 0 ].value[0][1].value ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[1][0].value ).toBe( 1 );
							expect( res[ 0 ].props[ 0 ].value[1][1] ).toBe( "align" );
							expect( res[ 0 ].props[ 1 ].name ).toBe( "property2" );
							expect( res[ 0 ].selectors.length ).toBe( 1 );
							expect( res[ 0 ].selectors[0][0].class ).toBe( "child" );
							expect( res[ 0 ].selectors[0][1].parent[0].tag ).toBe( "declaration" );
						});
					});
					describe("between property points and entries sets", function() {
						var res = null;
						beforeEach( function(){
							var s = "declaration .child{property:"+c+"1px 2,1% align;property2:1px 2,1% align;}";
							res = mCSS.parse( s );
						} );
						it( "should return the structure" , function(){
							expect( res.length ).toBe( 1 );
							expect( res[ 0 ].props.length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].name ).toBe( "property" );
							expect( res[ 0 ].props[ 0 ].value.length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[0].length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[0][0].value ).toBe( 1 );
							expect( res[ 0 ].props[ 0 ].value[0][1].value ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[1][0].value ).toBe( 1 );
							expect( res[ 0 ].props[ 0 ].value[1][1] ).toBe( "align" );
							expect( res[ 0 ].props[ 1 ].name ).toBe( "property2" );
							expect( res[ 0 ].selectors.length ).toBe( 1 );
							expect( res[ 0 ].selectors[0][0].class ).toBe( "child" );
							expect( res[ 0 ].selectors[0][1].parent[0].tag ).toBe( "declaration" );
						});
					});
					describe("between sets ( before , )", function() {
						var res = null;
						beforeEach( function(){
							var s = "declaration .child{property:1px 2"+c+",1% align;property2:1px 2,1% align;}";
							res = mCSS.parse( s );
						} );
						it( "should return the structure" , function(){
							expect( res.length ).toBe( 1 );
							expect( res[ 0 ].props.length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].name ).toBe( "property" );
							expect( res[ 0 ].props[ 0 ].value.length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[0].length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[0][0].value ).toBe( 1 );
							expect( res[ 0 ].props[ 0 ].value[0][1].value ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[1][0].value ).toBe( 1 );
							expect( res[ 0 ].props[ 0 ].value[1][1] ).toBe( "align" );
							expect( res[ 0 ].props[ 1 ].name ).toBe( "property2" );
							expect( res[ 0 ].selectors.length ).toBe( 1 );
							expect( res[ 0 ].selectors[0][0].class ).toBe( "child" );
							expect( res[ 0 ].selectors[0][1].parent[0].tag ).toBe( "declaration" );
						});
					});
					describe("between sets ( after , )", function() {
						var res = null;
						beforeEach( function(){
							var s = "declaration .child{property:1px 2,"+c+"1% align;property2:1px 2,1% align;}";
							res = mCSS.parse( s );
						} );
						it( "should return the structure" , function(){
							expect( res.length ).toBe( 1 );
							expect( res[ 0 ].props.length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].name ).toBe( "property" );
							expect( res[ 0 ].props[ 0 ].value.length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[0].length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[0][0].value ).toBe( 1 );
							expect( res[ 0 ].props[ 0 ].value[0][1].value ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[1][0].value ).toBe( 1 );
							expect( res[ 0 ].props[ 0 ].value[1][1] ).toBe( "align" );
							expect( res[ 0 ].props[ 1 ].name ).toBe( "property2" );
							expect( res[ 0 ].selectors.length ).toBe( 1 );
							expect( res[ 0 ].selectors[0][0].class ).toBe( "child" );
							expect( res[ 0 ].selectors[0][1].parent[0].tag ).toBe( "declaration" );
						});
					});
					describe("at the end of sets", function() {
						var res = null;
						beforeEach( function(){
							var s = "declaration .child{property:1px 2,1% align"+c+";property2:1px 2,1% align;}";
							res = mCSS.parse( s );
						} );
						it( "should return the structure" , function(){
							expect( res.length ).toBe( 1 );
							expect( res[ 0 ].props.length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].name ).toBe( "property" );
							expect( res[ 0 ].props[ 0 ].value.length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[0].length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[0][0].value ).toBe( 1 );
							expect( res[ 0 ].props[ 0 ].value[0][1].value ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[1][0].value ).toBe( 1 );
							expect( res[ 0 ].props[ 0 ].value[1][1] ).toBe( "align" );
							expect( res[ 0 ].props[ 1 ].name ).toBe( "property2" );
							expect( res[ 0 ].selectors.length ).toBe( 1 );
							expect( res[ 0 ].selectors[0][0].class ).toBe( "child" );
							expect( res[ 0 ].selectors[0][1].parent[0].tag ).toBe( "declaration" );
						});
					});
					describe("between properties ( before space )", function() {
						var res = null;
						beforeEach( function(){
							var s = "declaration .child{property:1px"+c+" 2,1% align;property2:1px 2,1% align;}";
							res = mCSS.parse( s );
						} );
						it( "should return the structure" , function(){
							expect( res.length ).toBe( 1 );
							expect( res[ 0 ].props.length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].name ).toBe( "property" );
							expect( res[ 0 ].props[ 0 ].value.length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[0].length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[0][0].value ).toBe( 1 );
							expect( res[ 0 ].props[ 0 ].value[0][1].value ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[1][0].value ).toBe( 1 );
							expect( res[ 0 ].props[ 0 ].value[1][1] ).toBe( "align" );
							expect( res[ 0 ].props[ 1 ].name ).toBe( "property2" );
							expect( res[ 0 ].selectors.length ).toBe( 1 );
							expect( res[ 0 ].selectors[0][0].class ).toBe( "child" );
							expect( res[ 0 ].selectors[0][1].parent[0].tag ).toBe( "declaration" );
						});
					});
					describe("between properties ( after space )", function() {
						var res = null;
						beforeEach( function(){
							var s = "declaration .child{property:1px "+c+"2,1% align;property2:1px 2,1% align;}";
							res = mCSS.parse( s );
						} );
						it( "should return the structure" , function(){
							expect( res.length ).toBe( 1 );
							expect( res[ 0 ].props.length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].name ).toBe( "property" );
							expect( res[ 0 ].props[ 0 ].value.length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[0].length ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[0][0].value ).toBe( 1 );
							expect( res[ 0 ].props[ 0 ].value[0][1].value ).toBe( 2 );
							expect( res[ 0 ].props[ 0 ].value[1][0].value ).toBe( 1 );
							expect( res[ 0 ].props[ 0 ].value[1][1] ).toBe( "align" );
							expect( res[ 0 ].props[ 1 ].name ).toBe( "property2" );
							expect( res[ 0 ].selectors.length ).toBe( 1 );
							expect( res[ 0 ].selectors[0][0].class ).toBe( "child" );
							expect( res[ 0 ].selectors[0][1].parent[0].tag ).toBe( "declaration" );
						});
					});
					describe("in rgb declaration (everywhere)", function() {
						var res = null;
						beforeEach( function(){
							var s = "declaration .child{property:rgb("+c+"45"+c+","+c+"182"+c+","+c+"58"+c+");}";
							res = mCSS.parse( s );
						} );
						it( "should return the structure" , function(){
							expect( res[ 0 ].props[ 0 ].name ).toBe( "property" );
							expect( res[ 0 ].props[ 0 ].value[0][0].r ).toBe( 45 );
							expect( res[ 0 ].props[ 0 ].value[0][0].v ).toBe( 182 );
							expect( res[ 0 ].props[ 0 ].value[0][0].b ).toBe( 58 );
						});
					});
					describe("in rgba declaration (everywhere)", function() {
						var res = null;
						beforeEach( function(){
							var s = "declaration .child{property:rgba("+c+"45"+c+","+c+"182"+c+","+c+"58"+c+","+c+"0.33"+c+");}";
							res = mCSS.parse( s );
						} );
						it( "should return the structure" , function(){
							expect( res[ 0 ].props[ 0 ].name ).toBe( "property" );
							expect( res[ 0 ].props[ 0 ].value[0][0].r ).toBe( 45 );
							expect( res[ 0 ].props[ 0 ].value[0][0].v ).toBe( 182 );
							expect( res[ 0 ].props[ 0 ].value[0][0].b ).toBe( 58 );
							expect( res[ 0 ].props[ 0 ].value[0][0].a ).toBe( 0.33 );
						});
					});
				});
			})();
	});
});




