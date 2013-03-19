var extend = function( child , f ){
	for( var p in f )
		child.prototype[ p ] = f[ p ];
	if( !child.prototype.superDad )
		child.prototype.superDad = f;
};

L.cloneLatLngArray = function( a ){
	var b = new Array( a.length );
	var i = a.length;
	while(i--) b[i]=new L.LatLng(a[i].lat,a[i].lng);
	return b;
};

L.icons={};
( function( scope ){
	var editableSquare = L.icon({
		iconUrl: 'ressources/yellow-squarre.png',
		iconSize: [16, 16],
		iconAnchor: [8, 8],
		popupAnchor: [0,0],
		/*
		shadowUrl: 'my-icon-shadow.png',
		shadowSize: [68, 95],
		shadowAnchor: [22, 94]
		*/
	});
	scope.editableSquare = editableSquare;
})(L.icons);


( function( scope ){


// pop up manager
var popUp = {};
( function( scope ){
	
	var currentlyDisplayed = null;
	
	var AbstractPopUp = function(){};
	AbstractPopUp.prototype = {
		
		container : null,
		
		main : null,
		
		init : function(){
			
			this.container = $("<div>").addClass( "popUp" ).css( { "position" : "absolute" } );
			this.main = $("<div>");
			
			var self = this;
			$('<input id="popUpbnValid" type="submit">').bind( "click" , function(){
				self.valid();
			}).appendTo( this.container );
			
			$('<input id="popUpbnClose" type="submit" value="close" name="close" >').bind( "click" , function(){
				self.close();
			}).appendTo( this.container );
			
			// delete the old if exist
			if( currentlyDisplayed )
				currentlyDisplayed.close();
			else 
				$("#popUpPanel").css( { "z-index" : 100 , "display" : "block" } );
			
			this.main.appendTo( this.container );
			this.container.appendTo( $("#popUpPanel") );
			currentlyDisplayed = this;
			
			this.initInteraction();
			this.moveable( true );
		},
		valid : function(){
			this.close();
		},
		close : function(){
			$("#popUpPanel").css( {"z-index" : -10 , "display" : "none" } );
			this.container.remove();
			currentlyDisplayed = null;
		},
		finish : function(){},
		prepare : function(){},
		initInteraction : function(){
			
			var self = this;
			
			(function( scope ){
				var drag = false,
					anchorM = {x:0 , y:0},
					anchorE = {x:0 , y:0};
					
				var start = function( e ){
					drag = true;
					anchorM.x = e.pageX;
					anchorM.y = e.pageY;
					anchorE.x = self.container.position().left;
					anchorE.y = self.container.position().top;
				};
				var move = function( e ){
					if( !drag )
						return;
					
					var x = anchorE.x + ( e.pageX - anchorM.x ),
						y = anchorE.y + ( e.pageY - anchorM.y );
					
					self.container.css( { 'top' : y+'px' , 'left' : x+'px' } );
					
				};
				var stop = function( e ){
					if( !drag )
						return;
					drag = false;
				}
				
				var bind = function( unable ){
					if( unable ){
						self.container.unbind( "mousedown" , start ).bind( "mousedown" , start );
						$("body").unbind( "mousemove" , move ).bind( "mousemove" , move );
						$("body").unbind( "mouseup" , stop ).bind( "mouseup" , stop );
					}else{
						self.container.unbind( "mousedown" , start );
						$("body").unbind( "mousemove" , move );
						$("body").unbind( "mouseup" , stop );
					}
					return self;
				};
				
				scope.moveable = bind;
				
			})( this );
			
		},
		moveable : function(  ){},
		
	};
	
	
	var AddLayerPopUp = function(){};
	extend( AddLayerPopUp , AbstractPopUp.prototype );
	extend( AddLayerPopUp , {
		
		_map : null,
		_update : null,
		init : function( map , update ){
			
			this.superDad.init.call( this );
			
			this._map = map;
			this._update = update;
			
			var self = this;
			
			( function(){
				
				var nameValid = false,
					descriptionValid = true,
					typeValid = true;
				
				
				var name = $('<input id="popUpInputName" type="text">'),
					description = $('<input id="popUpInputDescription" type="text">'),
					type = $('<input id="popUpInputType" type="text">');
					
				
				var updateValidation = function(){
					
					if( nameValid && descriptionValid && typeValid )
						self.main.parent().find("#popUpbnValid").unbind().bind("click",
						function(){ 
							self.valid();
							cmd.mgr.execute( cmd.addLayer.create( DataLayer.create( name[0].value , description[0].value ) , self._map , self._update )  );
						} );
					else
						self.main.parent().find("#popUpbnValid").unbind().bind("click",function(){ alert(" please fill correctly the fields" ); } );
						
				};
				var nameValidation = function( n ){
					var regExpValid = /^[a-zA-Z0-9]{3,}$/;
					nameValid = n.match( regExpValid )!=null;
					
					name.addClass( "valid-"+nameValid );
					
					self.main.find("#hintAddLayerName").remove();
					if( !nameValid  )
						if( n.length < 3 )
							name.after( $("<span>name must be at least 3 characters long</span>").attr("id" , "hintAddLayerName" ).addClass("hint") );
						else
							name.after( $("<span>name can contain letters or numbers only</span>").attr("id" , "hintAddLayerName" ).addClass("hint") );
					
					var layers = self._map.getLayers();
					for( var i = 0 ; i< layers.length ; i ++ )
						if( layers[ i ].name == n ){
							nameValid = false;
							name.after( $("<span>this name is already taken</span>").attr("id" , "hintAddLayerName" ).addClass("hint") );
						}
						
					updateValidation();
				};
				var descriptionValidation = function( n ){
					var regExpValid = /^[a-zA-Z0-9 ,.]{3,}$/;
					descriptionValid = n.match( regExpValid )!=null;
					
					description.addClass( "valid-"+descriptionValid );
					
					
					self.main.find("#hintAddLayerDescription").remove();
					if( !descriptionValid  )
						if( n.length < 3 )
							description.after( $("<span>description must be at least 3 characters long</span>").attr("id" , "hintAddLayerDescription" ).addClass("hint") );
						else
							description.after( $("<span>description cannot contain specials characters</span>").attr("id" , "hintAddLayerDescription" ).addClass("hint") );
					
					updateValidation();
				}
				
				
				name.bind( "change" , function(e){
					nameValidation( e.target.value );
				}).appendTo( self.main );
				
				description.bind( "change" , function(e){
					descriptionValidation( e.target.value );
				}).appendTo( self.main );
				
				updateValidation();
				
			} )();
		},
		
	} );
	// TODO make a singleton instanciation
	AddLayerPopUp.create = function( map , update ){
		var p = new AddLayerPopUp();
		p.init( map , update );
		return p;
	};
	
	
	scope.addLayer = AddLayerPopUp;
	
})( popUp );

function AbstractComponent(){};
AbstractComponent.prototype = {
	el : null,
	model : null,
	init : function(  ){},
	getElement : function(){
		return this.el;
	},
	resize : function(){
		
	},
	updatetable:function( enable ){
		if( !this.model || !this.model.registerListener || !this.model.removeListener )
			return;
		this.model.removeListener( this );
		if( enable ){
			this.model.registerListener( this );
		}
	},
	update:function(){},
	listen:function(enable){return this;},
}

/**
 * @class an element that wrap leaflet element. 
 * @description this element use LeafletItem 
 */
function UIMap(){};
extend( UIMap , AbstractComponent.prototype );
extend( UIMap , {
	uiDataMap : null,
	uistate:null,
	init : function( model , w , h  ){
		
		var w=w||500,
			h=h||500;
		
		var el = $("<div>").css({'width':w+'px','height':h+'px'}).appendTo( $("body") );
		
		var uiDataMap = LeafletMap.create( model , el[0] );
		uiDataMap.lfe.fitWorld();
		el.detach().css({'width':'100%','height':'100%'});
		uiDataMap.update();
		
		this.uiDataMap = uiDataMap;
		this.uistate = UIState;
		this.el = el;
		this.model = model;
		
		if( model )
			this.updatetable( true );
		
		this.initInteraction();
	},
	initInteraction : function(){
		
		var w = 500, h = 500;
	
		var map = this.el;
		
		var self = this;
		
		var uistate=this.uistate,
			uimap=this.uiDataMap,
			datamap=this.model;
		
		// pathTracable
		//wip
		(function( scope ){
				var drag = false,
					points = [];
					
				var plantDot = function( e ){
					var p = { x:e.offsetX , y:e.offsetY };
					
					if( e.button == 2 ){
						stop();
						return;
					}
					
					sup.find("svg").find("circle,line").attr( "class" , "" ); //remove class dont work properly
					
					if( points.length > 0 ){
						var dx = points[ 0 ].x - p.x,
							dy = points[ 0 ].y - p.y;
						
						if( dx*dx + dy*dy < 2 ){
							stop();
							return;
						}
					}
					
					$('<line style="stroke:#000000;stroke-width:1px">').attr( "x1" , p.x ).attr( "x2" , p.x ).attr( "y1" , p.y ).attr( "y2" , p.y ).addClass( "last" ).appendTo( $("svg#supMapLayer") );
					
					points.push( p );
					
					$('<circle>').attr( "cx" , p.x ).attr( "cy" , p.y ).attr( "r" , 5 ).addClass( "last" ).appendTo( $("svg#supMapLayer") );
					
				};
				var move = function( e ){
					
					var p = { x:e.offsetX , y:e.offsetY };
					
					sup.find("svg").find("line.last").attr( "x1" , p.x ).attr( "y1" , p.y );
					
					var h = sup[ 0 ].innerHTML; 
					sup[ 0 ].innerHTML = "";
					sup[ 0 ].innerHTML = h;
					
				};
				var stop = function( e ){
					pathTraceable( false );
				}
				
				var update = function(){
					
					sup.find("svg").children().remove()
					
					for( var i = 0 ; i < points.length ; i ++ ){
						if( i == points.length-1 )
							$('<line style="stroke:#000000;stroke-width:1px">').attr( "x1" , points[ i ].x ).attr( "x2" , points[ i ].x ).attr( "y1" , points[ i ].y ).attr( "y2" , points[ i ].y ).addClass( "last" ).appendTo( sup.find("svg") );
						else
							$('<line style="stroke:#000000;stroke-width:1px">').attr( "x1" , points[ i ].x ).attr( "x2" , points[ i +1 ].x ).attr( "y1" , points[ i ].y ).attr( "y2" , points[ i +1 ].y ).appendTo( sup.find("svg") );
						$('<circle>').attr( "cx" , points[ i ].x ).attr( "cy" , points[ i ].y ).attr( "r" , 5 ).appendTo( sup.find("svg") );
					}
					
					var h = sup[ 0 ].innerHTML; 
					sup[ 0 ].innerHTML = "";
					sup[ 0 ].innerHTML = h;
				};
				
				var removeLastPoint = function(){
					points.splice( points.length-1 , 1 );
					update();
				}
				
				var pathTraceable = function( unable , update_ , paramPanel ){
					if( unable ){
						
						if( paramPanel ){
								var bnDeleteLastPoint = $("<div> del last </div>").addClass( "btn icon-btn" ).appendTo( paramPanel ).bind( "click" , function(){
								removeLastPoint();
							});
							var bnStop = $("<div> end </div>").addClass( "btn icon-btn" ).appendTo( paramPanel ).bind( "click" , function(){
								stop();
							});
						};
						
						
						sup.css( { "display" : "block" } );
						
						$('<svg id="supMapLayer" xmlns="http://www.w3.org/2000/svg" version="1.1">').attr( "width" , w ).attr( "height" , h ).css( { "position" : "absolute" , "width" : w+"px" , "height" : h+"px" } ).appendTo( sup );
						sup.unbind( "mousedown" , plantDot ).bind( "mousedown" , plantDot );
						sup.unbind( "mousemove" , move ).bind( "mousemove" , move );
					}else{
						
						sup.css( { "display" : "none" } );
						
						$("#block-param").css({"display":"none"}).children().remove();
						sup.find("svg").remove();
						sup.unbind( "mousedown" , plantDot );
						sup.unbind( "mousemove" , move );
					}
					return scope;
				};
				
				scope.pathTraceable = pathTraceable;
				
		})( this );
		
		//pathEditable
		(function( scope ){
			
			var drag = false,
				points = [],
				selected = 0,
				anchorM = {x:0 , y:0},
				anchorE = {x:0 , y:0};
			
			var tmpLayer,
				uiDataPath,
				key1,key2;
			
				var remove = function( e ){
					console.log(e);
				};
				var start = function( e ){
					drag = true;
					anchorM.x = e.originalEvent.pageX;
					anchorM.y = e.originalEvent.pageY;
					
					anchorE = uimap.lfe.project( e.target.getLatLng() );
					
					selected = e.target;
					e.originalEvent.preventDefault();
					e.originalEvent.stopPropagation();

				};
				var move = function( e ){
					if( !drag )
						return;
					
					var x = anchorE.x + ( e.originalEvent.pageX - anchorM.x ),
						y = anchorE.y + ( e.originalEvent.pageY - anchorM.y );
					
					var latLng = self.uiDataMap.lfe.unproject( new L.Point( x , y ) )
					
					// modify the position of the squarre element
					selected.setLatLng( latLng );
					
					// modify the position of the UIData element point
					uiDataPath.lfe._latlngs[ selected.i ] = latLng;
					uiDataPath.lfe.redraw();
					//self.update();
				};
				var stop = function( e ){
					if( !drag )
						return;
					drag = false;
					
					var nPath = L.cloneLatLngArray( uiDataPath.lfe._latlngs );
					
					cmd.mgr.execute( cmd.setShape.create( uiDataPath.model , [nPath] ));
				}			
				
				var pathEditable = function( enable ){
					
					// destruct previous setup
					// should be done even is the previous setup is already destruct
					
					//remove the preivous squarres if they exist
					if( tmpLayer ){
						uimap.lfe.removeLayer( tmpLayer );
						tmpLayer=null;
					}
					uimap.off( "mousemove" , move );
					uimap.off( "mouseup" , stop );
					if( !enable || !uistate.elements.length==0 ) // else it would be done latter
						uimap.update();
					
					if( key1 ){
						uistate.removeListener( "select-element" , key1 );
						key1=null;
					}
					if( uiDataPath && key2 ){
						uiDataPath.model.removeListener( "set-shape" , key2 );
						uiDataPath=null;
						key2=null;
					}
					
					if( enable ){
						// if enable
						key1=uistate.registerListener( "select-element" , {o:this,f:function(){self.pathEditable( true );}});
						
						var dataPath = (uistate.elements.length==1)?uistate.elements[0]:null;
						if( dataPath ){
						
							//whenever the element shape in modify, the control squarre must be updated
							key2=dataPath.registerListener( "set-shape" , {o:this,f:function(){self.pathEditable( true );}});
						
							// add the controls square
							tmpLayer = new L.LayerGroup();
							for( var i=0;i<dataPath._points.length;i++ ){
								var dot = new L.Marker( dataPath._points[i] , {"icon" : L.icons.editableSquare } )
								tmpLayer.addLayer( dot );
								dot.i = i;
								dot.on("mousedown",start );
								dot.on("dblclick",remove );
							}
							tmpLayer.addTo(self.uiDataMap.lfe);
						
							// search the UIData element corresponding to the Data element in this lfe
							uiDataPath = uiDataMap.getElement( dataPath );
						
							//self.lfe.dragging.disable(); 
							self.uiDataMap.on( "mousemove" , move );
							self.uiDataMap.on( "mouseup" , stop );
						
							self.uiDataMap.update();
						
						}
					}
					
					//chain
					return scope;
				};
			
			scope.pathEditable = pathEditable;
			
		})( this );
	
		//pathNodeRemovable
		//wip
		(function( scope ){
			
			var points = [];
			
			var tmpLayer,
				dataPath;
			
				var start = function( e ){
					dataPath._points.splice(e.target.i);
					
					self.update();
					tmpLayer.addTo(self.lfe);
				};
				
				var pathNodeRemovable = function( unable , dataPath_ , update_  ){
					if( unable ){
						
						dataPath = dataPath_;
						
						var pointsRec = L.cloneLatLngArray( dataPath._points );
						points = dataPath._points;
						
						tmpLayer = new L.LayerGroup();
						for( var i=0;i<points.length;i++ ){
							var dot = new L.Marker( points[i] , {"icon" : L.icons.editableSquare } )
							tmpLayer.addLayer( dot );
							dot.i = i;
							dot.on("mousedown",start );
						}
						tmpLayer.addTo(self.lfe);
						
					}else{
						if( tmpLayer )
							self.lfe.removeLayer( tmpLayer );
					}
					return scope;
				};
			
			scope.pathNodeRemovable = pathNodeRemovable;
			
		})( this );
		
		//elementSelectionnable
		(function( scope ){
			
			var acte = function(e){
				var element = e.target.data.model;
				if( element instanceof DataMap ){
					cmd.mgr.execute( cmd.flushCurrentElement.create( ) );
					return;
				}
				if(e.originalEvent.ctrlKey){
					var i=UIState.elements.length;
					while(i--)
						if( UIState.elements[i]==element ){
							cmd.mgr.execute( cmd.removeCurrentElement.create( element ) );
							return;
						}
					cmd.mgr.execute( cmd.addCurrentElement.create( element ) );	
				}else
					cmd.mgr.execute( cmd.setCurrentElement.create( element ) );
			};
			
			var elementSelectionnable = function( unable  ){
					if( unable ){
						var bindAllVisibleLayer = function(){
							var layers=uimap.layers;
							var i=layers.length;
							while(i--){
								layers[i].off( "click" , acte );
								if( !layers[i].hidden )
									layers[i].on( "click" , acte );
							}
							uimap.update();
						}
						bindAllVisibleLayer();
						
						// event need to be rebind ..
						// when a new layer is added or removed
						datamap.registerListener( "layer-struct" , {o:this,f:bindAllVisibleLayer} );						
						uimap.on( "click" , acte  );
					}else{
						var layers=uimap.layers;
						var i=layers.length;
						while(i--)
							layers[i].off( "click" , acte );
						uimap.off( "click" , acte  );
						map.removeListener( "layer-struct" );
					}
					return scope;
			};	
			scope.elementSelectionnable = elementSelectionnable;
			
		})( this );
		
		// enhanceSelection
		(function( scope ){
			// update the uimap, all the element pointed by the uistate must have the class reserved-selected and only them
			var currentSelect=[]; // is a UiData
			var selectionEnhance = function(){
							// remove class if no longuer selected
							var i=currentSelect.length;
							while(i--){
								var stillIn=false;
								var j=uistate.elements.length;
								while(j--)
									if(currentSelect[i].model==uistate.elements[j])
										stillIn=true;
								if(!stillIn){
									currentSelect[i].model.removeClass( "reserved-selected" );
									currentSelect.splice(i,1);
								}
							}
							// add class
							var j=uistate.elements.length;
							while(j--){
								var i=currentSelect.length;
								var notYetIn=true;
								while(i--)
									if(currentSelect[i].model==uistate.elements[j])
										notYetIn=false;
								if(notYetIn){
									var uielement= uimap.getElement( uistate.elements[j] );
									currentSelect.push( uielement );
									uielement.model.addClass( "reserved-selected" );
								}
							}
			};
			var enhanceSelection = function( unable  ){
					uistate.removeListener( "select-element" , {o:this,f:selectionEnhance} );
					if( unable ){
						uistate.registerListener( "select-element" , {o:this,f:selectionEnhance} );
						selectionEnhance();
					}else{
						//remove all the class reserved-selected
						var i=currentSelect.length;
						while(i--)
							currentSelect[i].model.removeClass( "reserved-selected" );
						currentSelect=[];
					}
					return scope;
			};	
			scope.enhanceSelection = enhanceSelection;
			
		})( this );
		
		// enhanceLayerSelection
		(function( scope ){
			// update the uimap, all the element pointed by the uistate must have the class reserved-selected and only them
			var currentSelect=[]; // is a UiData
			var selectionEnhance = function(){
							var newSelect;
							if(!uistate.layer)
								newSelect=[];
							else
								newSelect=datamap.getLayer(uistate.layer).getElements();
							
							// remove class if no longuer selected
							var i=currentSelect.length;
							while(i--){
								var stillIn=false;
								var j=newSelect.length;
								while(j--)
									if(currentSelect[i].model==newSelect[j])
										stillIn=true;
								if(!stillIn){
									currentSelect[i].model.removeClass( "reserved-layer-selected" );
									currentSelect.splice(i,1);
								}
							}
							// add class
							var j=newSelect.length;
							while(j--){
								var i=currentSelect.length;
								var notYetIn=true;
								while(i--)
									if(currentSelect[i].model==newSelect[j])
										notYetIn=false;
								if(notYetIn){
									var uielement= uimap.getElement( newSelect[j] );
									currentSelect.push( uielement );
									uielement.model.addClass( "reserved-layer-selected" );
								}
							}
			};
			var enhanceLayerSelection = function( unable  ){
					uistate.removeListener( "select-layer" , {o:this,f:selectionEnhance} );
					if( unable ){
						uistate.registerListener( "select-layer" , {o:this,f:selectionEnhance} );
						selectionEnhance();
					}else{
						//remove all the class reserved-selected
						var i=currentSelect.length;
						while(i--)
							currentSelect[i].model.removeClass( "reserved-layer-selected" );
						currentSelect=[];
					}
					return scope;
			};	
			scope.enhanceLayerSelection = enhanceLayerSelection;
			
		})( this );
	},
	update : function(){
		
		this.uiDataMap.update();
	},
	resize: function(w,h){
		/*
		if(!w||!h){
			if(this.el.parent()){
				w=this.el.parent().attr('width')
			}
		}
		
		var el=$("<div>").css({'width':'100%','height':'100%'});
		*/
		var el=$("<div>").css({'width':w+'px','height':h+'px'});
		
		this.uiDataMap.listen(false);
		this.el.children().remove();
		this.el.replaceWith(el);
		
		this.el=el;
		this.uiDataMap = LeafletMap.create( this.model , this.el[0] );
		this.uiDataMap.update();
		this.uiDataMap.lfe.fitWorld();
	},
	pathTraceable : function( unable , update ){return this;},
	pathEditable : function( unable , points , update ){return this;},
	pathNodeRemovable : function( unable , points , update ){return this;},
	pathNodeAddable : function( unable , points , update ){return this;},
	pathSelectionnable : function( unable , update ){return this;},
	elementSelectionnable : function( unable , update ){return this;},
	enhanceSelection : function( unable ){return this;},
	enhanceLayerSelection : function( unable ){return this;},
});
UIMap.create = function( datamap , width , height ){
	var m = new UIMap();
	m.init( datamap , width , height );
	return m;
}




function WorldMap(){};
extend( WorldMap , AbstractComponent.prototype );
extend( WorldMap , {
	map:null,
	top:null,
	bot:null,
	init:function(){
		var width=500,
			height=500;
		var el=$('<div>')
		.width(width).height(height)
		.appendTo($('body'));
		var map=L.map(el[0],{
			center:new L.LatLng(40,-10),
			zoom:3,
			maxZoom:7,
			scrollWheelZoom:false,
			maxBounds:new L.LatLngBounds(new L.LatLng(-83.7,-180), new L.LatLng(83.7,180))
		});
		el.detach()
		.css({'width':'100%' , 'height':'100%'});
		var onEachFeature=function(feature, layer){
			layer.setStyle({
				opacity:1,
				weight:0.3
			});
		};
		L.geoJson(countriesGeoJSON,{onEachFeature: onEachFeature}).addTo(map);
		
		this.top=new L.LatLng(35,-20);
		this.bot=new L.LatLng(60,30);
		
		this.map=map;
		this.el=el;
		this.initInteraction();
		this.editable(true);
	},
	initInteraction:function(){
		var self=this;
		(function(scope){
			
			var target;
			var anchorM={x:0,y:0};
			var anchorD={x:0,y:0};
			var newTop,newBot;
			var startDrag=function(e){
				target=e.target;
				anchorM.x=e.originalEvent.pageX;
				anchorM.y=e.originalEvent.pageY;
				
				self.map.off('mousemove',onDrag);
				self.map.off('mouseup',stopDrag);
				
				self.map.on('mousemove',onDrag);
				self.map.on('mouseup',stopDrag);
				
				anchorD=self.map.project(e.target.getLatLng());
				e.originalEvent.stopPropagation();
				e.originalEvent.preventDefault();
			};
			var stopDrag=function(e){
				self.map.off('mousemove',onDrag);
				self.map.off('mouseup',stopDrag);
				
				self.top=newTop||self.top;
				self.bot=newBot||self.bot;
			};
			var onDrag=function(e){
				var dx=(e.originalEvent.pageX-anchorM.x),
					dy=(e.originalEvent.pageY-anchorM.y);
				
				newTop=self.top;
				newBot=self.bot;
				
				if(target.i==4){
					var t=self.map.project(self.top);
					t.x+=dx;
					t.y+=dy;
					newTop=self.map.unproject(t);
					
					var t=self.map.project(self.bot);
					t.x+=dx;
					t.y+=dy;
					newBot=self.map.unproject(t);
				}
				if(target.i==0){
					var t=self.map.project(self.top);
					t.x+=dx;
					t.y+=dy;
					newTop=self.map.unproject(t);
				}
				if(target.i==1){
					var t=self.map.project(self.top);
					t.y+=dy;
					newTop=self.map.unproject(t);
					var t=self.map.project(self.bot);
					t.x+=dx;
					newBot=self.map.unproject(t);
				}
				if(target.i==2){
					var t=self.map.project(self.bot);
					t.x+=dx;
					t.y+=dy;
					newBot=self.map.unproject(t);
				}
				if(target.i==3){
					var t=self.map.project(self.top);
					t.x+=dx;
					newTop=self.map.unproject(t);
					var t=self.map.project(self.bot);
					t.y+=dy;
					newBot=self.map.unproject(t);
				}
				
				ctrlsPoints[0].setLatLng(new L.LatLng(newTop.lat,newTop.lng));
				ctrlsPoints[1].setLatLng(new L.LatLng(newTop.lat,newBot.lng));
				ctrlsPoints[2].setLatLng(new L.LatLng(newBot.lat,newBot.lng));
				ctrlsPoints[3].setLatLng(new L.LatLng(newBot.lat,newTop.lng));
				ctrlsPoints[4].setLatLng(new L.LatLng(newBot.lat/2+newTop.lat/2,newBot.lng/2+newTop.lng/2));
				
				rect.setLatLngs([ctrlsPoints[0].getLatLng(),ctrlsPoints[1].getLatLng(),ctrlsPoints[2].getLatLng(),ctrlsPoints[3].getLatLng(),ctrlsPoints[0].getLatLng()]);
				
			};
			
			
			var ctrlsPoints=[
				new L.Marker( new L.LatLng(self.top.lat,self.top.lng) ),
				new L.Marker( new L.LatLng(self.top.lat,self.bot.lng) ),
				new L.Marker( new L.LatLng(self.bot.lat,self.bot.lng) ),
				new L.Marker( new L.LatLng(self.bot.lat,self.top.lng) ),
				new L.Marker( new L.LatLng(self.bot.lat/2+self.top.lat/2,self.bot.lng/2+self.top.lng/2) ),
			];
			for(var i=0;i<5;i++)
				ctrlsPoints[i].i=i;
				
			var rect= new L.Rectangle( new L.LatLngBounds( self.top , self.bot ) );
			
			
			var makeMeEditable=function(enable){
				self.map.off('mousemove',onDrag);
				self.map.off('mouseup',stopDrag);
				for(var i=0;i<ctrlsPoints.length;i++)
					ctrlsPoints[i].off('mousedown',startDrag);
				if(enable){
					rect.addTo(self.map);
					for(var i=0;i<ctrlsPoints.length;i++){
						ctrlsPoints[i].addTo(self.map);
						ctrlsPoints[i].on('mousedown',startDrag);
					}
				}
			};
			scope.editable=makeMeEditable;
		})(this);
	},
	getZone:function(){
		return {A:new L.latLng(this.top.lat,this.top.lng),B:new L.latLng(this.bot.lat,this.bot.lng)};
	},
	editable:function(enable){return this;},
});
WorldMap.create = function( ){
	var m = new WorldMap();
	m.init(  );
	return m;
}


var WorldMap2=Backbone.View.extend({
	lfe:null,
	initialize:function(option){
		this.initLfe (option.width,option.height);
		this.initInteraction();
	},
	initLfe :function(w,h){
		var w=w||500,
			h=h||500;
		
		this.$el.children().remove();		//clean the element
		this.$el.attr('width',w).attr('height',h).css({'width':w+'px','height':h+'px'});		//set the dimension
		
		var tmpAppend=false;	
		if(!this.$el.parent()){				//the element given in param to the leaflet constructor must be in the DOW flow
			this.$el.appendTo($('body'));	//if not, add it temporaly
			tmpAppend=true;
		}
		this.lfe=new L.Map(this.$el.get(0),{
			center:new L.LatLng(40,-10),
			zoom:3,
			maxZoom:7,
			scrollWheelZoom:false,
			maxBounds:new L.LatLngBounds(new L.LatLng(-83.7,-180), new L.LatLng(83.7,180))
		});		//init the lfe
		
		if( tmpAppend )
			this.$el.detach();
			
		this.$el.css({'width':'100%' , 'height':'100%'});
		
		var onEachFeature=function(feature, layer){
			layer.setStyle({
				opacity:1,
				weight:0.3
			});
		};
		L.geoJson(countriesGeoJSON,{onEachFeature: onEachFeature}).addTo(this.lfe);
	},
	initInteraction:function(){
		var self=this;
		var map=this.lfe;
		var model=this.model;
		(function(scope,map,model){
			
			var target;
			var anchorM={x:0,y:0};
			var anchorD={x:0,y:0};
			var newTop,newBot;
			var exTop,exBot;
			var startDrag=function(e){
				target=e.target;
				anchorM.x=e.originalEvent.pageX;
				anchorM.y=e.originalEvent.pageY;
				
				map.off('mousemove',onDrag);
				map.off('mouseup',stopDrag);
				
				map.on('mousemove',onDrag);
				map.on('mouseup',stopDrag);
				
				exTop=model.get('zoneTop');
				exBot=model.get('zoneBot');
				
				anchorD=map.project(e.target.getLatLng());
				e.originalEvent.stopPropagation();
				e.originalEvent.preventDefault();
			};
			var stopDrag=function(e){
				map.off('mousemove',onDrag);
				map.off('mouseup',stopDrag);
				
				if(newTop&&newBot)
					model.set({'zoneTop':newTop , 'zoneBot':newBot });
			};
			var onDrag=function(e){
				var dx=(e.originalEvent.pageX-anchorM.x),
					dy=(e.originalEvent.pageY-anchorM.y);
				
				newTop=exTop;
				newBot=exBot;
				
				if(target.i==4){
					var t=map.project(exTop);
					t.x+=dx;
					t.y+=dy;
					newTop=map.unproject(t);
					
					var t=map.project(exBot);
					t.x+=dx;
					t.y+=dy;
					newBot=map.unproject(t);
				}
				if(target.i==0){
					var t=map.project(exTop);
					t.x+=dx;
					t.y+=dy;
					newTop=map.unproject(t);
				}
				if(target.i==1){
					var t=map.project(exTop);
					t.y+=dy;
					newTop=map.unproject(t);
					var t=map.project(exBot);
					t.x+=dx;
					newBot=map.unproject(t);
				}
				if(target.i==2){
					var t=map.project(exBot);
					t.x+=dx;
					t.y+=dy;
					newBot=map.unproject(t);
				}
				if(target.i==3){
					var t=map.project(exTop);
					t.x+=dx;
					newTop=map.unproject(t);
					var t=map.project(exBot);
					t.y+=dy;
					newBot=map.unproject(t);
				}
				
				ctrlsPoints[0].setLatLng(new L.LatLng(newTop.lat,newTop.lng));
				ctrlsPoints[1].setLatLng(new L.LatLng(newTop.lat,newBot.lng));
				ctrlsPoints[2].setLatLng(new L.LatLng(newBot.lat,newBot.lng));
				ctrlsPoints[3].setLatLng(new L.LatLng(newBot.lat,newTop.lng));
				ctrlsPoints[4].setLatLng(new L.LatLng(newBot.lat/2+newTop.lat/2,newBot.lng/2+newTop.lng/2));
				
				rect.setLatLngs([ctrlsPoints[0].getLatLng(),ctrlsPoints[1].getLatLng(),ctrlsPoints[2].getLatLng(),ctrlsPoints[3].getLatLng(),ctrlsPoints[0].getLatLng()]);
				
			};
			
			exTop=model.get('zoneTop');
			exBot=model.get('zoneBot');
			
			var ctrlsPoints=[
				new L.Marker( new L.LatLng(exTop.lat,exTop.lng) ),
				new L.Marker( new L.LatLng(exTop.lat,exBot.lng) ),
				new L.Marker( new L.LatLng(exBot.lat,exBot.lng) ),
				new L.Marker( new L.LatLng(exBot.lat,exTop.lng) ),
				new L.Marker( new L.LatLng(exBot.lat/2+exTop.lat/2,exBot.lng/2+exTop.lng/2) ),
			];
			for(var i=0;i<5;i++)
				ctrlsPoints[i].i=i;
				
			var rect= new L.Rectangle( new L.LatLngBounds( exTop, exBot ) );
			
			// add element to the frame
			rect.addTo(map);
			for(var i=0;i<ctrlsPoints.length;i++)
				ctrlsPoints[i].addTo(map);
			
			var makeMeEditable=function(enable){
				map.off('mousemove',onDrag);
				map.off('mouseup',stopDrag);
				for(var i=0;i<ctrlsPoints.length;i++)
					ctrlsPoints[i].off('mousedown',startDrag);
				if(enable){
					for(var i=0;i<ctrlsPoints.length;i++)
						ctrlsPoints[i].on('mousedown',startDrag);
				}
				return this;
			};
			scope.editable=makeMeEditable;
		})(this,map,model);
	},
	editable:function(enable){return this;},
	listen:function(unable){
		return this;
	},
});


function AttributeMgr(){};
extend( AttributeMgr , {
	el : null,
	uistate : null,
	classesElement:null,
	idElement:null,
	init : function(){
		this.uistate=UIState;
		
		var el=$("<div>").addClass('attributeMgr').css({'width':'100%','height':'100%'});
		
		var visage=$('<div>').css({'display':'inline-block'}).addClass('span1').addClass('height12').appendTo(el);
		
		var main=$('<div>').css({'display':'inline-block'}).addClass('span11').addClass('height12').appendTo(el);
		
		var id=$('<span><span style="margin-right:1em;" class="label">Name : </span></span>').css({'display':'block','height':'20px'}).appendTo(main);
		this.idElement=$('<span>').appendTo(id);
		
		var classes=$('<span><span style="margin-right:1em;" class="label">Class : </span></span>').appendTo(main);
		this.classesElement=$('<div>').css({'width':'70%','overflow-x':'auto','white-space':'nowrap','display':'inline-block'}).appendTo(classes);
		
		this.el=el;
		
		this.initInteraction();
		this.listen(true);
	},
	update:function(){
		var els=this.uistate.elements;
		var self=this;
		if( els.length<=0 )
			return;
		//compute common classes
		commonClasses={};
		for(var j in els[0]._classes ){
			if( j.substr(0,9) == "reserved-" )
				continue;
			var accept=true;
			for( var i=1;i<els.length;i++)
				if(!els[i]._classes[j])
					accept=false;
			if(accept)
				commonClasses[j]=true;
		}
		
		var correcter=function(value){
			return value.trim().replace(/ /g,'-');
		};
		var finish=function(target,exvalue){
			var value=target.text().trim();
			if(exvalue==value)
				return;
			if(value==null||value==""){
				//remove the class
				var t=[];
				var i=els.length;
				while(i--)
					t.push(cmd.removeClass.create( els[i] , exvalue ));
				cmd.mgr.execute(cmd.multi.createWithTab( t ));
				return;
			}
			if(value!=null&&value!=""){
				//modify the class
				var t=[];
				var i=els.length;
				while(i--)
					t.push(cmd.modifyClass.create( els[i] , exvalue , value ));
				cmd.mgr.execute(cmd.multi.createWithTab( t ));
				return;
			}
		};
		var finishPlus=function(target,exvalue){
			var value=target.text().trim();
			
			if(value!=""){
				var t=[];
				var i=els.length;
				
				target.data('SmartEdit').finish=finish;	//change the behavior, useless as the cmd will call an update on this element
				
				while(i--)
					t.push(cmd.addClass.create( els[i] , value ));
				cmd.mgr.execute(cmd.multi.createWithTab( t ));
			}else{
				target.empty().wrapInner('&nbsp;&nbsp;&nbsp;+&nbsp;&nbsp;&nbsp;&nbsp;');
			}
		};
		
		var classes=this.classesElement;
		classes.children().remove();
		for( var c in commonClasses ){
			$('<span>.</span>').appendTo(classes);
			$('<span>'+c+'</span>')
			.addClass('class')
			.smartlyEditable({'finish':finish , 'correcter':correcter})
			.appendTo(classes);
		}
		
		$('<span>&nbsp;&nbsp;&nbsp;+&nbsp;&nbsp;&nbsp;&nbsp;</span>')
			.addClass('class')
			.smartlyEditable({'finish':finishPlus , 'correcter':correcter})
			.appendTo(classes);
			
		var finish=function(target){
			var value=target.text().trim();
			cmd.mgr.execute(cmd.modifyId.create(els[0],value));
			return;
		};
		var id=this.idElement;
		id.children().remove();
		if(els.length==1){	
			var name=els[0].getName()||'';
			if(name.length==0)
				name='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
			$('<span>'+name+'</span>')
			.addClass('id')
			.smartlyEditable({'finish':finish})
			.appendTo(id);
		}else
			$('<span>---</span>').addClass('id').appendTo(id);
		/*
		var display=false;
		var displayDataList=function(e){
			if( display ){
				self.update();
				return;
			}
			display=true;
			(function(){
				var target=$(e.target);
				var plus = target.text()=="+";
				var exClass = target.text();
				var dataList=$('<datalist id="class-option"></datalist>');
				var input=null;
				var complete=function(){
					var value=input.val();
					dataList.children().remove();
					if( value.length>=1 ){
						var a =TagMgr.complete("class",value,5);
						for(var i=0;i<a.length;i++)
							$("<option>"+a[i]+"</option>").appendTo(dataList);
					}
				};
				var accepte=function(){
					var value=input.val();
					input.unbind("keyup",keyupHandler);
					if( plus )
						if( value.length > 0 ){
							var t=[];
							var i=els.length;
							while(i--)
								t.push(cmd.addClass.create( els[i] , value ));
							cmd.mgr.execute(cmd.multi.createWithTab( t ));
							return;
						}else
							self.update();
					else
						if( value.length > 0 ){
							var t=[];
							var i=els.length;
							while(i--)
								t.push(cmd.modifyClass.create( els[i] , exClass , value ));
							cmd.mgr.execute(cmd.multi.createWithTab( t ));
							return;
						}else{
							var t=[];
							var i=els.length;
							while(i--)
								t.push(cmd.removeClass.create( els[i] , exClass , value ));
							cmd.mgr.execute(cmd.multi.createWithTab( t ));
							return;
						}
				};
				var keyupHandler =function(e){
					if(event.which==13){
						event.preventDefault();
						accepte();
						return;
					}
					complete();
				};
				input=$('<input list="class-option" type="text" style="min-width:20px;" value="'+(plus?'':exClass)+'" ></input>').insertBefore(target).bind("change",accepte);
				input.bind("keyup",keyupHandler);
				dataList.insertBefore(target);
				target.remove();
			})();
		};
		
		var classes=this.el.find("#class");
		classes.children().remove();
		var classSpan=$("<span></span>").appendTo(classes).addClass("classList");
		$('<span>class = "</span>').appendTo(classSpan);
		for( var i in commonClasses ){
			var span = $("<span>"+i+"</span>").bind("click",displayDataList);
			span.appendTo(classSpan);
		}
		$("<span>+</span>").appendTo(classSpan).bind("click",displayDataList);
		$('<span>"</span>').appendTo(classSpan);
		
		*/
	},
	getElement : function(){
		return this.el;
	},
	initInteraction : function(){
		//updatable
		var self=this;
		(function(scope){
			var uistate=self.uistate;
			var key=null;
			var els=null;
			var changeElement=function(){
				if( els != null )
					for(var j=0;j<els.length;j++)
						els[j].removeListener( this );
				els=self.uistate.elements;
				if( els != null && els.length>0)
					for(var j=0;j<els.length;j++)
						els[j].registerListener("set-attribute",{o:self,f:self.update});
				self.update();
			};
			var listen=function(enable){
				if(enable){
					key=uistate.registerListener( "select-element" ,{o:this,f:changeElement});
					changeElement();
				}else{
					uistate.removeListener( "select-element",key);
					if( els != null )
					for(var j=0;j<els.length;j++)
						els[j].removeListener( this );
				}
				return self;
			};
			scope.listen=listen;
		})(this);
	},
	listen:function(enable){return this;},
});
AttributeMgr.create=function(){
	var a = new AttributeMgr();
	a.init();
	return a;
};

function LayerMgr(){};
LayerMgr.prototype = {
	
	el : null,
	datamap : null,
	selected : 0,
	_layerDeletable : false,
	_layerAddable : false,
	_layerSelectionable : false,
	
	init : function( datamap  ){
		
		this.datamap = datamap;
		
		
		// create the element
		var el = $("<div>").css({'width':'100%' , 'height':'100%'}); 
		
		$("<table>").addClass('table table-condensed table-hover').appendTo( el );
		$("<div>").addClass("toolBox").appendTo( el );
		
		
		this.el = el;
		
		this.listen(true);
	},
	getElement : function(){
		return this.el;
	},
	update : function(){
		
		var el = this.el;
		
		var liste = el.find("table");
		
		// clear the list
		liste.children().remove();
		
		// 
		var layers = this.datamap.getLayers();
		
		var self = this;
		
		for( var i = 0 ; i < layers.length ; i ++ )
			(function(){
				// create this anonymous scope make the var set persistent
				var stamp = layers[i].getStamp();
				var j=i;
				var item = $("<tr>").attr( "i" , ""+i );
				var bin;
				
				// the name
				$("<td><span>"+layers[i].getName()+"</span></td>").appendTo( item );
				
				//add a trash bin button
				if( self._layerDeletable ){
					var bin = $("<span>").addClass("icon-trash");
					bin.bind( "click" , function(){
						cmd.mgr.execute( cmd.deleteLayer.create( stamp , self.datamap ) );	
					});
					bin.children('span');
					bin.appendTo( $('<td>').appendTo(item) );
					bin.hide();
				}
				
				// add a mouseover event if needed
				if( self._layerDeletable ){
					item.bind("mouseover", function(){
						bin.show();
					} );
					item.bind("mouseout", function(){
						bin.hide();
					} );
				}
				
				// add a click event on the item
				if( self._layerSelectionable ){
					item.bind("click" , function(){
						if( UIState.layer && UIState.layer.getStamp() == layers[j].getStamp() )
							return;
						UIState.setLayer(layers[j]);	
					});
					
					if( UIState.layer && UIState.layer.getStamp() == layers[j].getStamp() )
						item.addClass( "selected" );
				}
				
				
				// attach the item to the list
				item.appendTo( liste );
				
			})();
	},
		
	
	//property
	layerDeletable : function( unable  ){
		if( unable ){
			
			$( "#delAllLayerBn" ).remove();
			
			var self = this;
			
			var bnDeletall = $("<div>").attr("id" , "delAllLayerBn" ).addClass( "btn" ).attr("name" , "delete all" ).appendTo( this.el.find(".toolBox" ) ).bind( "click" , function(){
				
				var cmds = [];
				
				UIState.setLayer(null);
				
				//cmds.push( cmd.changeCurrentLayer.create( self.selected  ) );
				var layers = self.datamap.getLayers();
				for( var i = 0 ; i < layers.length ; i ++ )
					cmds.push( cmd.deleteLayer.create( layers[ i ] , self.datamap ) );
				cmd.mgr.execute( cmd.multi.createWithTab( cmds ) );
				
			});
			bnDeletall[ 0 ].innerHTML = "del All";
			
			
			this._layerDeletable = true;
			
			this.update();
			
		} else {
			
			$( "#delAllLayerBn" ).remove();
			
			this._layerDeletable = false;
			
			this.update();
			
		}
		return this;
	},
	layerAddable : function( unable  ){
		if( unable ){
			$( "#addLayerBn" ).remove();
			var self = this;
			var bn = $("<div>").attr("id" , "addLayerBn" ).addClass( "btn" ).attr("name" , "new" ).appendTo( this.el.find(".toolBox" ) ).bind( "click" , function(){
				popUp.addLayer.create( self.datamap , { f : function(){ 
							if( self._updateAddable ) 
								self._updateAddable.f.call( self._updateAddable.o );
							self.map.notify(); 
							}, o : self } );
				
				//popUp.addLayer.create( self.map , { f : self.map.notify , o : self.map } );
			});
			bn[ 0 ].innerHTML = "new";
			
			this._layerAddable = true;
		} else {
			$( "#addLayerBn" ).remove();
			this._layerAddable = false;
		}
		return this;
	},
	layerHiddable : function( unable  ){
		/*
		if( unable ){
			$( "#addLayerBn" ).remove();
			var self = this;
			var bn = $("<div>").attr("id" , "addLayerBn" ).addClass( "btn" ).attr("name" , "new" ).appendTo( this.el.find(".toolBox" ) ).bind( "click" , function(){
				popUp.addLayer.create( self.datamap , { f : function(){ 
							if( self._updateAddable ) 
								self._updateAddable.f.call( self._updateAddable.o );
							self.map.notify(); 
							}, o : self } );
				
				//popUp.addLayer.create( self.map , { f : self.map.notify , o : self.map } );
			});
			bn[ 0 ].innerHTML = "new";
			
			this._layerAddable = true;
		} else {
			$( "#addLayerBn" ).remove();
			this._layerAddable = false;
		}*/
		return this;
	},
	layerSelectionable : function( unable  ){
		if( unable ){
			
			this._layerSelectionable = true;
			
			this.update();
			
		} else {
			
			this._layerSelectionable = false;
			
			this.update();
		}
		return this;
	},
	listen:function(enable){
		var datamap=this.datamap,
			uistate=UIState;
		datamap.removeListener('layer-struct',{o:this,f:this.update});
		uistate.removeListener('select-layer',{o:this,f:this.update});
		if( enable){
			datamap.registerListener('layer-struct',{o:this,f:this.update});
			uistate.registerListener('select-layer',{o:this,f:this.update});
		}
		this.update();
	},
}
LayerMgr.create = function( datamap ){
	var lm = new LayerMgr();
	lm.init( datamap );
	return lm;
}


function TimeLine(){};
extend( TimeLine , AbstractComponent.prototype );
extend( TimeLine , {
	el : null,
	dateStart : null,
	dateEnd : null,
	bandStart : null,
	bandEnd : null,
	init : function(  ){
		
		
		this.dateEnd = this._Date2FloatYear( new Date() );
		this.dateStart = this.dateEnd - 50;
		this.bandStart = this.dateEnd - 100;
		this.bandEnd = this.dateEnd;
		
		var w = 500, h = 50;
		
		//var el = $("<div>").addClass( "block" ).addClass("timeLine").attr( "width" , w ).attr( "height" , h ).css( { "width": w , "height": h } );
		var el = $("<div>").addClass("timeLine").css( { "width": '100%' , "height": '100%' } );
		
		// le fond de la barre
		var fond = $("<div>").attr( "id" , "fond" ).attr( "width" , w ).attr( "height" , h * 0.5 ).css( { "position" : "absolute" , "vertical-align" : "middle" , "width": w , "height": h * 0.5 } ).appendTo( el );
		
		var layer = $("<div>").css( { "position" : "absolute" } ).appendTo( el );
		
		var window = $("<div>").attr( "id" , "window" ).css( { "position" : "absolute" , "vertical-align" : "middle" , "height": h * 0.9 , "box-shadow" : "0 0 0 3px  #333" } ).appendTo( layer );
		
		var dotStart = $("<div>").attr( "id" , "dotStart" ).addClass("dot").css( { "position" : "absolute" , "vertical-align" : "middle"  } ).appendTo( layer );
		var dotEnd   = $("<div>").attr( "id" , "dotEnd" ).addClass("dot").css( { "position" : "absolute" , "vertical-align" : "middle" } ).appendTo( layer );
		
		var hintStart   = $("<div>").attr( "id" , "hintStart" ).addClass("hint").css( { "position" : "absolute" } ).appendTo( layer );
		var hintEnd   = $("<div>").attr( "id" , "hintEnd" ).addClass("hint").css( { "position" : "absolute"  } ).appendTo( layer );
		
		$("<p>").appendTo( hintStart );
		$("<p>").appendTo( hintEnd );
		
		this.el = el;
		
		this.initInteraction();
		
		this.update();
	},
	initInteraction : function(){
		
		var self=this;;
		
		//editable
		(function( scope  ){
			
			var dragS = false;
			var dragE = false;
			
			var startS = function(e){
				dragS = true;
				e.preventDefault();
				e.stopPropagation();
			}
			var moveS = function( e ){
				if( !dragS )
					return;
				
				var lban_p = self.el.width(),
					sban_d = self.bandStart ,
					lban_d = self.bandEnd  - sban_d; 
				
				var x = e.pageX - self.el.position().left;
				
				self.dateStart = sban_d + x / lban_p * lban_d;
				
				if( self.dateStart > self.dateEnd )
					self.dateStart = self.dateEnd;
				
				if( self.dateStart < self.bandStart )
					self.dateStart = self.bandStart;
				
				self.update();
			}
			var endS = function( e ){
				if( !dragS )
					return;
				dragS = false;
			}
			
			
			
			var startE = function(e){
				dragE = true;
				e.preventDefault();
				e.stopPropagation();
			}
			var moveE = function( e ){
				if( !dragE )
					return;
				
				var lban_p = self.el.width(),
					sban_d = self.bandStart ,
					lban_d = self.bandEnd  - sban_d; 
				
				var x = e.pageX - self.el.position().left;
				
				self.dateEnd = sban_d + x / lban_p * lban_d;
				
				if( self.dateEnd < self.dateStart )
					self.dateEnd = self.dateStart;
				
				if( self.dateEnd > self.bandEnd )
					self.dateEnd = self.bandEnd;
				
				self.update();
			}
			var endE = function( e ){
				if( !dragE )
					return;
				dragE = false;
			}
			
			
			var makeMeEditable = function( enable ){
				
				if( enable ){
					var dotStart = self.el.find("#dotStart"),
						dotEnd = self.el.find("#dotEnd");
					
					dotStart.unbind( "mousedown" , startS ).bind( "mousedown" , startS );
					$("body").unbind( "mousemove" , moveS ).bind( "mousemove" , moveS );
					$("body").unbind( "mouseup" , moveS ).bind( "mouseup" , endS );
					
					dotEnd.unbind( "mousedown" , startE ).bind( "mousedown" , startE );
					$("body").unbind( "mousemove" , moveE ).bind( "mousemove" , moveE );
					$("body").unbind( "mouseup" , moveE ).bind( "mouseup" , endE );
				}else{
					var dotStart = self.el.find("#dotStart"),
						dotEnd = self.el.find("#dotEnd");
					
					dotStart.unbind( "mousedown" , startS );
					$("body").unbind( "mousemove" , moveS );
					$("body").unbind( "mouseup" , moveS );
					
					dotEnd.unbind( "mousedown" , startE );
					$("body").unbind( "mousemove" , moveE );
					$("body").unbind( "mouseup" , moveE );
				}
				return self;
			}
			
			scope.editable = makeMeEditable;
			
		})( this );
		
		
	},
	_Date2FloatYear : function( d ){
		
		//let s say a year is 365 hour
		
		var y = d.getFullYear();
		
		y += d.getMonth() * 30.5 / 365; 
		y += d.getDate() / 365;
		
		return y;
	},
	_FloatYear2Date : function( f ){
		return new Date( Math.floor( f ) , Math.floor( ( f%1 ) * 365 / 30.5 ) , Math.floor( ( ( f%1 ) * 365 ) % 30.5 ) , 0 , 0 , 0 , 0 );
	},
	update : function(){
		var window = this.el.find("#window");
		var dotStart = this.el.find("#dotStart");
		var dotEnd = this.el.find("#dotEnd");
		var hintStart = this.el.find("#hintStart");
		var hintEnd = this.el.find("#hintEnd");
		
		var lban_p = this.el.width(),
			sban_d = this.bandStart,
			lban_d = this.bandEnd - sban_d; 
		
		var swin_p = ( this.dateStart - sban_d ) / lban_d * lban_p,
			ewin_p = ( this.dateEnd   - sban_d ) / lban_d * lban_p;
			
		dotStart.css({ "left" : (swin_p - dotStart.width() /2)+"px" });
		dotEnd.css({ "left" :   (ewin_p - dotStart.width() /2)+"px" });
		
		window.css({ "left" : swin_p+"px" , "width" : ( ewin_p - swin_p )+"px" });
		
		hintStart.css({ "left" : (swin_p - hintStart.width() /2)+"px" });
		hintEnd.css({ "left" : (ewin_p - hintEnd.width() /2)+"px" });
		
		hintStart.find("p")[0].innerText = this._FloatYear2Date( this.dateStart ).getFullYear();
		hintEnd.find("p")[0].innerText = this._FloatYear2Date( this.dateEnd ).getFullYear();
		
	},
	getInterval : function(){
		return {
			dtstart:this.dateStart,
			dtend:this.dateEnd
		};
	},
	editable : function( unable ){ return this; },
} );
TimeLine.create = function( ){
	var lm = new TimeLine();
	lm.init( );
	return lm;
}

/*
 * easy property editor
 * is set up by the property stack currently
 */
function PropertyEditor(){};
extend( PropertyEditor , AbstractComponent.prototype );
extend( PropertyEditor , {
	onglet:null,
	_changeAlreadyDone:false,
	init : function(){
		
		var el = $("<div>").attr("id","property-editor").addClass( "componant" ).css({"z-index":1000}).appendTo( $("body") );
		
		var main = $("<div>").addClass("main");
		
		
		var onglet_render = $("<div>");
		
		$("<div>").addClass("preview").css({"border-radius":"10px" , "min-width":"100px" , "min-height":"100px" , "max-width":"200px" , "max-height":"200px" , 'display':'inline-block'}).appendTo( onglet_render );
		var toolBox=$("<div></div>").addClass("btn-toolbar").appendTo( onglet_render );  //.css({'display':'inline-block'})
		var group=$("<div></div>").addClass("btn-group btn-group-vertical").appendTo( toolBox );
		$("<div></div>").wrapInner("stroke").addClass("btn btn-small").attr("data-action" , "stroke" ).appendTo(group);
		$("<div></div>").wrapInner("fill").addClass("btn btn-small").attr("data-action" , "fill" ).appendTo(group);
		$("<div></div>").appendTo( onglet_render );
		$("<canvas>").appendTo( onglet_render.find(".preview") );
		
		var onglet_action = $("<div>");
		
		this.onglet={};
		this.onglet.render = onglet_render;
		this.onglet.action = onglet_action;
		
		
		var menu = $("<ul>").addClass("nav nav-tabs");
		var self=this;
		for( var i in this.onglet )
			(function(){
				var j=i;
				var bn = $('<li><a href="#">'+i+'</a></li>');
				bn.bind("click",function(){
					main.children().detach();
					self.onglet[j].appendTo(main);
					menu.find("li").removeClass("active");
					bn.addClass("active");
				});
				bn.appendTo( menu );
				bn.click();
			})();
		
		menu.find("li:first").click();
		
		menu.appendTo(el);
		main.appendTo(el);
		
		
		this.el = el;
		this.initInteraction();
		this.listen(true);
	},
	update:function(){
		var self = this;
		var drawCanvas=function(properties){

			var w = self.onglet.render.find(".preview").width(),
				h = self.onglet.render.find(".preview").height();
		
			var maxBorder= (properties["strocke-width"]==null)?15:Math.min(Math.min(w,h)/3,Math.max(properties["strocke-width"]/2+5,15));
			
			
			var w=130,h=130;
			
			var smoothRect=function(ctx,w,h,r){
				var r=Math.min(r,Math.min(w,h)/2);
				ctx.moveTo(r,0);
				ctx.lineTo(w-r,0);
				ctx.quadraticCurveTo(w,0,w,r);
				ctx.lineTo(w,h-r);
				ctx.quadraticCurveTo(w,h,w-r,h);
				ctx.lineTo(r,h);
				ctx.quadraticCurveTo(0,h,0,h-r);
				ctx.lineTo(0,r);
				ctx.quadraticCurveTo(0,0,r,0);
			};
			
			
			var ctx = self.onglet.render.find("canvas").attr("width",w).attr("height",h).css({"width":w , "height":h})[0].getContext("2d");
			ctx.clearRect(0,0,w,h);
			
			ctx.save();
			
			var pas=16;
			for(var x=0;x<Math.ceil(w/pas);x++)
			for(var y=0;y<Math.ceil(h/pas);y++){
				ctx.beginPath();
				ctx.rect(x*pas,y*pas,(x+1)*pas,(y+1)*pas);
				ctx.fillStyle=(((x+y)%2==0)?"#cfcfcf":"#dddddd");
				ctx.fill();
			}
			
			ctx.save();
			ctx.translate(maxBorder,maxBorder);
			ctx.beginPath();
			smoothRect(ctx,w-maxBorder*2,h-maxBorder*2,25);
			ctx.clip();
			
			
			if( properties["fill-color"]!=null ){
				ctx.beginPath();
				ctx.rect(0,0,w,h);
				ctx.fillStyle=properties["fill-color"];
				ctx.globalAlpha=properties["fill-opacity"]||1;
				ctx.fill();
			}
			
			ctx.restore();
			
			if( properties["strocke-color"]!=null ){
				ctx.translate(maxBorder,maxBorder);
				ctx.beginPath();
				smoothRect(ctx,w-maxBorder*2,h-maxBorder*2,25);
				ctx.strokeStyle=properties["strocke-color"];
				ctx.globalAlpha=properties["strocke-opacity"]||1;
				ctx.lineWidth=properties["strocke-width"]||1;
				ctx.lineCap = 'round';
				ctx.stroke();
			}
			
			ctx.restore();
		};
		
		
		if( UIState.declaration == null )
			return;
			
		drawCanvas( UIState.declaration.props );
		
		if( this._changeAlreadyDone ){
			this._changeAlreadyDone = false;
			return;
		}
		
		var properties = UIState.declaration.props;
		
		
		
		var cloneDeclaration=function(dec){
			//dirty
			return mCSS.semanticBuild(mCSS.parse(mCSS.declarationsToString([dec])))[0];
		};
		var setDeclaration=function(dec){
			self._changeAlreadyDone=true;
			cmd.mgr.execute( cmd.alterCSSDeclaration.create( dec , UIState.declaration ));
		};
		
		
		
		var createFlexibleBox=function(name){
			var box=$('<div class="box">');
			var label=$('<span>'+name+'</span>');
			var bn=$('<span>#</span>');
			var head=$('<span></span>');
			
			label.appendTo(head);
			bn.appendTo(head);
			
			var contenu=$('<div class="contenu hidden"></div>');
			
			head.appendTo(box);
			contenu.appendTo(box);
			
			bn.bind("click",function(){
				if(contenu.hasClass("visible")){
					contenu.removeClass("visible").addClass("hidden");
					contenu.height(0);
				}else{
					contenu.addClass("visible").removeClass("hidden");
					var h=5;
					contenu.children().each(function(){
						h+=$(this).height();
					});
					contenu.height(h);
				}
			});
			
			return box;
		};
		var createRangeProp=function(name,propName,f,f_){
			var ex=properties[propName];
			if(f)
				ex=f_(ex);
			var prop = $('<tr data-propName="'+propName+'" data-type="range"><td><input type="checkbox"></input></td><td><span class="property-name">'+name+'</span></td><td><span>:</span></td><td><input max="1000" class="property-value" type="range"></input></td></tr>');
			var down = false;
			// valid the change the property
			var goEdit=function(){
				var nDec=cloneDeclaration(UIState.declaration);
				var v=prop.find("input.property-value").val()/1000;
				if(f)
					v=Math.round( f(v)*100 )/100;
				nDec.props[propName]=v;
				setDeclaration( nDec );
				$("body").unbind("mouseup",goEdit);
				down=false;
			};
			//enable the property
			var unableEdit=function(){
				var nDec=cloneDeclaration(UIState.declaration);
				nDec.props[propName]=null;
				delete nDec.props[propName];
				setDeclaration( nDec );
				$("body").unbind("mouseup",goEdit);
				down=false;
			};
			var range = prop.find("input.property-value").val(ex*1000);
			range.bind("change",function(e){
				if(down==false){
					down=true;
					$("body").bind("mouseup",goEdit);
				}
			});
			var inherit=$('<span>').wrapInner("inherit");
			var checkBox=prop.find("input[type=checkbox]");
			checkBox.bind("change",function(e){
				if(!checkBox.is(":checked")){
					inherit.insertBefore( range );
					range.detach();
					prop.find("span.property-name").addClass("unuse");
					unableEdit();
				}else{
					range.insertBefore( inherit );
					inherit.detach();
					prop.find("span.property-name").removeClass("unuse");
					goEdit();
				}
			});
			
			checkBox.attr('checked', properties[propName]!=null );
			checkBox.change();
			
			return prop;
		}
		var createColorProp=function(name,propName){
			var ex=properties[propName];
			var prop = $('<tr data-propName="'+propName+'" data-type="color"><td><input type="checkbox"></input></td><td><span class="property-name">'+name+'</span></td><td><span>:</span></td><td><input type="text" class="property-value" style="background-color:'+ex+';" value="'+ex+'"></input><div/></td></tr>');
			/*
			var colorPicker=prop.find("div.property-value").ColorPicker({"eventName":"click","color":ex,
				"onSubmit":function(hsb, hex, rgb, el){
					goEdit();
				},
				"onChange":function(hsb, hex, rgb, el){
					prop.find("div.property-value").css({"background-color":"#"+hex});
					ex="#"+hex;
				},
			});*/
			var colorPicker=prop.find("input.property-value")
			.iris({
				'target':prop,
				'change':function(event,ui){
					colorPicker.css({"background-color":ui.color.toString()});
					ex=ui.color.toString();
				},
			})
			.bind('click',function(){
				colorPicker.iris('show');
			});
			
			prop.find('.iris-picker')
			.css({'height':'200px'});
			
			
			$('<div class="btn btn-primary">Ok</div>')
			.css({'position':'absolute','bottom':'10px','left':'50px'})
			.bind('click',function(){
				goEdit();
				colorPicker.iris('hide');
			})
			.appendTo( prop.find('.iris-picker') );
			
			// valid the change the property
			var goEdit=function(){
				var nDec=cloneDeclaration(UIState.declaration);
				nDec.props[propName]=ex;
				setDeclaration( nDec );
			};
			//enable the property
			var unableEdit=function(){
				var nDec=cloneDeclaration(UIState.declaration);
				nDec.props[propName]=null;
				delete nDec.props[propName];
				setDeclaration( nDec );
			};
			var inherit=$('<span>').wrapInner("inherit");
			var checkBox=prop.find("input[type=checkbox]");
			checkBox.bind("change",function(e){
				if(!checkBox.is(":checked")){
					inherit.insertBefore( colorPicker );
					colorPicker.detach();
					prop.find("span.property-name").addClass("unuse");
					unableEdit();
				}else{
					colorPicker.insertBefore( inherit );
					inherit.detach();
					prop.find("span.property-name").removeClass("unuse");
					goEdit()
				}
			});
			
			checkBox.attr('checked', properties[propName]!=null );
			checkBox.change();
			
			return prop;
		}
		
		
		
		var p = $(this.onglet.render.children("div")[2]);
		p.children().remove();
		if( properties["fill-color"] || properties["fill-opacity"] ){
			
			var box=createFlexibleBox("fill");
			var contenu=box.find(".contenu");
			var table=$("<table>").appendTo(contenu);
			createRangeProp("opacity","fill-opacity").appendTo(table);
			createColorProp("color","fill-color").appendTo(table);
			
			box.appendTo(p);
			
			this.el.find(".btn[data-action=fill]").css({"display":"none"});
		}else
			this.el.find(".btn[data-action=fill]").css({"display":"block"}).bind("click",function(){
				var nDec=cloneDeclaration(UIState.declaration);
				nDec.props["fill-color"]="#ffffff";
				setDeclaration( nDec );
				self.update();
			});
		if( properties["strocke-color"] || properties["strocke-opacity"] || properties["strocke-width"] ){
			
			var box=createFlexibleBox("strocke");
			var contenu=box.find(".contenu");
			var table=$("<table>").appendTo(contenu);
			createRangeProp("opacity","strocke-opacity").appendTo(table);
			createColorProp("color","strocke-color").appendTo(table);
			createRangeProp("width","strocke-width",function(x){return 30*x*x;},function(x){return Math.sqrt(x/30);}).appendTo(table);
			
			box.appendTo(p);
		
			this.el.find(".btn[data-action=stroke]").css({"display":"none"});
		}else
			this.el.find(".btn[data-action=stroke]").css({"display":"block"}).bind("click",function(){
				var nDec=cloneDeclaration(UIState.declaration);
				nDec.props["strocke-color"]="#ffffff";
				setDeclaration( nDec );
				self.update();
			});
		
	},
	initInteraction : function(){
		var self = this;
		var uistate=UIState;
		(function(scope){
			var setDeclaration=function(){
				self.update();
			};
			var listen = function(unable){
				uistate.removeListener( "set-declaration" , this );
				if(unable){
					uistate.registerListener( "set-declaration" ,{o:this,f:setDeclaration} );
					self.update();
				}
			};
			scope.listen=listen;
		})(this);
	
	},
});
PropertyEditor.create=function(){
	var a = new PropertyEditor();
	a.init();
	return a;
};

/*
 * an element that display a list of declaration
 * declaration can be raw edited
 * or edited throught the easy editor panel
 */
function PropertyStack(){};
extend( PropertyStack , AbstractComponent.prototype );
extend( PropertyStack , {
	el:null,
	commonElement:null,
	styleChain:null,		// displayed styleChain
	styleChainCommon:null,	// styleChain of the common element, only use in full mode
	_editable:false,
	_full:false,
	init : function( container ){
		
		var el = $("<div>").addClass("property-stack").css( { "width":'100%' , "height":'100%' } );
		
		var self=this;
		
		var tb=$("<div>").addClass("tool-box").appendTo(el);
		$('<input type="checkbox" ></input><span>display all</span>').appendTo(tb).bind("change",function(e){
			self.full( $(e.target).is(':checked') );
		});
		$('<input type="checkbox" checked="checked"></input><span>easy edit</span>').appendTo(tb).bind("change",function(e){
			self.easyEditable( $(e.target).is(':checked') );
		});
		
		var contenu=$('<div class="contenu hidden"></div>');
		var bnDeploy=$('<div class="btn">add declaration</div>').appendTo(tb).bind("click",function(e){
			if(contenu.hasClass("visible")){
				contenu.removeClass("visible").addClass("hidden");
				bnDeploy.empty().wrapInner("add declaration");
			}else{
				contenu.addClass("visible").removeClass("hidden");
				bnDeploy.empty().wrapInner("hidde");
				go();
			}
		});
		contenu.appendTo(tb);
		
		// add declaration
		var self=this;
		var go=(function(){
			
			var hint=$("<span>selector generated from selection : </span>");
			
			var cond=function(s){
				if(s[0]=="#")
					return "css-id";
				if(s[0]==".")
					return "css-class";
				return "css-tag";
			}
			var finish=function(target,exvalue){
				var value=target.text().trim();
				target.removeClass( cond(exvalue) ).addClass( cond(value) );
				
				if( exvalue.trim()=="" || exvalue.trim()=="+" )
					$('<span>').wrapInner("&nbsp;&nbsp;+&nbsp;&nbsp;").addClass("css-condition").smartlyEditable({'finish':finish,'correcter':correcter}).appendTo(target.parent());
					
				if( value=="")
					target.remove();
					
				//sort
				var p=target.parent()
				var c=p.children();
				var i=c.length;
				while(i--)
					if($(c[i]).hasClass("css-tag"))
						$(c[i]).detach().prependTo(p);
			};
			var complete=function(v,el){
					
					
			};
			var correcter=function(value){
				return value.trim().replace(/ /g,'-');
			};
		
			var computeCommonSelector=function(){
				var sp=$('<span>').addClass("css-selector");
				if( self.commonElement ){	
					if( self.commonElement.type )
						$('<span>').wrapInner(self.commonElement.type).addClass("css-condition").addClass("css-tag").smartlyEditable({'finish':finish,'correcter':correcter}).appendTo(sp);
					if( self.commonElement.id )
						$('<span>').wrapInner("#"+self.commonElement.id).addClass("css-condition").addClass("css-id").smartlyEditable({'finish':finish,'correcter':correcter}).appendTo(sp);
					for( var i in self.commonElement._classes )
						$('<span>').wrapInner("."+i).addClass("css-condition").addClass("css-class").smartlyEditable({'finish':finish,'correcter':correcter}).appendTo(sp);
				}
				$('<span>').wrapInner("&nbsp;&nbsp;+&nbsp;&nbsp;").addClass("css-condition").smartlyEditable({'finish':finish,'correcter':correcter}).appendTo(sp);
				return sp;
			}
			
			var addToCSS=function(){
				var selector=contenu.find(".css-selector");
				var tags=selector.children("css-tag");
				if( tags.length>1)
					hintDisplayer("only one tag per selector");
				for(var i=1;i<tags.length;i++)
					$(tags[i]).remove();
				selector.children("css-tag").detach().prependTo(selector);
				
				var last=selector.children(":last");
				if( last.text().trim() == "+" )
					last.remove();
				
				var decl=selector.text()+"{}";
				
				cmd.mgr.execute( cmd.addCSSDeclaration.create( decl) );
				bnDeploy.empty().wrapInner("add declaration");
				contenu.removeClass("visible").addClass("hidden");
			}
			
			return compute=function(){
				contenu.children().remove();
				hint.appendTo(contenu);
				computeCommonSelector().appendTo(contenu);
				$('<div class="btn">Ok</div>').appendTo(contenu).bind("click",addToCSS);
			}
			
		})();
		
		
		$("<div>").addClass("list").appendTo(el);
		
		if(container)
			el.appendTo(container);
		
		this.el = el;
		this.commonElement={};
		this.initInteraction();
		this.listen(true);
		
		this.el.find('.tool-box').find('input[type=checkbox]').change();
	},
	initInteraction : function(){
		
		var uistate = UIState;
		var self = this;
		var els=null;
		// listen
		(function( scope ){
				var computeCommonElement=function(){
					var common=new AbstractAttributeHolder();
					common._classes={};
					common._attributes={};
					if(els!=null&&els.length>0){
						//classes
						for(var j in els[0]._classes ){
							if( j.substr(0,9) == "reserved-" )
								continue;
							var accept=true;
							for( var i=1;i<els.length;i++)
								if(!els[i]._classes[j])
									accept=false;
							if(accept)
								common._classes[j]=true;
						}
						//type
						var accept=true;
						for( var i=1;i<els.length;i++)
							if(els[i].type!=els[0].type)
								accept=false;
						if(accept)
							common.type=els[0].type;
					}
					return common;
				}
				var computeAndUpdate=function(){
					var common = computeCommonElement();
					
					// is the new commonElement different?
					// TODO specified the diffrence check
					var equal=false;
					/*
					for(var i in common )
						if( !self.commonElement[i] )
							equal=false;
					for(var i in self.commonElement )
						if( !common[i] )
							equal=false;
					*/
					//if so update
					if( !equal ){
						self.commonElement=common;
						self.styleChain=mCSS.computeChain(self.commonElement);
						self.update();
					}
				};
				var changeElement=function(){
					if( els != null )
						for(var j=0;j<els.length;j++)
							els[j].removeListener( this );
					els=uistate.elements;
					if( els != null && els.length>0)
						for(var j=0;j<els.length;j++)
							els[j].registerListener("set-attribute",{o:this,f:computeAndUpdate});
					
					computeAndUpdate();
					UIState.setDeclaration(null);
				};
				var changeDeclaration=function(){
					this.el.find(".css-declaration").each(function(){
						var e=$(this);
						if( e.data("structure") == uistate.declaration )
							e.addClass("selected");
						else
							e.removeClass("selected");
					});
					
				};
				var listen=function(enable){
					mCSS.removeListener("set-css",this);
					if( els != null )
						for(var j=0;j<els.length;j++)
							els[j].removeListener( this );
					uistate.removeListener( "select-element" , this );
					uistate.registerListener( "set-declaration", this );
					if(enable){
						uistate.registerListener( "select-element" , {o:this,f:changeElement} );
						changeElement();
						mCSS.registerListener("set-css",{o:this,f:computeAndUpdate});
						uistate.registerListener( "set-declaration",{o:this,f:changeDeclaration} );
					}
					return self;
				}
			
			
			
			var propertyEditor=null;
			/*
			 * move the editor panel to the selected declaration, pointed by uistate
			 * assuming the editor panel is instanciate
			 */
			var displayEditorPanel=function(){
				var dec = uistate.declaration;
				if(propertyEditor==null)
					return;
				if(dec==null){
					propertyEditor.getElement().css({"display" : "none","top":"0px"});
					return;
				}
				propertyEditor.getElement().css({"display" : "block"});
				self.el.find(".css-declaration").each(function(){
					var e=$(this);
					if( e.data("structure") == uistate.declaration ){
						var y = e.position().top-25;
						var x= self.el.position().left-propertyEditor.getElement().width();
						propertyEditor.getElement().css({"top":y+"px" , "left":x+"px"});
					}
				});
			}
			
			/*
			 * behavior modifier
			 */
			var easyEditable=function(enable){
				uistate.removeListener("set-declaration",{o:this,f:displayEditorPanel});
				if( enable){
					uistate.registerListener("set-declaration",{o:this,f:displayEditorPanel});
					if( !propertyEditor )
						propertyEditor = PropertyEditor.create();
					propertyEditor.getElement().appendTo( self.el );
					propertyEditor.listen(true);
					displayEditorPanel();
				} else 
					if( propertyEditor ){
						propertyEditor.getElement().detach();
						propertyEditor.listen(false);
					}
				return self;
			};
			
			/*
			 * behavior modifier
			 */
			var editable=function(enable){
				if( enable != self._editable ){
					self._editable = enable;
					self.update();
				}
				return self;
			};
			
			var computeAndUpdateFull=function(){
					var common = computeCommonElement();
					
					// is the new commonElement different?
					// TODO specified the diffrence check
					var equal=false;
					/*
					for(var i in common )
						if( !self.commonElement[i] )
							equal=false;
					for(var i in self.commonElement )
						if( !common[i] )
							equal=false;
					*/
					//if so update
					if( !equal ){
						self.commonElement=common;
						self.styleChainCommon=mCSS.computeChain(self.commonElement);
						self.enlightCommon();
						displayEditorPanel();
					}
				};
			var changeElementFull=function(){
					if( els != null )
						for(var j=0;j<els.length;j++)
							els[j].removeListener( this );
					els=uistate.elements;
					if( els != null && els.length>0)
						for(var j=0;j<els.length;j++)
							els[j].registerListener("set-attribute",{o:this,f:computeAndUpdateFull});
					
					computeAndUpdateFull();
				};
			var computeFull=function(){
				self.styleChain=mCSS.computeChain();
				var i=self.styleChain.length;
				while(i--){
					var j=self.styleChain[i].origin.selectors[0].length;
					while(j--)
						if( self.styleChain[i].origin.selectors[0][j].class && self.styleChain[i].origin.selectors[0][j].class.substr(0,9) == "reserved-" ){
							self.styleChain.splice(i,1);
							break;
						}
				}
				self.update();
			}
			
			/*
			 * behavior modifier
			 */
			var full=function(enable){
				self._full=enable;
				uistate.removeListener( "select-element" , this );
				mCSS.removeListener("set-css",this );
				if( els != null )
					for(var j=0;j<els.length;j++)
						els[j].removeListener( this );
				if( enable ){
					mCSS.registerListener("set-css",{o:this,f:computeFull});
					uistate.registerListener( "select-element" , {o:this,f:changeElementFull} );
					changeElementFull();
					computeFull();
				}else{
					uistate.registerListener( "select-element" , {o:this,f:changeElement} );
					changeElement();
					mCSS.registerListener("set-css",{o:this,f:computeAndUpdate});
				}
				return self;
			}
			
			scope.listen=listen;
			scope.full=full;
			scope.editable=editable;
			scope.easyEditable=easyEditable;
		})( this );
	},
	/*
	 * destroy the list and build a proper one based on the styleChain attribute
	 */
	update:function(){
		var ps = this.el.find( ".list" );
		var self=this;
		ps.children().remove();
		var i=this.styleChain.length;
		while(i--){
			var decl=mCSS.declarationsToXML([this.styleChain[i].origin]).children(".css-declaration");
			decl.data("structure",this.styleChain[i].origin).appendTo(ps);
			$('<span class="css-property"><span class="css-property-name">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp</span></span>').appendTo(decl.children(".css-properties"));
			if( this.styleChain[i].origin == UIState.declaration )
				decl.addClass("selected");
		}
		this.enlightCommon();
		
		//bind event
		if(false){
		var display=false;
		var displayDataList=function(e){
			if( display ){
				self.update();
				return;
			}
			display=true;
			(function(){
				var target=$(e.target);
				var exText = target.text().trim();
				var plus = exText==""&&target.hasClass("css-property-name");
				var dataList=$('<datalist ></datalist>').attr("id","class-option-stack");
				var input=null;
				var complete=function(){
					/*
					var value=input.val();
					dataList.children().remove();
					if( value.length>=1 ){
						var a =TagMgr.complete("class",value,5);
						for(var i=0;i<a.length;i++)
							$("<option>"+a[i]+"</option>").appendTo(dataList);
					}
					*/
				};
				var correction=function(val){
					if(!val||val.length==0)
						return;
					if(target.hasClass('css-property')){
						return val;
						
					}
					return val;
				};
				var accepte=function(){
					// search the modified declaration
					var exDeclaration=input.parents(".css-declaration").data("structure");
					
					
					var value=correction(input.val());
					
					target.empty();
					target.wrapInner(value);
					target.insertBefore(input);
					input.remove();
					dataList.remove();
					
					
					
					input.unbind("keyup",keyupHandler);
					if( plus )
						if( value ){
							$('<span class="css-property-separator">:</span>').appendTo(target.parents(".css-property"));
							var propertyValue=$('<span class="css-property-value"></span>').appendTo(target.parents(".css-property"));
							$('<span class="css-property-end">;</span>').appendTo(target.parents(".css-property"));
							display=false;
							displayDataList( {target:propertyValue[0]} );
							return;
						}else
							self.update();
					else{
						var HTMLdec=target.parents(".css-declaration");
						if(!value||value.trim()=="")
							target.parents(".css-property").remove();
						var newDeclaration=HTMLdec.text().replace( new RegExp( "\xA0" , "g" ) , "" );	//replace the &nbsp;
						cmd.mgr.execute(cmd.alterCSSDeclaration.create(newDeclaration,exDeclaration));
					}
				};
				var keyupHandler =function(e){
					if(event.which==13){
						event.preventDefault();
						accepte();
						return;
					}
					complete();
				};
				input=$('<input list="class-option-stack" type="text" style="min-width:20px;" value="'+(plus?'':exText)+'" ></input>').insertBefore(target).bind("focusout",accepte).focus();
				input.bind("keyup",keyupHandler);
				dataList.insertBefore(target);
				target.remove();
			})();
		};
		
		if( this._editable )
			ps.find(".css-properties").find(".css-property-name,.css-property-value").bind("click",displayDataList);
		
		}
		
		var accepteName=function(){};
		var accepteValue=function(){};
		var finishName=function(target,exvalue){
			var value=target.text();
			if(exvalue.trim()==""||exvalue.trim()=="+"){
				$('<span>:</span>').addClass('css-property-separator').appendTo(target.parent());
				$('<span>').addClass('css-property-value').smartlyEditable({'finish':finishValue}).appendTo(target.parent()).click();
				$('<span>;</span>').addClass('css-property-end').appendTo(target.parent());
			}else{
				finishValue(target);
			}
		};
		var finishValue=function(target){
			var value=target.text();
			var HTMLdec=target.parents(".css-declaration");
			if(!value||value.trim()=="")
				target.parents(".css-property").remove();
			var newDeclaration=HTMLdec.text().replace( new RegExp( "\xA0" , "g" ) , "" );	//replace the &nbsp;
			var exDeclaration=target.parents(".css-declaration").data("structure");
			cmd.mgr.execute(cmd.alterCSSDeclaration.create(newDeclaration,exDeclaration));
		};
		if( this._editable ||true ){
			ps.find(".css-properties").find(".css-property-name").each(function(){
				$(this).smartlyEditable({'finish':finishName});
			});
			ps.find(".css-properties").find(".css-property-value").each(function(){
				$(this).smartlyEditable({'finish':finishValue});
			});
		}
		
		ps.find(".css-declaration").bind("click",function( e ){
			var dec = $(e.target).hasClass("css-declaration")?$(e.target).data("structure"):$(e.target).parents(".css-declaration").data("structure");
			if( dec == null || dec == UIState.declaration )
				return;
			UIState.setDeclaration( dec );
		});
	},
	enlightCommon:function(){
		if( !this._full )
			return;
		var set=this.el.find(".css-declaration").addClass("secondaire");
		if( !this.styleChainCommon || this.styleChainCommon.length == 0 )
			return;
		for(var i=0;i<this.styleChainCommon.length;i++){
			var j=set.length;
			while(j--){
				var e=$(set[j]);
				if( e.data("structure") == this.styleChainCommon[i].origin ){
					e.removeClass("secondaire");
						var p=e.parent();
						e.detach();
						e.prependTo(p);
					}
			}
		}
	},
	
	/*
	 * behavior modifier
	 * when on, an easy editor panel pop up when a declaration is selected
	 */
	easyEditable:function(enable){return this;},
	
	/*
	 * behavior modifier
	 * when on, the declaration can be edited as smartTextInput
	 */
	editable:function(enable){return this;},
	
	/*
	 * behavior modifier
	 * when on, all the declaration are displayed, instead of just the one which concern the selected element
	 * declaration that not concern the selected element are displayed, but with a different style ( has the secondaire class )  and are re order so that they appear at the end of the list
	 */
	full:function(enable){return this;},
});
PropertyStack.create=function( container ){
	var a = new PropertyStack();
	a.init( container );
	return a;
};


function SearchOrgan(){};
extend( SearchOrgan , AbstractComponent.prototype );
extend( SearchOrgan , {
	timeMgr:null,
	tagMgr:null,
	zoneMgr:null,
	_results:null,
	_stock:null,
	init:function(){
		
		var el=$('<div>').css({'width':'100%','height':'100%'});
		
		var self=this;
		
		$('<div>').addClass('btn').addClass('span1').addClass('height12').appendTo(el)
		.bind('click',function(){
			self.request();
		});
		
		this._stock=$('<div>').addClass('span11').addClass('height12').css({'overflow-y':'hidden','overflow-x':'auto','white-space':'nowrap'}).appendTo(el);
		
		this.el=el;
		
	},
	request:function(){
		/*
		var timeInterval=this._timeMgr.getInterval();
		var tags=this._tagMgr.getTags();
		var zone=this._zoneMgr.getZone();
		*/
		var timeInterval,tags,zone;
		if( this.timeMgr )
			timeInterval=this.timeMgr.getInterval();
		if( this.timeMgr )
			zone=this.zoneMgr.getZone();
		tags={classes:[]};
		
		var buildUrl=function(timeInterval,tags,zone){
			var path="simulatedProxy/search.json?callback=?&jsonp=?";
			
			path+="";
			path+="tags=";
			for(var i=0;i<tags.classes.length;i++){
				path+=tags.classes[i];
				if(i!=tags.length-1)
					path+="|";
			}
			path+="&Alat="+zone.A.lat;
			path+="&Alng="+zone.A.lng;
			path+="&Blat="+zone.B.lat;
			path+="&Blng="+zone.B.lng;
			
			if( timeInterval ){
				path+="&dtstart="+timeInterval.dtstart;
				path+="&dtend="+timeInterval.dtend;
			}
			return path;
		}
		
		var path=buildUrl(timeInterval,tags,zone);
		console.log(path);
		var self=this;
		/*
		$.getJSON( path,function(data){
			console.log(path);
			console.log(data);
		});
		*/
		var dataO={
'results':[
	{	
		'author':'leny',
		'name':'france',
		'gravatarHash':'a0408d1e61bbc0795fee026ddcdbd7a3',
		'description':'who need a map?',
		'elements':[
			{
			'type':'polygon',
			'id':'france',
			'classes':{
				'country':true,
				'OF-member':true
			},
			'attributes':{
				'population':5,
				'language':'fr',
			},
			'structure':[{"lat":50.378992,"lng":3.588184},{"lat":49.907497,"lng":4.286023},{"lat":49.985373,"lng":4.799222},{"lat":49.529484,"lng":5.674052},{"lat":49.442667,"lng":5.897759},{"lat":49.463803,"lng":6.18632},{"lat":49.201958,"lng":6.65823},{"lat":49.017784,"lng":8.099279},{"lat":48.333019,"lng":7.593676},{"lat":47.620582,"lng":7.466759},{"lat":47.449766,"lng":7.192202},{"lat":47.541801,"lng":6.736571},{"lat":47.287708,"lng":6.768714},{"lat":46.725779,"lng":6.037389},{"lat":46.27299,"lng":6.022609},{"lat":46.429673,"lng":6.5001},{"lat":45.991147,"lng":6.843593},{"lat":45.70858,"lng":6.802355},{"lat":45.333099,"lng":7.096652},{"lat":45.028518,"lng":6.749955},{"lat":44.254767,"lng":7.007562},{"lat":44.127901,"lng":7.549596},{"lat":43.693845,"lng":7.435185},{"lat":43.128892,"lng":6.529245},{"lat":43.399651,"lng":4.556963},{"lat":43.075201,"lng":3.100411},{"lat":42.473015,"lng":2.985999},{"lat":42.343385,"lng":1.826793},{"lat":42.795734,"lng":0.701591},{"lat":42.579546,"lng":0.338047},{"lat":43.034014,"lng":-1.502771},{"lat":43.422802,"lng":-1.901351},{"lat":44.02261,"lng":-1.384225},{"lat":46.014918,"lng":-1.193798},{"lat":47.064363,"lng":-2.225724},{"lat":47.570327,"lng":-2.963276},{"lat":47.954954,"lng":-4.491555},{"lat":48.68416,"lng":-4.59235},{"lat":48.901692,"lng":-3.295814},{"lat":48.644421,"lng":-1.616511},{"lat":49.776342,"lng":-1.933494},{"lat":49.347376,"lng":-0.989469},{"lat":50.127173,"lng":1.338761},{"lat":50.946606,"lng":1.639001},{"lat":51.148506,"lng":2.513573},{"lat":50.796848,"lng":2.658422},{"lat":50.780363,"lng":3.123252},{"lat":50.378992,"lng":3.588184}],
			}
		]
	},
	{
	'author':'al',
	'name':'allemagne',
	'gravatarHash':'a0408d1e61bbc0795fee026ddcdbd8a3',
	'description':'I do',
	'elements':[
			{
			'type':'polygon',
			'id':'germany',
			'classes':{
				'country':true,
				'OF-member':true
			},
			'attributes':{
				'population':5,
				'language':'fr',
			},
			'structure':[{"lat":58.635,"lng":-3.005005},{"lat":57.553025,"lng":-4.073828},{"lat":57.690019,"lng":-3.055002},{"lat":57.6848,"lng":-1.959281},{"lat":56.870017,"lng":-2.219988},{"lat":55.973793,"lng":-3.119003},{"lat":55.909998,"lng":-2.085009},{"lat":55.804903,"lng":-2.005676},{"lat":54.624986,"lng":-1.114991},{"lat":54.464376,"lng":-0.430485},{"lat":53.325014,"lng":0.184981},{"lat":52.929999,"lng":0.469977},{"lat":52.73952,"lng":1.681531},{"lat":52.099998,"lng":1.559988},{"lat":51.806761,"lng":1.050562},{"lat":51.289428,"lng":1.449865},{"lat":50.765739,"lng":0.550334},{"lat":50.774989,"lng":-0.787517},{"lat":50.500019,"lng":-2.489998},{"lat":50.69688,"lng":-2.956274},{"lat":50.228356,"lng":-3.617448},{"lat":50.341837,"lng":-4.542508},{"lat":49.96,"lng":-5.245023},{"lat":50.159678,"lng":-5.776567},{"lat":51.210001,"lng":-4.30999},{"lat":51.426009,"lng":-3.414851},{"lat":51.426848,"lng":-3.422719},{"lat":51.593466,"lng":-4.984367},{"lat":51.9914,"lng":-5.267296},{"lat":52.301356,"lng":-4.222347},{"lat":52.840005,"lng":-4.770013},{"lat":53.495004,"lng":-4.579999},{"lat":53.404547,"lng":-3.093831},{"lat":53.404441,"lng":-3.09208},{"lat":53.985,"lng":-2.945009},{"lat":54.600937,"lng":-3.614701},{"lat":54.615013,"lng":-3.630005},{"lat":54.790971,"lng":-4.844169},{"lat":55.061601,"lng":-5.082527},{"lat":55.508473,"lng":-4.719112},{"lat":55.783986,"lng":-5.047981},{"lat":55.311146,"lng":-5.586398},{"lat":56.275015,"lng":-5.644999},{"lat":56.78501,"lng":-6.149981},{"lat":57.818848,"lng":-5.786825},{"lat":58.630013,"lng":-5.009999},{"lat":58.550845,"lng":-4.211495},{"lat":58.635,"lng":-3.005005}],
			}
		]
	},
	{
	'author':'teodor',
	'name':'den',
	'gravatarHash':'a0408d1e61bbc0795fee026ddcdbd8a3',
	'description':'Border of the denmark',
	'elements':[
			{
			'type':'polygon',
			'id':'denmark',
			'classes':{
				'country':true,
				'border':true,
				'europeen':true,
			},
			'attributes':{
				'population':5,
				'language':'den',
			},
			'structure':[{"lat":51.345781,"lng":3.314971},{"lat":51.267259,"lng":4.047071},{"lat":51.475024,"lng":4.973991},{"lat":51.037298,"lng":5.606976},{"lat":50.803721,"lng":6.156658},{"lat":50.128052,"lng":6.043073},{"lat":50.090328,"lng":5.782417},{"lat":49.529484,"lng":5.674052},{"lat":49.985373,"lng":4.799222},{"lat":49.907497,"lng":4.286023},{"lat":50.378992,"lng":3.588184},{"lat":50.780363,"lng":3.123252},{"lat":50.796848,"lng":2.658422},{"lat":51.148506,"lng":2.513573},{"lat":51.345781,"lng":3.314971}],
			}
		]
	}
]	
};
		var data=JSON.stringify(dataO);
		this.requestHandler(data);
	},
	requestHandler:function(data){
		var q=JSON.parse(data);
		var res=q.results;
		
		//gather all the classes of each element
		for(var i=0;i<res.length;i++){
			var classes={};
			for(var j=0;j<res[i].elements.length;j++)
				for( var c in res[i].elements[j].classes )
					classes[c]=true;
			res[i].allClasses=classes;
		}
		
		//build the dataMap for each results
		for(var i=0;i<res.length;i++){
			var dm=DataMap.create();
			var dl=DataLayer.create(res[i].name);
			for(var j=0;j<res[i].elements.length;j++){
				var el=res[i].elements[j];
				var de=null;
				switch(el.type){
					case "polygon":
						var points=[];
						for(var k=0;k<el.structure.length;k++)
							points.push( new L.LatLng( el.structure[k].lat,el.structure[k].lng ) );
						var classes=el.classes;
						var attributes=el.attributes;
						var name=el.id;
						de=DataPath.create( points , name , classes , attributes );
					break;
				}
				dl.addElement(de);
			}
			dm.addLayer(dl);
			res[i].datamap=dm;
		}
		
		this.results=res;
		
		var self=this;
		var stock=this._stock;
		stock.children().remove();
		for(var i=0;i<res.length;i++){
			(function(){
				var squarre=$('<div>').addClass('span2').css({'display':'inline-block'}).appendTo(stock);
				$('<span>').wrapInner(res[i].author).addClass('author').appendTo(squarre);
				var j=i;
				squarre.bind('click',function(){
					self.displayResult(res[j]);
				});
			})();
		}
	},
	displayResult:function(r){
		UIState.setResult(r);
	},
});
SearchOrgan.create=function(){
	var so=new SearchOrgan();
	so.init();
	return so;
};


function ElementInfo(){};
extend( ElementInfo , AbstractComponent.prototype );
extend( ElementInfo , {
	result:null,
	uimap:null,
	uistate:null,
	init:function( datamap ){
		
		this.uistate=UIState;
		
		var self=this;
		
		var el=$('<div>').css({'width':'100%','height':'100%'});
		
		$('<span><h2></h2></span>').addClass('name').appendTo(el);
		$('<span><h5></h5></span>').addClass('author').appendTo(el);
		$('<div><a href="http://gravatar.com" target="_blank" ><img></a></div>').addClass('portrait').appendTo(el);
		$('<div>').addClass('map').css({'width':200+'px','height':200+'px'}).appendTo(el);
		$('<div><p></p></div>').addClass('description').appendTo(el);
		$('<div>').addClass('classes-uses').appendTo(el);
		
		var bn=$('<div>').wrapInner('add').addClass('btn').appendTo(el)
		.bind('click',function(){
			if( self.result!= null ){
				cmd.mgr.execute( cmd.addLayer.create( self.result.datamap.getLayers()[0].clone() , datamap ) );
			}
			bn.hide();
		});
		
		this.el=el;
		
		this.initInteraction();
		this.listen(true);
		this.update();
	},
	initInteraction:function(){
		
	},
	update:function(){
		var result=this.uistate.result;
		if( result==this.result )
			return;
		if( result == null ){
			
			
		}else{
			this.el.find('.btn').show();
			this.el.find('.author').children().empty().wrapInner( '@'+result.author );
			this.el.find('.name').children().empty().wrapInner( result.name );
			this.el.find('.description').children().empty().wrapInner( result.description );
			this.el.find('.portrait').find('img').attr('src','http://www.gravatar.com/avatar/'+result.gravatarHash+'?s=60&d=mm');
			var classContainer=this.el.find('.classes-uses');
			classContainer.children().remove();
			for(var c in result.allClasses )
				$('<span>').wrapInner( c ).appendTo(classContainer);
			
			var map=this.el.find('.map');
			if(this.uimap){
				this.uimap.listen(false);
				this.uimap.getElement().remove();
			}
			this.uimap=UIMap.create(result.datamap,map.width(),map.height());
			this.uimap.listen(true);
			this.uimap.getElement().appendTo( map );
			this.uimap.getElement().find('.leaflet-control-attribution').remove();
			this.uimap.uiDataMap.lfe.fitWorld();
			this.uimap.uiDataMap.update();
			this.uimap.uiDataMap.lfe.fitWorld();
			//this.uimap.uiDataMap.lfe.draw();
		}
		this.result=result;
	},
	listen:function(enable){
		
		this.uistate.removeListener('set-result',this);
		if(enable){
			this.uistate.registerListener('set-result',{o:this,f:this.update});
		}else{
		
		}
	},
});
ElementInfo.create=function(datamap){
	var e = new ElementInfo();
	e.init(datamap);
	return e;
}

//exposure
scope.popUp = popUp;
scope.LayerMgr = LayerMgr;
scope.UIMap = UIMap;
scope.TimeLine = TimeLine;
scope.AttributeMgr = AttributeMgr;
scope.PropertyStack = PropertyStack;
scope.PropertyEditor = PropertyEditor;
scope.SearchOrgan = SearchOrgan;
scope.ElementInfo = ElementInfo;
scope.WorldMap = WorldMap2;

})( this );


