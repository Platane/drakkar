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


function UIMap(){};
extend( UIMap , AbstractComponent.prototype );
extend( UIMap , {
	uiDataMap : null,
	init : function( model ){
		
		var w = 500, h = 500;
		
		var el = $("<div>").addClass( "componant" ).attr( "width" , w ).attr( "height" , h ).css( { "width": w , "height": h } ).appendTo( $("body") );
		
		var uiDataMap = LeafletMap.create( model , el[0] );
		uiDataMap.lfe.fitWorld();
		el.detach();
		uiDataMap.update();
		
		this.uiDataMap = uiDataMap;
		this.el = el;
		this.model = model;
		
		window.uiDataMap = uiDataMap;
		
		if( model )
			this.updatetable( true );
		
		this.initInteraction();
		
		
	},
	initInteraction : function(){
		
		var w = 500, h = 500;
	
		var map = this.el;
		
		var self = this;
		
		var sup = $("<div>").css( { "width": w , "height": h , "position" : "absolute" , "display" : "none"  } ).attr( "id" , "mapToolPanel" ).appendTo( map );
		
		// pathTracable
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
			
			var uistate = UIState;
			
				var remove = function( e ){
					console.log(e);
				};
				var start = function( e ){
					drag = true;
					anchorM.x = e.originalEvent.pageX;
					anchorM.y = e.originalEvent.pageY;
					
					anchorE = self.uiDataMap.lfe.project( e.target.getLatLng() );
					
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
						self.uiDataMap.lfe.removeLayer( tmpLayer );
						tmpLayer=null;
					}
					self.uiDataMap.off( "mousemove" , move );
					self.uiDataMap.off( "mouseup" , stop );
					if( !enable || !uistate.elements.length==0 ) // else it would be done latter
						self.uiDataMap.update();
					
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
			
			var update;
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
			
			var elementSelectionnable = function( unable , update_  ){
					
					var uiDataMap=self.uiDataMap,
						dataMap=self.model;
					
					update = update_;
					
					if( unable ){
						var bindAllVisibleLayer = function(){
							var layers=uiDataMap.layers;
							var i=layers.length;
							while(i--){
								layers[i].off( "click" , acte );
								if( !layers[i].hidden )
									layers[i].on( "click" , acte );
							}
							uiDataMap.update();
						}
						bindAllVisibleLayer();
						
						// event need to be rebind ..
						// when a new layer is added or removed
						dataMap.registerListener( "layer-struct" , {o:this,f:bindAllVisibleLayer} );
						//uiDataMap.registerListener( "layer-visibility" , {o:this,f:bindAllVisibleLayer} );
						
						uiDataMap.on( "click" , acte  );
					}else{
						var layers=uiDataMap.layers;
						var i=layers.length;
						while(i--)
							layers[i].off( "click" , acte );
						uiDataMap.off( "click" , acte  );
						dataMap.removeListener( "layer-struct" );
					}
					return scope;
			};	
			scope.elementSelectionnable = elementSelectionnable;
			
		})( this );
		
		// enhanceSelection
		(function( scope ){
			var uiDataMap=self.uiDataMap;
			var dataMap=self.model;
			var enhanceSelection = function( unable  ){
					var currentSelect=[]; // is a UiData
					if( unable ){
						var selectionEnhance = function(){
							// remove class if no longuer selected
							var i=currentSelect.length;
							while(i--){
								var stillIn=false;
								var j=UIState.elements.length;
								while(j--)
									if(currentSelect[i].model==UIState.elements[j])
										stillIn=true;
								if(!stillIn){
									currentSelect[i].model.removeClass( "reserved-selected" );
									currentSelect.splice(i,1);
								}
							}
							// add class
							var j=UIState.elements.length;
							while(j--){
								var i=currentSelect.length;
								var notYetIn=true;
								while(i--)
									if(currentSelect[i].model==UIState.elements[j])
										notYetIn=false;
								if(notYetIn){
									var uielement= uiDataMap.getElement( UIState.elements[j] );
									currentSelect.push( uielement );
									uielement.model.addClass( "reserved-selected" );
								}
							}
						};
						UIState.registerListener( "select-element" , {o:this,f:selectionEnhance} );
						selectionEnhance();
					}else{
						var layers=uiDataMap.layers;
						var i=layers.length;
						while(i--)
							layers[i].off( "click" , acte );
					}
					return scope;
			};	
			scope.enhanceSelection = enhanceSelection;
			
		})( this );
	},
	//wat
	_selection : { 
		on : false,
		layerName : null,
		f : null,
	},
	update : function(){
		
		uiDataMap.update();
		/*
		//flush map
		for(var i in this.lfe._layers)
			this.lfe.removeLayer( this.lfe._layers[i] );
		this.model.draw( this.lfe );
		
		if( this._selection.on )
			// pretty dirty
			for( var i in this.lfe._layers )
				if( this.lfe._layers[i].model.getParent().getName() == this._selection.layerName )
					this.lfe._layers[i].on("mousedown" , this._selection.f );
		*/
	},
	
	pathTraceable : function( unable , update ){return this;},
	pathEditable : function( unable , points , update ){return this;},
	pathNodeRemovable : function( unable , points , update ){return this;},
	pathNodeAddable : function( unable , points , update ){return this;},
	pathSelectionnable : function( unable , update ){return this;},
	elementSelectionnable : function( unable , update ){return this;},
	enhanceSelection : function( unable ){return this;},
});
UIMap.create = function( leafletElement , id ){
	var m = new UIMap();
	m.init( leafletElement , id );
	return m;
}

