	describe("Semantic analysis", function() {
		describe("properties interpretation", function() {
			describe("strocke-color", function() {
				var res = null;
				beforeEach( function(){
					var s ="declaration{strocke-color:#58ab12;}";
					res = mCSS.semanticBuild( mCSS.parse( s ));
				} );
				it( "property should be register" , function(){
					expect( res[0].props["strocke-color"] ).not.toBeNull();
					expect( res[0].props["strocke-color"] ).not.toBeUndefined();
				});
				it( "with correct value" , function(){
					expect( res[0].props["strocke-color"] ).toBe( "#58ab12" );
				});
			});
			describe("strocke-opacity", function() {
				var res = null;
				beforeEach( function(){
					var s ="declaration{strocke-opacity:0.5;}";
					res = mCSS.semanticBuild( mCSS.parse( s ));
				} );
				it( "property should be register" , function(){
					expect( res[0].props["strocke-opacity"] ).not.toBeNull();
					expect( res[0].props["strocke-opacity"] ).not.toBeUndefined();
				});
				it( "with correct value" , function(){
					expect( res[0].props["strocke-opacity"] ).toBe( 0.5 );
				});
			});
			describe("strocke-width", function() {
				var res = null;
				beforeEach( function(){
					var s ="declaration{strocke-width:5;}";
					res = mCSS.semanticBuild( mCSS.parse( s ));
				} );
				it( "property should be register" , function(){
					expect( res[0].props["strocke-width"] ).not.toBeNull();
					expect( res[0].props["strocke-width"] ).not.toBeUndefined();
				});
				it( "with correct value" , function(){
					expect( res[0].props["strocke-width"] ).toBe( 5 );
				});
			});
			describe("strocke", function() {
				var res = null;
				beforeEach( function(){
					var s ="declaration{strocke:5 #58ab25;}";
					res = mCSS.semanticBuild( mCSS.parse( s ));
				} );
				it( "property should be register" , function(){
					expect( res[0].props["strocke-width"] ).not.toBeNull();
					expect( res[0].props["strocke-width"] ).not.toBeUndefined();
					expect( res[0].props["strocke-opacity"] ).not.toBeNull();
					expect( res[0].props["strocke-opacity"] ).not.toBeUndefined();
					expect( res[0].props["strocke-color"] ).not.toBeNull();
					expect( res[0].props["strocke-color"] ).not.toBeUndefined();
				});
				it( "with correct value" , function(){
					expect( res[0].props["strocke-width"] ).toBe( 5 );
					expect( res[0].props["strocke-opacity"] ).toBe( 1 );
					expect( res[0].props["strocke-color"] ).toBe( "#58ab25" );
				});
			});
			describe("fill-color", function() {
				var res = null;
				beforeEach( function(){
					var s ="declaration{fill-color:#58ab12;}";
					res = mCSS.semanticBuild( mCSS.parse( s ));
				} );
				it( "property should be register" , function(){
					expect( res[0].props["fill-color"] ).not.toBeNull();
					expect( res[0].props["fill-color"] ).not.toBeUndefined();
				});
				it( "with correct value" , function(){
					expect( res[0].props["fill-color"] ).toBe( "#58ab12" );
				});
			});
			describe("fill-opacity", function() {
				var res = null;
				beforeEach( function(){
					var s ="declaration{fill-opacity:0.5;}";
					res = mCSS.semanticBuild( mCSS.parse( s ));
				} );
				it( "property should be register" , function(){
					expect( res[0].props["fill-opacity"] ).not.toBeNull();
					expect( res[0].props["fill-opacity"] ).not.toBeUndefined();
				});
				it( "with correct value" , function(){
					expect( res[0].props["fill-opacity"] ).toBe( 0.5 );
				});
			});
			describe("fill", function() {
				var res = null;
				beforeEach( function(){
					var s ="declaration{fill:#58ab25;}";
					res = mCSS.semanticBuild( mCSS.parse( s ));
				} );
				it( "property should be register" , function(){
					expect( res[0].props["fill-opacity"] ).not.toBeNull();
					expect( res[0].props["fill-opacity"] ).not.toBeUndefined();
					expect( res[0].props["fill-color"] ).not.toBeNull();
					expect( res[0].props["fill-color"] ).not.toBeUndefined();
				});
				it( "with correct value" , function(){
					expect( res[0].props["fill-opacity"] ).toBe( 1 );
					expect( res[0].props["fill-color"] ).toBe( "#58ab25" );
				});
			});
		});
	});





