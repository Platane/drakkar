var extend = function( child , f ){
	for( var p in f )
		child.prototype[ p ] = f[ p ];
	if( !child.prototype.superDad )
		child.prototype.superDad = f;
};

( function( scope ){

/* sort of global object */


var hintDisplayer = { display : function( hint ){ console.log("hint : "+hint); } };

/*  */


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

			/*
function resize(){
	var currentFrameLabel = $( "#main > div" ).attr( "id" );
	switch( currentFrameLabel ){
	case "drawable" :
		
	
}	*/

function init(){
	
	//define the model
	var dataMap = DataMap.create();
	window.dataMap = dataMap;
	
	mCSS.init( ".reserved-selected { fill : #444444 ; }");
	
	var l = DataLayer.create("layer1");
	/*
	l.addElement( DataDot.create(new L.latLng(0,0)) );
	l.addElement( DataDot.create(new L.latLng(1500,0)) );
	l.addElement( DataDot.create(new L.latLng(1500,100)) );
	l.addElement( DataDot.create(new L.latLng(100,520)) );
	*/
	var dataPath = DataPath.create( [ new L.latLng(0,0) , new L.latLng(800,0) , new L.latLng(900,800) , new L.latLng(0,800) ] )
	
	l.addElement( dataPath );
	dataMap.addLayer(l);
	
	//uimap.pathEditable(true,dataPath);
	
	// fill the container
	$("#framePool").find(".frame").each(function(){
		$(this).find(".container").each( function(){
			$(this).children().remove();
			var componentName = $(this).attr( "data-contain-type" );
			var component;
			switch( componentName){
				case "UIMap" :
					component = window[ componentName ].create( dataMap ).elementSelectionnable(true).enhanceSelection(true);
					dataMap.registerListener( component );
				break;
				case "LayerMgr" :
					component = window[ componentName ].create( dataMap ).layerAddable(true).layerDeletable(true).layerSelectionable(true);
					dataMap.registerListener( component );
				break;
				case "EditablePathParam" :
					component = window[ componentName ].create( dataMap , null );
					dataMap.registerListener( component );
				break;
				case "EditionToolBar" :
					component = window[ componentName ].create( dataMap , null );
				break;
				default :
					component = window[ componentName ].create( dataMap );
			};
			component.getElement().appendTo( $(this) );
			$(this).data( "component" , component );
		});
	});
	dataMap.notify();
	/*
	$(".container[data-contain-type=EditablePathParam]").data( "component" ).mapUI = $(".container[data-contain-type=UIMap]").data( "component" );
	$(".container[data-contain-type=EditionToolBar]").data( "component" ).mapUI = $(".container[data-contain-type=UIMap]").data( "component" );
	*/
	initMenuAction();
	var uiMap = $(".container[data-contain-type=UIMap]").data( "component" );
	
	/*
	//init editing tool bar
	(function( dataMap , uiMap , layerMgr ){
		var self = this;
		
		var el = $("#edition-toolBarclass");
		var editionPathBn = el.find( "[data-action=path-edition]" );
		
		var attemptToEdit = function(){
			if( state.currentLayerSelected == null ){
				hintDisplayer.display( "select a layer" );
				layerMgr.layerSelectionable(true,{f:attemptToEdit , o:this});
				
				state.taskMgr.stack( function(){ layerMgr.layerSelectionable(true) } , this , "select a layer for edition" );
				
				return;
			}
			if( state.currentElementSelected == null ){
				hintDisplayer.display( "click on a element to edit it" );
				uiMap.elementSelectionnable( true , {f:attemptToEdit , o:this} );
				
				state.taskMgr.stack( function(){ uiMap.elementSelectionnable(true); } , this , "select an element for edition"  );
				
				return;
			}
			uiMap.pathEditable( true , dataMap.getLayer( state.currentLayerSelected ).getElement( state.currentElementSelected ) );
			state.taskMgr.stack( function(){ uiMap.pathEditable(false); } , this , "edit an element"  );
		};
		
		editionPathBn.bind( "click" , attemptToEdit );
		
		el.data( "controler" , this );
	})( dataMap , uiMap , $(".container[data-contain-type=LayerMgr]").data( "component" ) );
	*/
	
	var tm = TimeLine.create( "timeLine" ).editable( true );
	tm.getElement().appendTo( $("#tm-container") );
};

scope.init = init;

})( this );

//window.onload = function(){ init(); }
