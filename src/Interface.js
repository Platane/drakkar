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
window.datamap=datamap;
var mcssdata=new DatamCSS(null,{'mcss':'polygon{fill-color:#45aed2;strocke-width:0.1;strocke-opacity:1;strocke-color:#000000;}'});
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
	
	wm.lfe.invalidateSize();	// recompute the size
	
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
			json=JSON.stringify(stubJSON);
			
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
	
	dataMgr=new (AbstractDataElement.extend({
		middledata:null,
		datamap:null,
		oneditelement:null,
		
		initialize:function(attr,options){
			options=options||{};
			AbstractDataElement.prototype.initialize.call(this,attr,options);
			
			this.middledata=options.middledata;
			this.datamap=options.datamap;
			
			this.middledata.on(  'change:elementSelected' , this.changeAvaibleTool , this );
			this.middledata.on(  'change:packageSelected' , this.changeAvaibleTool , this );
			this.on( 'change:state' , this.changeAvaibleTool , this );
		},
		changeAvaibleTool:function(){
			var avaibleTool={};
			switch(this.get('state')){
				case 'selection':
					
					if(this.oneditelement){
						this.stopListening( this.oneditelement , 'destroy' , this.destroyonedit );
						this.oneditelement=null;
					}
					if( this.middledata.elementSelected.length == 1 ){
						switch(this.middledata.elementSelected.type){
							case 'polygon':
								avaibleTool['polygon-edition']=true;
							break;
						}
						avaibleTool['edition']=true;
						
					}
					if( this.middledata.elementSelected.length > 0 )
						avaibleTool['trash-element']=true;
					if( this.middledata.elementSelected.length > 1 ){
						var accepte=true;
						for( var i=0;i<this.middledata.elementSelected.length;i++)
							if(this.middledata.elementSelected[i].type != 'polygon' )
								accepte=false;
						if(accepte)
							avaibleTool['polygon-operation']=true;
					}
					if( this.middledata.get('packageSelected') ){
						avaibleTool['polygon-creation']=true;
						avaibleTool['marker-creation']=true;
					}
					
					
				break;
				case 'polygon-edition':
					
					avaibleTool['selection']=true;
					avaibleTool['validate']=true;
					
				case 'marker-edition':
				
				break;
			}
			
			this.set('avaibleTool',avaibleTool);
			/*
			this.trigger('change');
			this.trigger('change:avaibleState');
			*/
		},
		defaults: _.extend({
			state:'selection',
			avaibleTool:{'selection':true},
		}, AbstractDataElement.prototype.defaults() ),
		
		newPolygon:function(){
			var datapolygon=new DataPolygon({
				'attributes':	_.clone( this.get('attributes') ),
				'classes'	:	_.clone( this.get('classes') ),
				});
			this.middledata.get('packageSelected').addElement( datapolygon ); 
			this.oneditelement=datapolygon;
			
			this.listenTo( this.oneditelement , 'destroy' , this.destroyonedit );
			this.set('state','polygon-edition');
			
			mdp.removeAllSelectedElement({silent:true});
			mdp.addSelectedElement(datapolygon);
		},
		operationOnPolygon:function(op){
			
			var latLngsToXY=function(latlngs){
				var p=[];
				for(var i=0;i<latlngs.length;i++)
					p.push({X:latlngs[i].lat , Y:latlngs[i].lng});
				return [p];
			};
			var XYTolatLngs=function(XY){
				var p=[];
				for(var i=0;i<XY.length;i++)
					p.push( new L.LatLng( XY[i].X , XY[i].Y ) );
				return p;
			};
			
			//use clipper js to compute the operation
			
			var clipType
			switch( op ){
				case 'intersection':
					clipType=ClipperLib.ClipType.ctIntersection;
				break;
				case 'union':
					clipType=ClipperLib.ClipType.ctUnion;
				break;
				case 'xor':
					clipType=ClipperLib.ClipType.ctXor;
				break;
			}
			
			if( this.middledata.elementSelected.length==0)
				return;
			
			var res= [[]];
			
			var cpr = new ClipperLib.Clipper();
			
			for( var i=0;i<this.middledata.elementSelected.length;i++){
				var X = latLngsToXY( this.middledata.elementSelected[i].get('structure') );
				
				if(i==0)
					cpr.AddPolygons( X , ClipperLib.PolyType.ptSubject );
				else
					cpr.AddPolygons( X , ClipperLib.PolyType.ptClip );
			}
			
			var subject_fillType = ClipperLib.PolyFillType.pftNonZero;		//duno what is it for, for holes and stuffs I guess
			var clip_fillType = ClipperLib.PolyFillType.pftNonZero;			
			
			if(!cpr.Execute( clipType, res , subject_fillType, clip_fillType ))
				throw "unable to compute the operation";
			
			
			// add the element create
			
			var datapackage=this.middledata.get('packageSelected') || this.middledata.elementSelected[0].getParent();
			
			var t=[];
			for(var i=0;i<res.length;i++){
				var structure=XYTolatLngs( res[i] );
				
				var dataelement=new DataPolygon({
					'attributes':	_.clone( this.get('attributes') ),
					'classes'	:	_.clone( this.get('classes') ),
					'structure' :	structure,
					'name'		:	op+'-'+i,
				});
				
				 t.push( cmd.AddOrDelete.create( datapackage , 'addElement' , 'removeElement' , dataelement ) );
			}
			cmd.execute( cmd.Multi.createWithTab(t) );
		},
		destroyonedit:function(){
			this.set('state','selection');
		},
		newMarker:function(){
			
		},
		editElement:function(){
			var dataelement=this.middledata.elementSelected[0];
			switch(dataelement.type){
				case 'polygon' :
					this.oneditelement=dataelement;
					
					this.listenTo( this.oneditelement , 'destroy' , this.destroyonedit );
					this.set('state','polygon-edition');
				break;
			}
		},
		
	}))({ 'state':'selection'} , {'middledata':mdp , 'datamap':datamap });
	
	var cpi=frame.find('[data-component=ViewPackages]');
	cpi
	.empty()
	.append( new ViewPackages({
		'model':datamap,
		'toolmodel':dataMgr,
		'middledata':mdp,
		'addable':true,
		'deletable':true,
		'swapable':true,
		'selectionable':true,
		}).$el );
	
	var cm=frame.find('[data-component=Map]');
	var vam=new ViewActionMap({
		'model'		:datamap ,
		'toolmodel'	:dataMgr ,
		'middledata':mdp ,
		'mcssdata'	:mcssdata ,
		'width'		:cm.width() ,
		'height'	:cm.height() ,
	})
	.elementSelectionnable(true)
	.copypastable(true);
	
	window.vam=vam;
	cm
	.empty()
	.append( vam.$el );
	
	vam.lfe.invalidateSize();	// recompute the size
	
	var ca=frame.find('[data-component=AttributeMgr]')
	.empty()
	.append( new ViewAttributes({
		'model':datamap,
		'toolmodel':dataMgr,
		'middledata':mdp,
		}).$el );
	
	
	var ctb=frame.find('[data-component=Tool]')
	.empty()
	.append( new ViewDataTools({
		
		'toolmodel':dataMgr,
		'middledata':mdp,
		}).$el );
	
	
	
	//change the behavior of 
	var gate={
		resolveState:function(){
			switch( dataMgr.get('state')){
				case 'selection' :
					vam.polygonTracable(false).elementSelectionnable(true);
				break;
				case 'polygon-edition' :
					vam.elementSelectionnable(false).polygonTracable(true,dataMgr.oneditelement);
				break;
			}
		},
	};
	dataMgr.on( 'change:state' , gate.resolveState , this );
	
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
	.append( new ViewPackages({model:datamap,toolmodel:dataMgr,middledata:mdp}).$el );
	
	var cm=frame.find('[data-component=Map]');
	var vam=new ViewActionMap({'model':datamap , 'middledata':mdp , 'mcssdata':mcssdata , width:cm.width() , height:cm.height() })
	.elementSelectionnable(true);
	cm
	.empty()
	.append( vam.$el );
	
	vam.lfe.invalidateSize();	// recompute the size
	
	var ca=frame.find('[data-component=AttributeMgr]')
	.empty()
	.append( new ViewAttributes({model:datamap,toolmodel:dataMgr,middledata:mdp}).$el );
	
	
	var cps=frame.find('[data-component=PropertyStack]')
	.empty()
	.append( new ViewPropertyStack({'model':mcssdata , 'toolmodel':decorationMgr , 'middledata':mdp }).$el );
	
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
				middledata:mdp,
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
	
	vam.lfe.invalidateSize();	// recompute the size
	
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
