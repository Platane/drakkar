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


var datamap=new DataMap();
var mcssdata=new DatamCSS(null,{'mcss':'polygon{fill-color:#45aed2;strocke-width:0;strocke-opacity:1;strocke-color:#333333;}polygon.country{fill-color:#aed452;}'});
var datachunks=new DataChunks();

var fillComponent=function(){
	
	// the tool models
	var queryMgr,
		resultMgr,
		dataMgr;
	
	// search panel
	(function(){
	var frame=$('#frame-search');
	
	// the model
	queryMgr=new (Backbone.Model.extend({
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
		
		resultMgr.requestHandler();
		
	})
	.on('click.gotoResult' , function(){
		
		frameNavigator.setFrame('result');
		resultMgr.set({'deployed' : true });
	});
	
	})();
	
	
	// result panel
	(function(){
	var frame=$('#frame-result');
	
	// the model
	var Resultat=Backbone.Model.extend({
		datapackage:null,
		datamap:null,
		defaults:function(){
			return {
				author:null,
				hashMail:null,		//for gravatar
				description:null,
				name:null,
				tags:{},
			};
		},
		initialize:function(attr,option){
			if(!option.elements)
				throw "where is my elements?"
			
			
			
			var dm=new DataMap();
			var dl=new DataPackage({'name' : this.get('name')} );
			for(var j=0;j<option.elements.length;j++){
				var el=option.elements[j];
				var de;
				switch(el.type){
					case "polygon":
						var points=[];
						for(var k=0;k<el.structure.length;k++)
							points.push( new L.LatLng( el.structure[k].lat,el.structure[k].lng ) );
						
						var classes=el.classes;
						var attributes=el.attributes;
						var name=el.id;
						
						de=new DataPolygon( {'structure':points , 'name':name , 'classes':classes , 'attributes':attributes } );
					break;
				}
				dl.addElement(de);
			}
			dm.addPackage(dl);
			
			this.datamap=dm;
			this.datapackage=dl;
			
		},
	});
	resultMgr=new (Backbone.Model.extend({
		results:null,
		datamap:null,
		defaults:function(){
			return {
				selected:null,			//a result
				deployed:false,
			};
		},
		initialize:function(attr,option){
			this.results=new Backbone.Collection();
			this.results.model=Resultat;
			this.datamap=option.datamap||datamp;
		},
		requestHandler:function(json){
			json='[{"author":"leny","name":"france","gravatarHash":"a0408d1e61bbc0795fee026ddcdbd7a3","description":"who need a map?","elements":[{"type":"polygon","id":"france","classes":{"country":true,"OF-member":true},"attributes":{"population":5,"language":"fr"},"structure":[{"lat":50.378992,"lng":3.588184},{"lat":49.907497,"lng":4.286023},{"lat":49.985373,"lng":4.799222},{"lat":49.529484,"lng":5.674052},{"lat":49.442667,"lng":5.897759},{"lat":49.463803,"lng":6.18632},{"lat":49.201958,"lng":6.65823},{"lat":49.017784,"lng":8.099279},{"lat":48.333019,"lng":7.593676},{"lat":47.620582,"lng":7.466759},{"lat":47.449766,"lng":7.192202},{"lat":47.541801,"lng":6.736571},{"lat":47.287708,"lng":6.768714},{"lat":46.725779,"lng":6.037389},{"lat":46.27299,"lng":6.022609},{"lat":46.429673,"lng":6.5001},{"lat":45.991147,"lng":6.843593},{"lat":45.70858,"lng":6.802355},{"lat":45.333099,"lng":7.096652},{"lat":45.028518,"lng":6.749955},{"lat":44.254767,"lng":7.007562},{"lat":44.127901,"lng":7.549596},{"lat":43.693845,"lng":7.435185},{"lat":43.128892,"lng":6.529245},{"lat":43.399651,"lng":4.556963},{"lat":43.075201,"lng":3.100411},{"lat":42.473015,"lng":2.985999},{"lat":42.343385,"lng":1.826793},{"lat":42.795734,"lng":0.701591},{"lat":42.579546,"lng":0.338047},{"lat":43.034014,"lng":-1.502771},{"lat":43.422802,"lng":-1.901351},{"lat":44.02261,"lng":-1.384225},{"lat":46.014918,"lng":-1.193798},{"lat":47.064363,"lng":-2.225724},{"lat":47.570327,"lng":-2.963276},{"lat":47.954954,"lng":-4.491555},{"lat":48.68416,"lng":-4.59235},{"lat":48.901692,"lng":-3.295814},{"lat":48.644421,"lng":-1.616511},{"lat":49.776342,"lng":-1.933494},{"lat":49.347376,"lng":-0.989469},{"lat":50.127173,"lng":1.338761},{"lat":50.946606,"lng":1.639001},{"lat":51.148506,"lng":2.513573},{"lat":50.796848,"lng":2.658422},{"lat":50.780363,"lng":3.123252},{"lat":50.378992,"lng":3.588184}]}]},{"author":"al","name":"allemagne","gravatarHash":"a0408d1e61bbc0795fee026ddcdbd8a3","description":"I do","elements":[{"type":"polygon","id":"germany","classes":{"country":true,"OF-member":true},"attributes":{"population":5,"language":"fr"},"structure":[{"lat":58.635,"lng":-3.005005},{"lat":57.553025,"lng":-4.073828},{"lat":57.690019,"lng":-3.055002},{"lat":57.6848,"lng":-1.959281},{"lat":56.870017,"lng":-2.219988},{"lat":55.973793,"lng":-3.119003},{"lat":55.909998,"lng":-2.085009},{"lat":55.804903,"lng":-2.005676},{"lat":54.624986,"lng":-1.114991},{"lat":54.464376,"lng":-0.430485},{"lat":53.325014,"lng":0.184981},{"lat":52.929999,"lng":0.469977},{"lat":52.73952,"lng":1.681531},{"lat":52.099998,"lng":1.559988},{"lat":51.806761,"lng":1.050562},{"lat":51.289428,"lng":1.449865},{"lat":50.765739,"lng":0.550334},{"lat":50.774989,"lng":-0.787517},{"lat":50.500019,"lng":-2.489998},{"lat":50.69688,"lng":-2.956274},{"lat":50.228356,"lng":-3.617448},{"lat":50.341837,"lng":-4.542508},{"lat":49.96,"lng":-5.245023},{"lat":50.159678,"lng":-5.776567},{"lat":51.210001,"lng":-4.30999},{"lat":51.426009,"lng":-3.414851},{"lat":51.426848,"lng":-3.422719},{"lat":51.593466,"lng":-4.984367},{"lat":51.9914,"lng":-5.267296},{"lat":52.301356,"lng":-4.222347},{"lat":52.840005,"lng":-4.770013},{"lat":53.495004,"lng":-4.579999},{"lat":53.404547,"lng":-3.093831},{"lat":53.404441,"lng":-3.09208},{"lat":53.985,"lng":-2.945009},{"lat":54.600937,"lng":-3.614701},{"lat":54.615013,"lng":-3.630005},{"lat":54.790971,"lng":-4.844169},{"lat":55.061601,"lng":-5.082527},{"lat":55.508473,"lng":-4.719112},{"lat":55.783986,"lng":-5.047981},{"lat":55.311146,"lng":-5.586398},{"lat":56.275015,"lng":-5.644999},{"lat":56.78501,"lng":-6.149981},{"lat":57.818848,"lng":-5.786825},{"lat":58.630013,"lng":-5.009999},{"lat":58.550845,"lng":-4.211495},{"lat":58.635,"lng":-3.005005}]}]},{"author":"teodor","name":"den","gravatarHash":"a0408d1e61bbc0795fee026ddcdbd8a3","description":"Border of the denmark","elements":[{"type":"polygon","id":"denmark","classes":{"country":true,"border":true,"europeen":true},"attributes":{"population":5,"language":"den"},"structure":[{"lat":51.345781,"lng":3.314971},{"lat":51.267259,"lng":4.047071},{"lat":51.475024,"lng":4.973991},{"lat":51.037298,"lng":5.606976},{"lat":50.803721,"lng":6.156658},{"lat":50.128052,"lng":6.043073},{"lat":50.090328,"lng":5.782417},{"lat":49.529484,"lng":5.674052},{"lat":49.985373,"lng":4.799222},{"lat":49.907497,"lng":4.286023},{"lat":50.378992,"lng":3.588184},{"lat":50.780363,"lng":3.123252},{"lat":50.796848,"lng":2.658422},{"lat":51.148506,"lng":2.513573},{"lat":51.345781,"lng":3.314971}]}]}]';
			
			var resultats=JSON.parse(json);
			
			var r=[];
			for(var i=0;i<resultats.length;i++){
				var name=resultats[i].name;
				var author=resultats[i].author;
				var hashMail=resultats[i].gravatarHash;
				var description=resultats[i].description;
				var elements=resultats[i].elements;
				r.push( new Resultat({name:name , author:author , hashMail:hashMail , description:description } , { elements:elements } ) );
			}
			
			this.results.reset(r);
		},
	}))(null,{datamap:datamap});
	
	resultMgr.on( "change:deployed" , function(){
		if(resultMgr.get('deployed')){
			frame.removeClass('hidden');
		}else{
			frame.addClass('hidden');
		}
	})
	.trigger('change:deployed');
	
	var cvrs=frame.find('[data-component=Results]');
	new ViewResults({el:cvrs , model:resultMgr});
	
	var cpi=frame.find('[data-component=PackageInfo]');
	cpi
	.empty()
	.append( new ViewResultInfo({model:resultMgr}).$el );
	
	})();
	
	
	// data panel
	(function(){
	var frame=$('#frame-data');
	
	// the model
	var mdp=new MiddleDataMap();
	
	dataMgr=new (Backbone.Model.extend({}))();
	
	
	var cpi=frame.find('[data-component=ViewPackages]');
	cpi
	.empty()
	.append( new ViewPackages({model:datamap,toolmodel:dataMgr,middledatamap:mdp}).$el );
	
	var cm=frame.find('[data-component=Map]');
	var vam=new ViewActionMap({'model':datamap , 'middledata':mdp , 'mcssdata':mcssdata , width:cm.width() , height:cm.height() })
	.elementSelectionnable(true);
	cm
	.empty()
	.append( vam.$el );
	
	var ca=frame.find('[data-component=AttributeMgr]')
	.empty()
	.append( new ViewAttributes({model:datamap,toolmodel:dataMgr,middledatamap:mdp}).$el );
	
	
	})();
	
	
	// decoration panel
	(function(){
	var frame=$('#frame-decoration');
	
	// the model
	var mdp=new MiddleDataMap();
	
	decorationMgr=new (Backbone.Model.extend({}))();
	
	
	var cpi=frame.find('[data-component=ViewPackages]');
	cpi
	.empty()
	.append( new ViewPackages({model:datamap,toolmodel:dataMgr,middledatamap:mdp}).$el );
	
	var cm=frame.find('[data-component=Map]');
	var vam=new ViewActionMap({'model':datamap , 'middledata':mdp , 'mcssdata':mcssdata , width:cm.width() , height:cm.height() })
	.elementSelectionnable(true);
	cm
	.empty()
	.append( vam.$el );
	
	var ca=frame.find('[data-component=AttributeMgr]')
	.empty()
	.append( new ViewAttributes({model:datamap,toolmodel:dataMgr,middledatamap:mdp}).$el );
	
	
	var cps=frame.find('[data-component=PropertyStack]')
	.empty()
	.append( new ViewPropertyStack({'model':mcssdata , 'toolmodel':decorationMgr , 'middledatamap':mdp }).$el );
	
	})();
	
	
	// presentation panel
	(function(){
	var frame=$('#frame-presentation');
	
	// the model
	var mdp=new MiddleDataMap();
	
	
	//link viewpackage to viewchunk
	var finishLinkage=function( elpackage , elchunk ){
		var datapackage=elpackage.data('datapackage');
		var datachunk=elchunk.data('datachunk');
		
		cmd.execute( cmd.AddPackageToChunk.create( datachunk , datapackage ) );
	};
	
	decorationMgr=new (Backbone.Model.extend({}))();
	
	
	var cpi=frame.find('[data-component=ViewPackages]');
	cpi
	.empty()
	.append( new ViewPackages({
				model:datamap,
				middledatamap:mdp,
				infoable:false,
				hiddable:true,
				deletable:false,
				linkage:{ selector:'#frame-presentation [data-component=FinalUserPanel] .chunk' , finish:finishLinkage },
				}).$el );
	
	var cm=frame.find('[data-component=Map]');
	var vam=new ViewActionMap({'model':datamap , 'middledata':mdp , 'mcssdata':mcssdata , width:cm.width() , height:cm.height() })
	.elementSelectionnable(true);
	cm
	.empty()
	.append( vam.$el );
	
	
	var cfp=frame.find('[data-component=FinalUserPanel]')
	.empty()
	.append( new ViewChunks({ 'model':datachunks , 'middledata':mdp }).$el );
	
	
	
	
	})();
	
	window.datamap=datamap;
	
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
