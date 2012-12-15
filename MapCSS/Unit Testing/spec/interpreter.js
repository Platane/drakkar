describe("Interpreter", function() {
	describe("selector resolution", function() {
		var res = null;
		var e1 , e2 , e3 , e4;
		beforeEach( function(){
			var s ="declaration{strocke-color:#58ab12;}";
			mCSS.init( s );
			e4 = new AbstractAttributeHolder();
			e4._classes = { "classA":true, "classB":true, "classC":true };
			e4._attributes = { a1:1 , a2:2 , a3 :3 , a4:4 };
			e4.id = "element4";
			
			e1 = new AbstractAttributeHolder();
			e1._classes = { "classA":true };
			e1._attributes = { a1:1 , a4:1 };
			e1.id = "element1";
			e1.getParent = function(){ return e2 };
			
			e2 = new AbstractAttributeHolder();
			e2._classes = { "classB":true };
			e2._attributes = { a2:2 , a4 :2 };
			e2.id = "element2";
			e2.getParent = function(){ return e3 };
			
			e3 = new AbstractAttributeHolder();
			e3._classes = { "classC":true };
			e3._attributes = { a3:3 , a4 :3 };
			e3.id = "element3";
			e3.getParent = function(){ return e4 };
		});
		
		describe("select by id", function() {
			beforeEach( function(){
				var s ="#element1{strocke-color:#58ab12;}";
				res = mCSS.semanticBuild( mCSS.parse( s ) );
			});
			it( "should select matching elements" , function(){
				expect( mCSS.isConcernBy( e1 , res[0].selectors[0] ) ).toBe( true );
			});
			it( "should not select not matching elements" , function(){
				expect( mCSS.isConcernBy( e2 , res[0].selectors[0] ) ).toBe( false );
				expect( mCSS.isConcernBy( e3 , res[0].selectors[0] ) ).toBe( false );
				expect( mCSS.isConcernBy( e4 , res[0].selectors[0] ) ).toBe( false );
			});
		});
		describe("select by class", function() {
			beforeEach( function(){
				var s =".classA{strocke-color:#58ab12;}";
				res = mCSS.semanticBuild( mCSS.parse( s ) );
			});
			it( "should select matching elements" , function(){
				expect( mCSS.isConcernBy( e1 , res[0].selectors[0] ) ).toBe( true );
				expect( mCSS.isConcernBy( e4 , res[0].selectors[0] ) ).toBe( true );
			});
			it( "should not select not matching elements" , function(){
				expect( mCSS.isConcernBy( e2 , res[0].selectors[0] ) ).toBe( false );
				expect( mCSS.isConcernBy( e3 , res[0].selectors[0] ) ).toBe( false );
			});
		});
		describe("select by attribute", function() {
			describe("has attribute", function() {
				beforeEach( function(){
					var s ="[a1]{strocke-color:#58ab12;}";
					res = mCSS.semanticBuild( mCSS.parse( s ) );
				});
				it( "should select matching elements" , function(){
					expect( mCSS.isConcernBy( e1 , res[0].selectors[0] ) ).toBe( true );
					expect( mCSS.isConcernBy( e4 , res[0].selectors[0] ) ).toBe( true );
				});
				it( "should not select not matching elements" , function(){
					expect( mCSS.isConcernBy( e2 , res[0].selectors[0] ) ).toBe( false );
					expect( mCSS.isConcernBy( e3 , res[0].selectors[0] ) ).toBe( false );
				});
			});
			describe("attribute equal", function() {
				beforeEach( function(){
					var s ="[a4=3]{strocke-color:#58ab12;}";
					res = mCSS.semanticBuild( mCSS.parse( s ) );
				});
				it( "should select matching elements" , function(){
					expect( mCSS.isConcernBy( e3 , res[0].selectors[0] ) ).toBe( true );
				});
				it( "should not select not matching elements" , function(){
					expect( mCSS.isConcernBy( e2 , res[0].selectors[0] ) ).toBe( false );
					expect( mCSS.isConcernBy( e1 , res[0].selectors[0] ) ).toBe( false );
					expect( mCSS.isConcernBy( e4 , res[0].selectors[0] ) ).toBe( false );
				});
			});
			describe("attribute greater", function() {
				beforeEach( function(){
					var s ="[a4>2]{strocke-color:#58ab12;}";
					res = mCSS.semanticBuild( mCSS.parse( s ) );
				});
				it( "should select matching elements" , function(){
					expect( mCSS.isConcernBy( e3 , res[0].selectors[0] ) ).toBe( true );
					expect( mCSS.isConcernBy( e4 , res[0].selectors[0] ) ).toBe( true );
				});
				it( "should not select not matching elements" , function(){
					expect( mCSS.isConcernBy( e2 , res[0].selectors[0] ) ).toBe( false );
					expect( mCSS.isConcernBy( e1 , res[0].selectors[0] ) ).toBe( false );
				});
			});
		});
		describe("select multiple selector", function() {
			beforeEach( function(){
				var s ="[a4].classB{strocke-color:#58ab12;}";
				res = mCSS.semanticBuild( mCSS.parse( s ) );
			});
			it( "should select matching elements" , function(){
				expect( mCSS.isConcernBy( e2 , res[0].selectors[0] ) ).toBe( true );
				expect( mCSS.isConcernBy( e4 , res[0].selectors[0] ) ).toBe( true );
			});
			it( "should not select not matching elements" , function(){
				expect( mCSS.isConcernBy( e1 , res[0].selectors[0] ) ).toBe( false );
				expect( mCSS.isConcernBy( e3 , res[0].selectors[0] ) ).toBe( false );
			});
		});
		describe("select by ancestor ( reccurssive search)", function() {
			beforeEach( function(){
				var s ="#element4 [a4]{strocke-color:#58ab12;}";
				res = mCSS.semanticBuild( mCSS.parse( s ) );
			});
			it( "should select matching elements" , function(){
				expect( mCSS.isConcernBy( e1 , res[0].selectors[0] ) ).toBe( true );
				expect( mCSS.isConcernBy( e2 , res[0].selectors[0] ) ).toBe( true );
				expect( mCSS.isConcernBy( e3 , res[0].selectors[0] ) ).toBe( true );
			});
			it( "should not select not matching elements" , function(){
				expect( mCSS.isConcernBy( e4 , res[0].selectors[0] ) ).toBe( false );
			});
		});
		describe("select by multiple ancestor", function() {
			beforeEach( function(){
				var s ="#element4 [a3] [a2]{strocke-color:#58ab12;}";
				res = mCSS.semanticBuild( mCSS.parse( s ) );
			});
			it( "should select matching elements" , function(){
				expect( mCSS.isConcernBy( e2 , res[0].selectors[0] ) ).toBe( true );
			});
			it( "should not select not matching elements" , function(){
				expect( mCSS.isConcernBy( e1 , res[0].selectors[0] ) ).toBe( false );
				expect( mCSS.isConcernBy( e3 , res[0].selectors[0] ) ).toBe( false );
				expect( mCSS.isConcernBy( e4 , res[0].selectors[0] ) ).toBe( false );
			});
		});
		describe("select with mixed selectors", function() {
			beforeEach( function(){
				var s ="#element4.classA.classB [a4].classC [a4]{strocke-color:#58ab12;}";
				res = mCSS.semanticBuild( mCSS.parse( s ) );
			});
			it( "should select matching elements" , function(){
				expect( mCSS.isConcernBy( e2 , res[0].selectors[0] ) ).toBe( true );
				expect( mCSS.isConcernBy( e1 , res[0].selectors[0] ) ).toBe( true );
			});
			it( "should not select not matching elements" , function(){
				expect( mCSS.isConcernBy( e3 , res[0].selectors[0] ) ).toBe( false );
				expect( mCSS.isConcernBy( e4 , res[0].selectors[0] ) ).toBe( false );
			});
		});
	});
	describe("styleChain build", function() {
		var res = null;
		var e1 , e2 , e3 , e4;
		var chain;
		beforeEach( function(){
			e4 = new AbstractAttributeHolder();
			e4._classes = { "classA":true, "classB":true, "classC":true };
			e4._attributes = { a1:1 , a2:2 , a3 :3 , a4:4 };
			e4.id = "element4";
			
			e1 = new AbstractAttributeHolder();
			e1._classes = { "classA":true };
			e1._attributes = { a1:1 , a4:1 };
			e1.id = "element1";
			e1.getParent = function(){ return e2 };
			
			e2 = new AbstractAttributeHolder();
			e2._classes = { "classB":true };
			e2._attributes = { a2:2 , a4 :2 };
			e2.id = "element2";
			e2.getParent = function(){ return e3 };
			
			e3 = new AbstractAttributeHolder();
			e3._classes = { "classC":true };
			e3._attributes = { a3:3 , a4 :3 };
			e3.id = "element3";
			e3.getParent = function(){ return e4 };
		});
		describe("gather all the properties", function() {
			beforeEach( function(){
				var s =".classB{fill-color:#000000;}.classA{strocke-color:#58ab12;}.classA{strocke-width:8;}.classA{fill-color:#58ab12;}.classB{fill-color:#000000;}";
				mCSS.init( s );
				chain = mCSS.computeChain( e1 );
			});
			it( "should have all the properties descibe" , function(){
				
				var found1=false,
					found2=false,
					found3=false;
				for( var i = 0 ; i < chain.length ; i ++ ){
					if( chain[ i ].props["strocke-color"] == "#58ab12" )
						found1 = true;
					if( chain[ i ].props["strocke-width"] == "8" )
						found2 = true;
					if( chain[ i ].props["fill-color"] == "#58ab12" )
						found2 = true;
				}
				expect( found1 ).toBe( true );
				expect( found2 ).toBe( true );
				expect( found2 ).toBe( true );
			});
			it( "should not have the properties witch not match" , function(){
				var found1=false,
					found2=false,
					found3=false;
				for( var i = 0 ; i < chain.length ; i ++ ){
					if( chain[ i ].props["fill-color"] == "#000000" )
						found1 = true;
				}
				expect( found1 ).toBe( false );
			});
		});
		describe("priority", function() {
			describe("id selector property overrides class selector property", function() {
				beforeEach( function(){
					var s ="#element1{strocke-width:10;}.classA{strocke-width:1;}";
					mCSS.init( s );
					chain = mCSS.computeChain( e1 );
				});
				it( "prior props should be at the end of the chain" , function(){
					expect( chain[ 0 ].props["strocke-width"] ).toBe( 1 );
					expect( chain[ 1 ].props["strocke-width"] ).toBe( 10 );
				});
			});
			describe("id selector property overrides attr selector property", function() {
				beforeEach( function(){
					var s ="#element1{strocke-width:10;}[a4]{strocke-width:1;}";
					mCSS.init( s );
					chain = mCSS.computeChain( e1 );
				});
				it( "prior props should be at the end of the chain" , function(){
					expect( chain[ 0 ].props["strocke-width"] ).toBe( 1 );
					expect( chain[ 1 ].props["strocke-width"] ).toBe( 10 );
				});
			});
			describe("the much id selector a property have,the more pior it is", function() {
				beforeEach( function(){
					var s ="#element2 #element1{strocke-width:10;}#element1{strocke-width:1;}";
					mCSS.init( s );
					chain = mCSS.computeChain( e1 );
				});
				it( "prior props should be at the end of the chain" , function(){
					expect( chain[ 0 ].props["strocke-width"] ).toBe( 1 );
					expect( chain[ 1 ].props["strocke-width"] ).toBe( 10 );
				});
			});
			describe("the much attr selector a property have,the more pior it is", function() {
				beforeEach( function(){
					var s ="[a4][a1]{strocke-width:10;}[a1]{strocke-width:1;}";
					mCSS.init( s );
					chain = mCSS.computeChain( e1 );
				});
				it( "prior props should be at the end of the chain" , function(){
					expect( chain[ 0 ].props["strocke-width"] ).toBe( 1 );
					expect( chain[ 1 ].props["strocke-width"] ).toBe( 10 );
				});
			});
			describe("the much class selector a property have,the more pior it is", function() {
				beforeEach( function(){
					var s =".classB .classA{strocke-width:10;}.classA{strocke-width:1;}";
					mCSS.init( s );
					chain = mCSS.computeChain( e1 );
				});
				it( "prior props should be at the end of the chain" , function(){
					expect( chain[ 0 ].props["strocke-width"] ).toBe( 1 );
					expect( chain[ 1 ].props["strocke-width"] ).toBe( 10 );
				});
			});
		});
	});
});