function AttributeMgr(){};
extend( AttributeMgr , {
	el : null,
	uistate : null,
	init : function(uistate){
		this.uistate=uistate;
		
		var el=$("<div></div>");
		$('<div id="class"></div>').appendTo(el);
		
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
AttributeMgr.create=function(uistate){
	var a = new AttributeMgr();
	a.init(uistate);
	return a;
};

function LayerMgr(){};
LayerMgr.prototype = {
	
	el : null,
	map : null,
	selected : 0,
	_layerDeletable : false,
	_layerAddable : false,
	_layerSelectionable : false,
	
	_updateDeletable : false,
	_updateAddable : false,
	_updateSelectionable : false,
	
	init : function( map  ){
		
		this.map = map;
		
		
		// create the element
		var el = $("<div>").addClass( "block" ) 
		
		$("<ul>").appendTo( el );
		$("<div>").addClass("toolBox").appendTo( el );
		
		
		this.el = el;
		
		this.update();
	},
	getElement : function(){
		return this.el;
	},
	update : function(){
		
		var el = this.el;
		
		var liste = el.find("ul");
		
		// clear the list
		liste.children("li").remove();
		
		// 
		var layers = this.map.getLayers();
		
		var self = this;
		
		for( var i = 0 ; i < layers.length ; i ++ )
			(function(){
				// create this anonymous scope make the var set persistent
				var j = i;
				var item = $("<li>").attr( "i" , ""+i );
				var bin;
				
				// the name
				$("<span>"+layers[i].getName()+"</span>").appendTo( item );
				
				//add a trash bin button
				if( self._layerDeletable ){
					var bin = $("<span> |_| </span>");
					bin.bind( "click" , function(){
						cmd.mgr.execute( 
						cmd.multi.createWithTab( [ 
							cmd.deleteLayer.create( j , self.map ),
							cmd.changeCurrentLayer.create( j-1 , self )
							],
							{ f : function(){ 
							if( self._updateDeletable ) 
								self._updateDeletable.f.call( self._updateDeletable.o );
							if( self._updateSelectionable ) 
								self._updateSelectionable.f.call( self._updateSelectionable.o );
							self.map.notify();
							}, o : self } ) );	
					});
					bin.appendTo( item );
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
						if( UIState.layer == j)
							return;
						liste.find("li").removeClass( "selected" );		// scope conflict
						item.addClass( "selected" );
						cmd.mgr.execute( cmd.changeCurrentLayer.create( j , state ) );
							
					});
					
					if( j == state.currentLayerSelected )
						item.addClass( "selected" );
				}
				
				
				// attach the item to the list
				item.appendTo( liste );
				
			})();
	},
		
	
	//property
	layerDeletable : function( unable , update ){
		if( unable ){
			
			$( "#delAllLayerBn" ).remove();
			
			var self = this;
			
			var bnDeletall = $("<div>").attr("id" , "delAllLayerBn" ).addClass( "btn icon-btn" ).attr("name" , "delete all" ).appendTo( this.el.find(".toolBox" ) ).bind( "click" , function(){
				
				var cmds = [];
				
				cmds.push( cmd.changeCurrentLayer.create( self.selected  , self ) );
				var layers = self.map.getLayers();
				for( var i = 0 ; i < layers.length ; i ++ )
					cmds.push( cmd.deleteLayer.create( layers[ i ] , self.map ) );
				
				
				
				cmd.mgr.execute( cmd.multi.createWithTab( cmds , { f : function(){ 
							if( self._updateDeletable ) 
								self._updateDeletable.f.call( self._updateDeletable.o );
							self.map.notify 
							}, o : self } ) );
				
			});
			bnDeletall[ 0 ].innerHTML = "del All";
			
			
			this._layerDeletable = true;
			this._updateDeletable = update;
			
			this.update();
			
		} else {
			
			$( "#delAllLayerBn" ).remove();
			
			this._layerDeletable = false;
			
			this.update();
			
		}
		return this;
	},
	layerAddable : function( unable , update ){
		if( unable ){
			$( "#addLayerBn" ).remove();
			var self = this;
			var bn = $("<div>").attr("id" , "addLayerBn" ).addClass( "btn icon-btn" ).attr("name" , "new" ).appendTo( this.el.find(".toolBox" ) ).bind( "click" , function(){
				popUp.addLayer.create( self.map , { f : function(){ 
							if( self._updateAddable ) 
								self._updateAddable.f.call( self._updateAddable.o );
							self.map.notify(); 
							}, o : self } );
				
				//popUp.addLayer.create( self.map , { f : self.map.notify , o : self.map } );
			});
			bn[ 0 ].innerHTML = "new";
			
			this._layerAddable = true;
			this._updateAddable = update;
		} else {
			$( "#addLayerBn" ).remove();
			this._layerAddable = false;
		}
		return this;
	},
	layerSelectionable : function( unable , update ){
		if( unable ){
			
			this._layerSelectionable = true;
			this._updateSelectionable = update;
			
			this.update();
			
		} else {
			
			this._layerSelectionable = false;
			
			this.update();
		}
		return this;
	},

}
LayerMgr.create = function( map ){
	var lm = new LayerMgr();
	lm.init( map );
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
	init : function( id ){
		
		
		this.dateEnd = this._Date2FloatYear( new Date() );
		this.dateStart = this.dateEnd - 50;
		this.bandStart = this.dateEnd - 100;
		this.bandEnd = this.dateEnd;
		
		var w = 500, h = 150;
		
		var el = $("<div>").addClass( "block" ).addClass("timeLine").attr( "width" , w ).attr( "height" , h ).css( { "width": w , "height": h } );
		
		if( id )
			el.attr( "id" , id );
			
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
		
		//editable
		(function( scope , update ){
			
			
			var updateExt;
			var dragS = false;
			var dragE = false;
			
			var startS = function(){
				dragS = true;
			}
			var moveS = function( e ){
				if( !dragS )
					return;
				
				var lban_p = scope.el.width(),
					sban_d = scope.bandStart ,
					lban_d = scope.bandEnd  - sban_d; 
				
				var x = e.pageX - scope.el.position().left;
				
				scope.dateStart = sban_d + x / lban_p * lban_d;
				
				if( scope.dateStart > scope.dateEnd )
					scope.dateStart = scope.dateEnd;
				
				if( scope.dateStart < scope.bandStart )
					scope.dateStart = scope.bandStart;
				
				scope.update();
				if( updateExt )
					updateExt.f.call( updateExt.o );
			}
			var endS = function( e ){
				if( !dragS )
					return;
				dragS = false;
			}
			
			
			
			var startE = function(){
				dragE = true;
			}
			var moveE = function( e ){
				if( !dragE )
					return;
				
				var lban_p = scope.el.width(),
					sban_d = scope.bandStart ,
					lban_d = scope.bandEnd  - sban_d; 
				
				var x = e.pageX - scope.el.position().left;
				
				scope.dateEnd = sban_d + x / lban_p * lban_d;
				
				if( scope.dateEnd < scope.dateStart )
					scope.dateEnd = scope.dateStart;
				
				if( scope.dateEnd > scope.bandEnd )
					scope.dateEnd = scope.bandEnd;
				
				scope.update();
				if( updateExt )
					updateExt.f.call( updateExt.o );
			}
			var endE = function( e ){
				if( !dragE )
					return;
				dragE = false;
			}
			
			
			var makeMeEditable = function( enable , updateExt_ ){
				
				updateExt = updateExt_;
				
				if( enable ){
					var dotStart = scope.el.find("#dotStart"),
						dotEnd = scope.el.find("#dotEnd");
					
					dotStart.unbind( "mousedown" , startS ).bind( "mousedown" , startS );
					$("body").unbind( "mousemove" , moveS ).bind( "mousemove" , moveS );
					$("body").unbind( "mouseup" , moveS ).bind( "mouseup" , endS );
					
					dotEnd.unbind( "mousedown" , startE ).bind( "mousedown" , startE );
					$("body").unbind( "mousemove" , moveE ).bind( "mousemove" , moveE );
					$("body").unbind( "mouseup" , moveE ).bind( "mouseup" , endE );
				}else{
					var dotStart = scope.el.find("#dotStart"),
						dotEnd = scope.el.find("#dotEnd");
					
					dotStart.unbind( "mousedown" , startS );
					$("body").unbind( "mousemove" , moveS );
					$("body").unbind( "mouseup" , moveS );
					
					dotEnd.unbind( "mousedown" , startE );
					$("body").unbind( "mousemove" , moveE );
					$("body").unbind( "mouseup" , moveE );
				}
				return scope;
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
	
	editable : function( unable , update ){},
} );
TimeLine.create = function(  id ){
	var lm = new TimeLine();
	lm.init(  id );
	return lm;
}


function PropertyEditor(){};
extend( PropertyEditor , AbstractComponent.prototype );
extend( PropertyEditor , {
	properties:null,
	onglet:null,
	_changeAlreadyDone:false,
	init : function(){
		
		var w = 500, h = 500;
		
		var el = $("<div>").attr("id","property-editor").addClass( "componant" ).attr( "width" , w ).attr( "height" , h ).css( { "width": w , "height": h } ).appendTo( $("body") );
		
		var main = $("<div>").addClass("main");
		
		
		var onglet_render = $("<div>");
		
		$("<div>").addClass("preview").css({"border-radius":"10px" , "min-width":"120px" , "min-height":"120px" , "max-width":"200px" , "max-height":"200px" }).appendTo( onglet_render );
		var toolBox=$("<div></div>").addClass("tool-box").appendTo( onglet_render );
		$("<div></div>").wrapInner("stroke").addClass("btn icon-btn").attr("data-action" , "stroke" ).appendTo(toolBox);
		$("<div></div>").wrapInner("fill").addClass("btn icon-btn").attr("data-action" , "fill" ).appendTo(toolBox);
		$("<div></div>").wrapInner("nothing").addClass("btn icon-btn").attr("data-action" , "" ).appendTo(toolBox);
		$("<div></div>").appendTo( onglet_render );
		$("<canvas>").appendTo( onglet_render.find(".preview") );
		
		var onglet_action = $("<div>");
		
		this.onglet={};
		this.onglet.render = onglet_render;
		this.onglet.action = onglet_action;
		
		var menu = $("<nav>").addClass("menu");
		$("<ul>").appendTo( menu );
		var self=this;
		for( var i in this.onglet )
			(function(){
				var j=i;
				var bn = $("<li>");
				bn.wrapInner( i );
				bn.bind("click",function(){
					main.children().detach();
					self.onglet[j].appendTo(main);
				});
				bn.appendTo( menu.children("ul") );
				bn.click();
			})();
		
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
			
			
			var w=170,h=170;
			
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
				if(contenu.hasClass("visible"))
					contenu.removeClass("visible").addClass("hidden");
				else
					contenu.addClass("visible").removeClass("hidden");
			});
			
			return box;
		};
		var createRangeProp=function(name,propName,f,f_){
			var ex=properties[propName];
			if(f)
				ex=f_(ex);
			var prop = $('<tr data-propName="'+propName+'" data-type="range"><td><span class="property-name">'+name+'</span></td><td><span>:</span></td><td><input max="1000" class="property-value" type="range"></input></td></tr>');
			var down = false;
			var goEdit=function(){
				var nDec=cloneDeclaration(UIState.declaration);
				var v=prop.find("input.property-value").val()/1000;
				if(f)
					v=f(v);
				nDec.props[propName]=v;
				setDeclaration( nDec );
				$("body").unbind("mouseup",goEdit);
				down=false;
			};
			prop.find("input.property-value").val(ex*1000);
			prop.find("input.property-value").bind("change",function(e){
				if(down==false){
					down=true;
					$("body").bind("mouseup",goEdit);
				}
			});
			
			return prop;
		}
		var createColorProp=function(name,propName){
			var ex=properties[propName];
			var prop = $('<tr data-propName="'+propName+'" data-type="range"><td><span class="property-name">'+name+'</span></td><td><span>:</span></td><td><div class="property-value" style="width:100px;height:30px;background-color:'+ex+';"></div></td></tr>');
			var down = false;
			prop.find("div.property-value").ColorPicker({"eventName":"click","color":ex,
				"onSubmit":function(hsb, hex, rgb, el){
					var nDec=cloneDeclaration(UIState.declaration);
					nDec.props[propName]="#"+hex;
					setDeclaration( nDec );
				},
				"onChange":function(hsb, hex, rgb, el){
					prop.find("div.property-value").css({"background-color":"#"+hex});
				},
			});
			var goEdit=function(){
				var nDec=cloneDeclaration(UIState.declaration);
				nDec.props[propName]=prop.find("input.property-value").val()/1000;
				setDeclaration( nDec );
				$("body").unbind("mouseup",goEdit);
				down=false;
			};
			
			prop.find("input.property-value").bind("change",function(e){
				if(down==false){
					down=true;
					$("body").bind("mouseup",goEdit);
				}
			});
			
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


var SmartTextInput=function(){}
SmartTextInput.uid=0;
SmartTextInput.prototype={
	el:null,
	init:function(_accepte,_complete){
		var sp=$('<span></span>');
		
		var edit=function(e){
			var target=$(e.target);
			var exText = target.text().trim();
			var empty = exText==""||exText=="+";
			var dataList=null;
			var input=null;
			
			var complete=function(){
				var value=input.val();
				var options
				if( !_complete )
					return;
				options=_complete.f.call( _complete.o , value , target );
				if( !dataList )
					return;
				dataList.children().remove();
				if( !options||options.length == 0)
					return;
				for( var i=0;i<options.length;i++)
					$('<option>').wrapInner(options[i]).appendTo(dataList);
			};
			var accepte=function(){
					
					var value=input.val();
					
					
					input.unbind("keyup",keyupHandler);
					if( _accepte )
						value = _accepte.f.call( _accepte.o , exText , value , target );
						
					target.empty();
					if( value != null ){
						target.wrapInner(value);
						target.insertBefore(input);
					}
					input.remove();
					if( dataList )
						dataList.remove();
					
			};
			var keyupHandler =function(e){
				if(event.which==13){
					event.preventDefault();
					accepte();
					return;
				}
				complete();
			};
			input=$('<input type="text" style="min-width:20px;" value="'+(empty?'':exText)+'" ></input>').insertBefore(target).bind("focusout",accepte).focus();
			if( _complete != null ){
					var id="dataList"+(SmartTextInput.uid++)
					dataList=$('<datalist ></datalist>').attr("id",id).insertBefore(target);
					input.attr("list",id);
			}
			input.bind("keyup",keyupHandler);
			target.detach();
		};
		
		sp.bind("click",edit);
		this.el=sp;
	},
}
SmartTextInput.create=function( accepte , complete ){
	var a=new SmartTextInput();
	var accepte=(!accepte||accepte.f)?accepte:{f:accepte,o:this};
	var complete=(!complete||complete.f)?complete:{f:complete,o:this};
	a.init(accepte,complete);
	return a.el;
};

function PropertyStack(){};
extend( PropertyStack , AbstractComponent.prototype );
extend( PropertyStack , {
	el:null,
	commonElement:null,
	styleChain:null,		// displayed styleChain
	styleChainCommon:null,	// styleChain of the common element, only use in full mode
	_editable:false,
	_full:false,
	init : function(){
		
		var w = 500, h = 500;
		
		var el = $("<div>").addClass( "componant" ).attr( "width" , w ).attr( "height" , h ).css( { "width": w , "height": h } ).appendTo( $("body") );
		
		var self=this;
		
		var tb=$("<div>").addClass("tool-box").appendTo(el);
		$('<input type="checkbox" checked="checked"></input><span>display all</span>').appendTo(tb).bind("change",function(e){
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
			var accepte=function(ex,ne,el){
				el.removeClass( cond(ex) ).addClass( cond(ne) );
				
				if( ne=="")
					return null;
					
				if( ex=="" || ex=="+" )
					SmartTextInput.create(accepte,complete).wrapInner("&nbsp;&nbsp;+&nbsp;&nbsp;").addClass("css-condition").appendTo(contenu.find(".css-selector"));
				
				return ne;
			};
			var complete=function(v,el){
					
					
			};
			
			var computeCommonSelector=function(){
				var sp=$('<span>').addClass("css-selector");
				if( self.commonElement ){	
					if( self.commonElement.type )
						SmartTextInput.create(accepte,complete).wrapInner(self.commonElement.type).addClass("css-condition").addClass("css-tag").appendTo(sp);
					if( self.commonElement.id )
						SmartTextInput.create(accepte,complete).wrapInner("#"+self.commonElement.id).addClass("css-condition").addClass("css-id").appendTo(sp);
					for( var i in self.commonElement._classes )
						SmartTextInput.create(accepte,complete).wrapInner("."+i).addClass("css-condition").addClass("css-class").appendTo(sp);
				}
				SmartTextInput.create(accepte,complete).wrapInner("&nbsp;&nbsp;+&nbsp;&nbsp;").addClass("css-condition").appendTo(sp);
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
		//$("<span>generated from selection:</span>")
		
		
		$("<div>").attr("id","property-stack").appendTo(el);
		
		this.el = el;
		this.commonElement={};
		this.initInteraction();
		this.listen(true);
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
			var displayEditorPanel=function(){
				var dec = uistate.declaration;
				
				if(dec==null){
					propertyEditor.getElement().css({"display" : "none","top":"0px"});
					return;
				}
				propertyEditor.getElement().css({"display" : "block"});
				self.el.find(".css-declaration").each(function(){
					var e=$(this);
					if( e.data("structure") == uistate.declaration ){
						var y = e.position().top-25;
						var x= self.el.position().left+self.el.width()/1.2;
						propertyEditor.getElement().css({"top":y+"px" , "left":x+"px"});
					}
				});
			}

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
	update:function(){
		var ps = this.el.find( "#property-stack" );
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
		//TODO add blank lines
		
		
		//bind event
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
						var newDeclaration=target.parents(".css-declaration").text().replace( new RegExp( "\xA0" , "g" ) , "" );
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
	easyEditable:function(enable){return this;},
	editable:function(enable){return this;},
	full:function(enable){return this;},
});
PropertyStack.create=function(){
	var a = new PropertyStack();
	a.init();
	return a;
};


function EditablePathParam(){};
extend( EditablePathParam , AbstractComponent.prototype );
extend( EditablePathParam , {
	mapUI:null,
	element:null,
	init : function( model , mapUI ){
		
		var el = $("<div>").addClass( "block" );
		
		var self = this;
		
		$('<div id="editPathBn" class="btn icon-btn" >edit</div>').bind("click",function(){
			self.pathEditable(true);
		}).appendTo( el );
		$('<div id="removeNodePathBn" class="btn icon-btn" >rm</div>').bind("click",function(){
			self.pathNodeRemovable(true);
		}).appendTo( el );
		$('<div id="addNodePathBn" class="btn icon-btn" >add</div>').bind("click",function(){
			self.pathNodeAddable(true);
		}).appendTo( el );
		
		this.el = el;
		this.model = model;
		this.mapUI = mapUI;
		
	},
	pathNodeAddable : function( unable , update ){
		this.el.find("#editPathBn").removeClass( "active" );
		this.el.find("#removeNodePathBn").removeClass( "active" );
		this.el.find("#addNodePathBn").addClass( "active" );
		this.mapUI.pathTraceable(false).pathEditable(false).pathNodeRemovable(false).pathNodeAddable(true,element,update);
	},
	pathEditable : function( unable  , update ){
		this.el.find("#editPathBn").addClass( "active" );
		this.el.find("#removeNodePathBn").removeClass( "active" );
		this.el.find("#addNodePathBn").removeClass( "active" );
		this.mapUI.pathTraceable(false).pathEditable(true,element,update).pathNodeRemovable(false).pathNodeAddable(false);
	},
	pathNodeRemovable : function( unable , update ){
		this.el.find("#editPathBn").removeClass( "active" );
		this.el.find("#removeNodePathBn").addClass( "active" );
		this.el.find("#addNodePathBn").removeClass( "active" );
		this.mapUI.pathTraceable(false).pathEditable(false).pathNodeRemovable(true,element,update).pathNodeAddable(false);
	},
	
	update:function(){
	
	},
} );
EditablePathParam.create = function( model , mapUI ){
	var lm = new EditablePathParam();
	lm.init(  model , mapUI );
	return lm;
}


function EditionToolBar(){};
extend( EditionToolBar , AbstractComponent.prototype );
extend( EditionToolBar , {
	mapUI:null,
	element:null,
	init : function( model , mapUI ){
		
		var el = $("<div>").addClass( "block" );
		
		var self = this;
		
		$('<div id="tracePathBn" class="btn icon-btn" >trace path</div>').bind("click",function(){
			self.pathTraceable(true);
		}).appendTo( el );
		
		$('<div id="selectionPathBn" class="btn icon-btn" >edit path</div>').bind("click",function(){
			self.pathSelectionnable(true);
		}).appendTo( el );
		
		this.el = el;
		this.model = model;
		this.mapUI = mapUI;
		
	},
	pathTraceable : function( unable , update ){
		this.el.find(".btn").removeClass( "active" );
		this.el.find("#tracePathBn").addClass( "active" );
		this.mapUI.pathEditable(false).pathNodeRemovable(false).pathNodeAddable(false).pathTraceable(true,{f:this.pathEditable,o:this});
	},
	pathSelectionnable : function( unable , update ){
		this.el.find(".btn").removeClass( "active" );
		this.el.find("#selectionPathBn").addClass( "active" );
		this.mapUI.pathEditable(false).pathNodeRemovable(false).pathNodeAddable(false).pathTraceable(false).pathSelectionnable(true,{f:this.pathEditable,o:this});
	},
	
	update:function(){
	
	},
} );
EditionToolBar.create = function( model , mapUI ){
	var lm = new EditionToolBar();
	lm.init(  model , mapUI );
	return lm;
}


//exposure
scope.state = state;
scope.popUp = popUp;
scope.LayerMgr = LayerMgr;
scope.UIMap = UIMap;
scope.TimeLine = TimeLine;
scope.EditablePathParam = EditablePathParam;
scope.EditionToolBar = EditionToolBar;
scope.AttributeMgr = AttributeMgr;
scope.PropertyStack = PropertyStack;
scope.PropertyEditor = PropertyEditor;


scope.SmartTextInput = SmartTextInput;
})( this );

//window.onload = function(){ init(); }
