describe("Model checking", function() {
	describe("DataMap", function() {
		var res = null;
		var dm = null;
		beforeEach( function(){
			dm = DataMap.create();
		});
		describe("layer managment", function() {
			beforeEach( function(){
				dm.addLayer( DataLayer.create("l1") );
				dm.addLayer( DataLayer.create("l2") );
				dm.addLayer( DataLayer.create("l3") );
				dm.addLayer( DataLayer.create("l4") );
				dm.addLayer( DataLayer.create("l5") );
			});
			describe("addLayer", function() {
				it( "layers should have been added" , function(){
					expect( dm.getLayers().length ).toBe( 5 ); 
				});
				it( "lastest added layers should be on beginning of layers array", function(){
					expect( dm.getLayers()[0].getName() ).toBe( "l5" ); 
					expect( dm.getLayers()[1].getName() ).toBe( "l4" ); 
					expect( dm.getLayers()[2].getName() ).toBe( "l3" ); 
					expect( dm.getLayers()[3].getName() ).toBe( "l2" ); 
					expect( dm.getLayers()[4].getName() ).toBe( "l1" ); 
				});
			});
			describe("_getLayerIndex", function() {
				it( "should found the index if passing the index" , function(){
					expect( dm._getLayerIndex(0) ).toBe( 0 ); 
					expect( dm._getLayerIndex(1) ).toBe( 1 ); 
					expect( dm._getLayerIndex(2) ).toBe( 2 ); 
					expect( dm._getLayerIndex(3) ).toBe( 3 ); 
					expect( dm._getLayerIndex(4) ).toBe( 4 ); 
				});
				it( "should found the index if passing the name" , function(){
					expect( dm._getLayerIndex("l5") ).toBe( 0 ); 
					expect( dm._getLayerIndex("l4") ).toBe( 1 ); 
					expect( dm._getLayerIndex("l3") ).toBe( 2 ); 
					expect( dm._getLayerIndex("l2") ).toBe( 3 ); 
					expect( dm._getLayerIndex("l1") ).toBe( 4 ); 
				});
				it( "should found the index if passing the object" , function(){
					expect( dm._getLayerIndex( dm.getLayers()[0] ) ).toBe( 0 ); 
					expect( dm._getLayerIndex( dm.getLayers()[1] ) ).toBe( 1 ); 
					expect( dm._getLayerIndex( dm.getLayers()[2] ) ).toBe( 2 ); 
					expect( dm._getLayerIndex( dm.getLayers()[3] ) ).toBe( 3 ); 
					expect( dm._getLayerIndex( dm.getLayers()[4] ) ).toBe( 4 ); 
				});
			});
			describe("getLayer", function() {
				it( "should found the element" , function(){
					expect( dm.getLayer(0) ).toBe( dm.getLayers()[0] ); 
					expect( dm.getLayer(1) ).toBe( dm.getLayers()[1] ); 
					expect( dm.getLayer(2) ).toBe( dm.getLayers()[2] ); 
					expect( dm.getLayer(3) ).toBe( dm.getLayers()[3] ); 
					expect( dm.getLayer(4) ).toBe( dm.getLayers()[4] ); 
				});
			});
			describe("removeLayer", function() {
				describe("first layer", function() {
					beforeEach( function(){
						dm.removeLayer("l5");
					});
					it( "the layer should be remove from the array" , function(){
						expect( dm.getLayer(0).getName() ).toBe( "l4" ); 
						expect( dm.getLayer(1).getName() ).toBe( "l3" ); 
						expect( dm.getLayer(2).getName() ).toBe( "l2" ); 
						expect( dm.getLayer(3).getName() ).toBe( "l1" ); 
					});
				});
				describe("last layer", function() {
					beforeEach( function(){
						dm.removeLayer("l1");
					});
					it( "the element should be remove from the array" , function(){
						expect( dm.getLayer(0).getName() ).toBe( "l5" ); 
						expect( dm.getLayer(1).getName() ).toBe( "l4" ); 
						expect( dm.getLayer(2).getName() ).toBe( "l3" ); 
						expect( dm.getLayer(3).getName() ).toBe( "l2" ); 
					});
				});
				describe("middle layer", function() {
					beforeEach( function(){
						dm.removeLayer("l3");
					});
					it( "the element should be remove from the array" , function(){
						expect( dm.getLayer(0).getName() ).toBe( "l5" ); 
						expect( dm.getLayer(1).getName() ).toBe( "l4" ); 
						expect( dm.getLayer(2).getName() ).toBe( "l2" ); 
						expect( dm.getLayer(3).getName() ).toBe( "l1" ); 
					});
				});
			});
			describe("placeLayerAt", function() {
				describe("first layer go to mid", function() {
					beforeEach( function(){
						dm.placeLayerAt(0,2);
					});
					it( "should be correctly deplaced" , function(){
						expect( dm.getLayer(0).getName() ).toBe( "l4" ); 
						expect( dm.getLayer(1).getName() ).toBe( "l3" ); 
						expect( dm.getLayer(2).getName() ).toBe( "l5" ); 
						expect( dm.getLayer(3).getName() ).toBe( "l2" ); 
						expect( dm.getLayer(4).getName() ).toBe( "l1" ); 
					});
				});
				
				describe("first layer go to end", function() {
					beforeEach( function(){
						dm.placeLayerAt(0,100);
					});
					it( "should be correctly deplaced" , function(){
						expect( dm.getLayer(0).getName() ).toBe( "l4" ); 
						expect( dm.getLayer(1).getName() ).toBe( "l3" ); 
						expect( dm.getLayer(2).getName() ).toBe( "l2" ); 
						expect( dm.getLayer(3).getName() ).toBe( "l1" ); 
						expect( dm.getLayer(4).getName() ).toBe( "l5" ); 
					});
				});
				describe("first layer don't move", function() {
					beforeEach( function(){
						dm.placeLayerAt(0,0);
					});
					it( "should be correctly deplaced" , function(){
						expect( dm.getLayer(0).getName() ).toBe( "l5" ); 
						expect( dm.getLayer(1).getName() ).toBe( "l4" ); 
						expect( dm.getLayer(2).getName() ).toBe( "l3" ); 
						expect( dm.getLayer(3).getName() ).toBe( "l2" ); 
						expect( dm.getLayer(4).getName() ).toBe( "l1" ); 
					});
				});
				describe("last layer go to begin", function() {
					beforeEach( function(){
						dm.placeLayerAt(4,0);
					});
					it( "should be correctly deplaced" , function(){
						expect( dm.getLayer(0).getName() ).toBe( "l1" ); 
						expect( dm.getLayer(1).getName() ).toBe( "l5" ); 
						expect( dm.getLayer(2).getName() ).toBe( "l4" ); 
						expect( dm.getLayer(3).getName() ).toBe( "l3" ); 
						expect( dm.getLayer(4).getName() ).toBe( "l2" ); 
					});
				});
				describe("last layer go to mid", function() {
					beforeEach( function(){
						dm.placeLayerAt(4,2);
					});
					it( "should be correctly deplaced" , function(){
						expect( dm.getLayer(0).getName() ).toBe( "l5" ); 
						expect( dm.getLayer(1).getName() ).toBe( "l4" ); 
						expect( dm.getLayer(2).getName() ).toBe( "l1" ); 
						expect( dm.getLayer(3).getName() ).toBe( "l3" ); 
						expect( dm.getLayer(4).getName() ).toBe( "l2" ); 
					});
				});
				describe("last layer don't move", function() {
					beforeEach( function(){
						dm.placeLayerAt(4,4);
					});
					it( "should be correctly deplaced" , function(){
						expect( dm.getLayer(0).getName() ).toBe( "l5" ); 
						expect( dm.getLayer(1).getName() ).toBe( "l4" ); 
						expect( dm.getLayer(2).getName() ).toBe( "l3" ); 
						expect( dm.getLayer(3).getName() ).toBe( "l2" ); 
						expect( dm.getLayer(4).getName() ).toBe( "l1" ); 
					});
				});
				describe("mid layer go to begin", function() {
					beforeEach( function(){
						dm.placeLayerAt(2,0);
					});
					it( "should be correctly deplaced" , function(){
						expect( dm.getLayer(0).getName() ).toBe( "l3" ); 
						expect( dm.getLayer(1).getName() ).toBe( "l5" ); 
						expect( dm.getLayer(2).getName() ).toBe( "l4" ); 
						expect( dm.getLayer(3).getName() ).toBe( "l2" ); 
						expect( dm.getLayer(4).getName() ).toBe( "l1" ); 
					});
				});
				describe("mid layer go to end", function() {
					beforeEach( function(){
						dm.placeLayerAt(2,1000);
					});
					it( "should be correctly deplaced" , function(){
						expect( dm.getLayer(0).getName() ).toBe( "l5" ); 
						expect( dm.getLayer(1).getName() ).toBe( "l4" ); 
						expect( dm.getLayer(2).getName() ).toBe( "l2" ); 
						expect( dm.getLayer(3).getName() ).toBe( "l1" ); 
						expect( dm.getLayer(4).getName() ).toBe( "l3" ); 
					});
				});
				describe("mid layer go to mid", function() {
					beforeEach( function(){
						dm.placeLayerAt(2,3);
					});
					it( "should be correctly deplaced" , function(){
						expect( dm.getLayer(0).getName() ).toBe( "l5" ); 
						expect( dm.getLayer(1).getName() ).toBe( "l4" ); 
						expect( dm.getLayer(2).getName() ).toBe( "l2" ); 
						expect( dm.getLayer(3).getName() ).toBe( "l3" ); 
						expect( dm.getLayer(4).getName() ).toBe( "l1" ); 
					});
				});
				describe("mid layer don't move", function() {
					beforeEach( function(){
						dm.placeLayerAt(2,2);
					});
					it( "should be correctly deplaced" , function(){
						expect( dm.getLayer(0).getName() ).toBe( "l5" ); 
						expect( dm.getLayer(1).getName() ).toBe( "l4" ); 
						expect( dm.getLayer(2).getName() ).toBe( "l3" ); 
						expect( dm.getLayer(3).getName() ).toBe( "l2" ); 
						expect( dm.getLayer(4).getName() ).toBe( "l1" ); 
					});
				});
			});
			describe("geoJSON format", function() {
				it( "TODO" , function(){
					expect( true ).toBe( true ); 
				});
			});
		});
	});
	describe("DataLayer", function() {
		var res = null;
		var dm = null;
		beforeEach( function(){
			dm = DataLayer.create();
		});
		describe("layer managment", function() {
			beforeEach( function(){
				dm.addElement( DataPath.create("l1") );
				dm.addElement( DataPath.create("l2") );
				dm.addElement( DataPath.create("l3") );
				dm.addElement( DataPath.create("l4") );
				dm.addElement( DataPath.create("l5") );
			});
			describe("addLayer", function() {
				it( "layers should have been added" , function(){
					expect( dm.getElements().length ).toBe( 5 ); 
				});
				it( "lastest added layers should be on beginning of layers array", function(){
					expect( dm.getElements()[0].getName() ).toBe( "l5" ); 
					expect( dm.getElements()[1].getName() ).toBe( "l4" ); 
					expect( dm.getElements()[2].getName() ).toBe( "l3" ); 
					expect( dm.getElements()[3].getName() ).toBe( "l2" ); 
					expect( dm.getElements()[4].getName() ).toBe( "l1" ); 
				});
			});
			describe("_getElementIndex", function() {
				it( "should found the index if passing the index" , function(){
					expect( dm._getElementIndex(0) ).toBe( 0 ); 
					expect( dm._getElementIndex(1) ).toBe( 1 ); 
					expect( dm._getElementIndex(2) ).toBe( 2 ); 
					expect( dm._getElementIndex(3) ).toBe( 3 ); 
					expect( dm._getElementIndex(4) ).toBe( 4 ); 
				});
				it( "should found the index if passing the name" , function(){
					expect( dm._getElementIndex("l5") ).toBe( 0 ); 
					expect( dm._getElementIndex("l4") ).toBe( 1 ); 
					expect( dm._getElementIndex("l3") ).toBe( 2 ); 
					expect( dm._getElementIndex("l2") ).toBe( 3 ); 
					expect( dm._getElementIndex("l1") ).toBe( 4 ); 
				});
				it( "should found the index if passing the object" , function(){
					expect( dm._getElementIndex( dm.getElements()[0] ) ).toBe( 0 ); 
					expect( dm._getElementIndex( dm.getElements()[1] ) ).toBe( 1 ); 
					expect( dm._getElementIndex( dm.getElements()[2] ) ).toBe( 2 ); 
					expect( dm._getElementIndex( dm.getElements()[3] ) ).toBe( 3 ); 
					expect( dm._getElementIndex( dm.getElements()[4] ) ).toBe( 4 ); 
				});
			});
			describe("getElement", function() {
				it( "should found the element" , function(){
					expect( dm.getElement(0) ).toBe( dm.getElements()[0] ); 
					expect( dm.getElement(1) ).toBe( dm.getElements()[1] ); 
					expect( dm.getElement(2) ).toBe( dm.getElements()[2] ); 
					expect( dm.getElement(3) ).toBe( dm.getElements()[3] ); 
					expect( dm.getElement(4) ).toBe( dm.getElements()[4] ); 
				});
			});
			describe("removeElement", function() {
				describe("first element", function() {
					beforeEach( function(){
						dm.removeElement("l5");
					});
					it( "the element should be remove from the array" , function(){
						expect( dm.getElement(0).getName() ).toBe( "l4" ); 
						expect( dm.getElement(1).getName() ).toBe( "l3" ); 
						expect( dm.getElement(2).getName() ).toBe( "l2" ); 
						expect( dm.getElement(3).getName() ).toBe( "l1" ); 
					});
				});
				describe("last element", function() {
					beforeEach( function(){
						dm.removeElement("l1");
					});
					it( "the element should be remove from the array" , function(){
						expect( dm.getElement(0).getName() ).toBe( "l5" ); 
						expect( dm.getElement(1).getName() ).toBe( "l4" ); 
						expect( dm.getElement(2).getName() ).toBe( "l3" ); 
						expect( dm.getElement(3).getName() ).toBe( "l2" ); 
					});
				});
				describe("middle element", function() {
					beforeEach( function(){
						dm.removeElement("l3");
					});
					it( "the element should be remove from the array" , function(){
						expect( dm.getElement(0).getName() ).toBe( "l5" ); 
						expect( dm.getElement(1).getName() ).toBe( "l4" ); 
						expect( dm.getElement(2).getName() ).toBe( "l2" ); 
						expect( dm.getElement(3).getName() ).toBe( "l1" ); 
					});
				});
			});
			describe("geoJSON format", function() {
				it( "TODO" , function(){
					expect( true ).toBe( true ); 
				});
			});
		});
	});
});
			