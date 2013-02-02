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
	swapFrame( "search" );
};
var fillContainer=function(){
	$("#framePool").find(".frame").each(function(){
		$(this).find(".composant").each( function(){
			$(this).children().remove();
				var componentName = $(this).attr( "data-contain-type" );
				var component;
				switch( componentName){
					case "UIMap" :
						component = window[ componentName ].create( dataMap , $(this) );
					break;
					case "LayerMgr" :
						component = window[ componentName ].create( dataMap ).layerAddable(true).layerDeletable(true).layerSelectionable(true);
						dataMap.registerListener( component );
					break;
					case "PropertyStack" :
						component = window[ componentName ].create( $(this) );
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
	mCSS.init( " polygon.OFSE-member{ fill : #8952ae ; fill-opacity : 0.5 ; } polygon{fill-color:#17aef3;fill-opacity:0.5;strocke-width:1;strocke-color:#444444;strocke-opacity:1;} .reserved-selected { strocke-width : 10; }");
	
	var l = DataLayer.create("layer1");
	/*
	l.addElement( DataDot.create(new L.latLng(0,0)) );
	l.addElement( DataDot.create(new L.latLng(1500,0)) );
	l.addElement( DataDot.create(new L.latLng(1500,100)) );
	l.addElement( DataDot.create(new L.latLng(100,520)) );
	*/
	//var dataPath = DataPath.create( [ new L.latLng(0,0) , new L.latLng(800,0) , new L.latLng(900,800) , new L.latLng(0,800) ] , {"reserved-selected":true} , {} )
	l.addElement( DataPath.create( [ new L.latLng(0,0) , new L.latLng(800,0) , new L.latLng(900,800) , new L.latLng(0,800) ] , { "country":true , "OFSE-member":true , "potassum-exporter":true} ) );
	l.addElement( DataPath.create( [ new L.latLng(30,120) , new L.latLng(750,120) , new L.latLng(700,500) , new L.latLng(0,500) ] , { "country":true , "OFSE-member":true } ) );
	l.addElement( DataPath.create( [ new L.latLng(-60,30) , new L.latLng(-800,30) , new L.latLng(-900,800) , new L.latLng(-100,800) ]  ) );
	l.addElement( DataPath.create( [ new L.latLng(0,-160) , new L.latLng(-80,-160) , new L.latLng(-90,-100) , new L.latLng(0,-100) ]  ) );
	dataMap.addLayer(l);
	
	//uimap.pathEditable(true,dataPath);
	
	// fill the container
	
	initMenuAction();
	fillContainer();
	UIState.init();
	/*
	//linker
	(function(uimap,uistate){
		var lastTool=null;
		var cancelLastTool=null;
		uistate.registerListener("select-tool", {o:this,f:function(){ 
			if( cancelLastTool ){
				cancelLastTool.f.call( cancelLastTool.o );
				cancelLastTool=null;
			}
			switch( uistate.tool ){
				case uistate.toolList.edit :
				
				(function(){
					uimap.pathEditable( true );
					cancelLastTool={o:null,f:null};
					cancelLastTool.o=this;
					cancelLastTool.f = function(){
						uimap.pathEditable( false );
						//uistate.removeListener("select-element" , key );
					};
				})();
				break;
			}
			lastTool=uistate.tool;
		}});
	})(	uiMap , UIState );
	
	//init editing tool bar
	var el = $("#edition-toolBarclass");
	el.find( "[data-action=path-edition]" ).bind("click" , function(){ UIState.setTool(UIState.toolList.edit); } );
	el.find( "[data-action=path-edition2]" ).bind("click" , function(){ UIState.setTool(UIState.toolList.select); } );
	
	el.find( "[data-action=path-edition3]" ).bind("click" , function(){ cmd.mgr.undo(); } );
	el.find( "[data-action=path-edition4]" ).bind("click" , function(){ cmd.mgr.redo(); } );
	
	TagMgr.init(dataMap);
	UIState.init();
	AttributeMgr.create( UIState ).getElement().appendTo( "#block-property" );
	
	/*
	var ps = PropertyStack.create( );
	ps.getElement().appendTo("body").css({"display":"inline-block"});
	ps.editable(true).easyEditable(true).full(true);
	
	
	var organ=SearchOrgan.create();
	organ.getElement().appendTo( $('body') );
	organ.request();
	
	var ei = ElementInfo.create();
	ei.getElement().appendTo( $('body') );
	*/
	
};

scope.init = init;

})( this );

//window.onload = function(){ init(); }
