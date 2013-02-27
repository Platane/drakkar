( function( scope ){


var fillContainer=function(){
	$("#framePool").find(".frame").each(function(){
		$(this).find("data-component").each( function(){
			$(this).children().remove();
				var componentName = $(this).attr( "data-component" );
				var component;
				switch( componentName){
					case "UIMap" :
						component = window[ componentName ].create( dataMap , 1200 , 1000 );
					break;
					case "TimeLine" :
						component = window[ componentName ].create( );
						component.editable(true);
					break;
					case "ElementInfo" :
						component = window[ componentName ].create( dataMap );
					break;
					case "SearchOrgan" :
						component = window[ componentName ].create();
					break;
					case "LayerMgr" :
						component = window[ componentName ].create( dataMap );
					break;
					case "PropertyStack" :
						component = window[ componentName ].create();
					break;
					case "AttributeMgr" :
						component = window[ componentName ].create( );
					break;
					case "WorldMap" :
						component = window[ componentName ].create( );
					break;
					default :
						return;
						component = window[ componentName ].create( dataMap );
				};
				component.getElement().appendTo( $(this) );
				$(this).data( "component" , component );
			});
		});
		
		// some elements need to be linked
		$(".composant#searchOrgan").data("component").timeMgr=$(".composant#timeLine").data("component");
		$(".composant#searchOrgan").data("component").zoneMgr=$('.composant[data-contain-type="WorldMap"]').data("component");
		
		$('.frame#decorable').find('.composant[data-contain-type="UIMap"]').data("component").elementSelectionnable(true).enhanceSelection(true).enhanceLayerSelection(true);
		$('.frame#drawable').find('.composant[data-contain-type="UIMap"]').data("component").enhanceSelection(true);
		
		$('.frame#decorable').find('.composant[data-contain-type="LayerMgr"]').data("component").layerSelectionable(true).layerDeletable(true);
		
		dataMap.notify();
};

var fillComponent=function(){
	
	// the tool models
	var queryMgr,
		resultMgr;
	
	
	// search panel
	(function(){
	var frame=$('#frame-search');
	
	// the model
	queryMgr=new (Backbone.Model.extend({
		tags:null,
		defaults:function(){
			return {
				dtstart:1945,
				dtend:2013,
				zoneTop:new L.LatLng(35,-20),
				zoneBot:new L.LatLng(60,30),
				tags:[],
			};
		},
		initialize:function(attr,option){
			
		},
	}))();
	
	// the zone selector
	var cwm=frame.find('[data-component=WorldMap]');
	cwm.css({'height':cwm.height()+'px'});					//   /!\ no longueur responsive
	
	var wm=new WorldMap({model:queryMgr, width:cwm.width() , height:cwm.height()})
	.listen(true)
	.editable(true);
	
	cwm
	.empty()
	.append(wm.$el);
	
	// the go button
	var cgo=frame.find('[data-component=Go]');
	cgo
	.on('click.lauchRequest' , function(){
		
		//resultMgr.handler();
		
	})
	.on('click.gotoResult' , function(){
		
		frameNavigator.setFrame('result');
		
	})
	
	})();
};

function init(){
	
	//define the model
	/*
	var dataMap = DataMap.create();
	window.dataMap = dataMap;
	mCSS.init( " polygon.OFSE-member{ fill : #8952ae ; fill-opacity : 0.5 ; } polygon{fill-color:#17aef3;fill-opacity:0.5;strocke-width:1;strocke-color:#444444;strocke-opacity:1;} .reserved-layer-selected { strocke-color : #aaaaaa; } .reserved-selected { strocke-color : #ffffff; } .reserved-hidden { fill-color : #ffffff; }");
	
	var l = DataLayer.create("layer1");
	l.addElement( DataPath.create( [ new L.latLng(0,0) , new L.latLng(10,0) , new L.latLng(10,8) , new L.latLng(0,8) ] , null,{ "country":true , "OFSE-member":true , "potassum-exporter":true} ) );
	dataMap.addLayer(l);
	*/
	//uimap.pathEditable(true,dataPath);
	
	// fill the container
	
	fillComponent();
	
};

scope.init = init;

})( this );

//window.onload = function(){ init(); }
