var extend = function( child , f ){
	for( var p in f )
		child.prototype[ p ] = f[ p ];
	if( !child.prototype.superDad )
		child.prototype.superDad = f;
};

( function( scope ){


var currentLayer = null;
function changeCurrentLayer( i ){
	currentLayer = i;
	
	//upadate
};
this.changeCurrentLayer = changeCurrentLayer;


function swapFrame( id ){
	
	var currentFrame = $( "#main > div" );
	if( currentFrame.length > 0 ){
		//finish
		currentFrame.detach();
		currentFrame.appendTo( $("#framePool") );
	}
	
	var targetFrame = $("#framePool").find("#"+id+".frame");
	
	targetFrame.appendTo( $("#main") );
}


function initMenuAction(){
	var menuBn = $(".menu").find( "li" );
	
	menuBn.each( function(){
		var bn = $(this);
		
		bn.bind( "click" , function( e ){
			
			swapFrame( bn.attr( "data-frame" ) );
			
		});
	});
	swapFrame( "drawable" );
};



			
			var mapO = Map.createMap( "myMap" , " its a desciption" );
			
			mapO.addLayer(  Layer.createLayer( "top", "" , "dots" ) );
			mapO.addLayer(  Layer.createLayer( "mid", "" , "paths" ) );
			mapO.addLayer(  Layer.createLayer( "bot", "" , "dots" ) );

			/*
function resize(){
	var currentFrameLabel = $( "#main > div" ).attr( "id" );
	switch( currentFrameLabel ){
	case "drawable" :
		
	
}	*/
			
function init(){
	
	
	
	initMenuAction();
	
	var map = MapPanel.create( null , "block-Map" )
	map.getElement().appendTo( $(".container") );
	
	var lm = LayerMgr.create( mapO , "block-layerMgr" ).layerDeletable( true ).layerSelectionable( true ).layerAddable( true );
	lm.getElement().appendTo( $(".container") );
	
	$("#tracePathBn").bind( "click" , function(){
		map.pathTraceable( true );
	});
	$("#editPathBn").bind( "click" , function(){
		map.pathEditable( true , [ { x : 50 , y : 50 } , { x : 50 , y : 150 } , { x : 150 , y : 50 } ] );
	});
	
	
	var tm = TimeLine.create( "timeLine" ).editable( true );
	tm.getElement().appendTo( $("#tm-container") );
};

scope.init = init;

})( this );

//window.onload = function(){ init(); }
