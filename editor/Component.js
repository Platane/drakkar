var extend = function( child , f ){
	for( var p in f )
		child.prototype[ p ] = f[ p ];
	if( !child.prototype.superDad )
		child.prototype.superDad = f;
};

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
							cmd.mgr.execute( cmd.addLayer.create(  Layer.createLayer( name[0].value , description[0].value , type[0].value   ) , self._map , self._update )  );
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
	els : null,
	init : function( id ){
		
	},
	getElement : function(){
		return this.el;
	},
	resize : function(){
		// reajuste la taille du composant en fonction de la taille de son parent
	},
}
function Map(){};
Map.prototype = {
	el : null,
	lfe : null,
	getElement : function(){
		return this.el;
	},
	init : function( lfe , id ){
		this.lfe = lfe;
		
		var w = 500, h = 500;
		
		var el = $("<div>").addClass( "block" ).attr( "width" , w ).attr( "height" , h ).css( { "width": w , "height": h } )
		
		if( id )
			el.attr( "id" , id );
		
		if( lfe )
			lfe.appendTo( el );
			
		this.el = el;
		
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
					
				var start = function( e ){
					drag = true;
					anchorM.x = e.pageX;
					anchorM.y = e.pageY;
					anchorE.x = parseInt( $(e.target).attr( "cx" ) );
					anchorE.y = parseInt( $(e.target).attr( "cy" ) );
					selected = $(e.target);
				};
				var move = function( e ){
					if( !drag )
						return;
					
					var x = anchorE.x + ( e.pageX - anchorM.x ),
						y = anchorE.y + ( e.pageY - anchorM.y );
					
					selected.attr( "cx" , x ).attr( "cy" , y );
					
					var i = selected.attr( "data-i" );
					
					points[ i ].x = x;
					points[ i ].y = y;
					
					sup.find("svg").find('line[data-1='+i+']').attr( "x1" , x ).attr( "y1" , y );
					sup.find("svg").find('line[data-2='+i+']').attr( "x2" , x ).attr( "y2" , y );
				};
				var stop = function( e ){
					if( !drag )
						return;
					drag = false;
				}			
				var update = function(){
					
					sup.find("svg").find("circle").unbind( "mousedown" , start );
					
					sup.find("svg").children().remove();
					
					for( var i = 0 ; i < points.length ; i ++ ){
						var j = ( i+1 )% points.length;
						$('<line style="stroke:#000000;stroke-width:1px">').attr( "data-1" , i ).attr( "data-2" , j ).attr( "x1" , points[ i ].x ).attr( "x2" , points[ j ].x ).attr( "y1" , points[ i ].y ).attr( "y2" , points[ j ].y ).appendTo( sup.find("svg") );
						$('<circle>').attr( "data-i" , i ).attr( "cx" , points[ i ].x ).attr( "cy" , points[ i ].y ).attr( "r" , 5 ).appendTo( sup.find("svg") );
					}
						
					var h = sup[ 0 ].innerHTML; 
					sup[ 0 ].innerHTML = "";
					sup[ 0 ].innerHTML = h;
						
					sup.find("svg").find("circle").unbind( "mousedown" , start ).bind( "mousedown" , start );
					
				}
				
				var pathEditable = function( unable , points_ , update_ , paramPanel ){
					if( unable ){
						
						if( paramPanel ){
							
						};
						
						points = points_
						
						sup.css( { "display" : "block" } );
						
						$('<svg id="supMapLayer" xmlns="http://www.w3.org/2000/svg" version="1.1">').attr( "width" , w ).attr( "height" , h ).css( { "position" : "absolute" , "width" : w+"px" , "height" : h+"px" } ).appendTo( sup );
						
						update();
						
						sup.find("svg").unbind( "mousemove" , move ).bind( "mousemove" , move );
						sup.find("svg").unbind( "mouseup" , stop ).bind( "mouseup" , stop );
					
					}else{
						
						sup.css( { "display" : "none" } );
						
						sup.find("svg").find("circle").unbind( "mousedown" , start );
						sup.find("svg").unbind( "mousemove" , move );
						sup.find("svg").unbind( "mouseup" , stop );
						
						sup.find("svg").remove();
						
					}
					return scope;
				};
			
			scope.pathEditable = pathEditable;
			
		})( this );
	},
	
	pathTraceable : function( unable , update , paramPanel ){},
	pathEditable : function( unable , points , update , paramPanel ){},
}
Map.create = function( leafletElement , id ){
	var m = new Map();
	m.init( leafletElement , id );
	return m;
}


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
	
	init : function( map , id ){
		
		this.map = map;
		
		
		// create the element
		var el = $("<div>").addClass( "block" ) 
		
		if( id )
			el.attr( "id" , id );
			
			
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
				$("<span>"+layers[i].name+"</span>").appendTo( item );
				
				//add a trash bin button
				if( self._layerDeletable ){
					var bin = $("<span> |_| </span>");
					bin.bind( "click" , function(){
						cmd.mgr.execute( 
						cmd.multi.createWithTab( [ 
							cmd.deleteLayer.create( map.getLayer( j ) , map ),
							cmd.changeCurrentLayer.create( j-1 , self )
							],
							{ f : function(){ 
							if( self._updateDeletable ) 
								self._updateDeletable.f.call( self._updateDeletable.o );
							if( self._updateSelectionable ) 
								self._updateSelectionable.f.call( self._updateSelectionable.o );
							self.update();
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
						liste.find("li").removeClass( "selected" );		// scope conflict
						item.addClass( "selected" );
						cmd.mgr.execute( cmd.changeCurrentLayer.create( j , self ,{ f : function(){ 
							if( self._updateSelectionable ) 
								self._updateSelectionable.f.call( self._updateSelectionable.o );
							self.update();
							}, o : self } ) );	
							
					});
					
					if( j == self.selected )
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
				
				for( var i = 0 ; i < map.getLayerCount() ; i ++ )
					cmds.push( cmd.deleteLayer.create( map.getLayer( i ) , map ) );
				
				
				
				cmd.mgr.execute( cmd.multi.createWithTab( cmds , { f : function(){ 
							if( self._updateDeletable ) 
								self._updateDeletable.f.call( self._updateDeletable.o );
							self.update();
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
			
			$( "addLayerBn" ).remove();
			
			var self = this;
			
			var bn = $("<div>").attr("id" , "addLayerBn" ).addClass( "btn icon-btn" ).attr("name" , "new" ).appendTo( this.el.find(".toolBox" ) ).bind( "click" , function(){
				
				popUp.addLayer.create( map , { f : function(){ 
							if( self._updateAddable ) 
								self._updateAddable.f.call( self._updateAddable.o );
							self.update();
							}, o : self } );
				
			});
			bn[ 0 ].innerHTML = "new";
			
			
			this._layerAddable = true;
			this._updateAddable = update;
			
			this.update();
			
		} else {
			
			$( "addLayerBn" ).remove();
			
			this._layerAddable = false;
			
			this.update();
			
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
LayerMgr.create = function( map , id ){
	var lm = new LayerMgr();
	lm.init( map , id );
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
	zoom : 2, 	// on pixel per year
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


scope.popUp = popUp;
scope.LayerMgr = LayerMgr;
scope.MapPanel = Map;
scope.TimeLine = TimeLine;

})( this );

//window.onload = function(){ init(); }
