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

function initEditableToolBox(){
	
	
	
};

function initMenuAction(){
	var menuBn = $(".menu").find( "li" );
	
	menuBn.each( function(){
		var bn = $(this);
		
		bn.bind( "click" , function( e ){
			
			swapFrame( bn.attr( "data-frame" ) );
			
		});
	});
};

function init(){
	initMenuAction();
	
	var map = MapPanel.create( null , "block-Map" )
	map.getElement().appendTo( $(".container") );
	
	var lm = LayerMgr.create( map , "block-layerMgr" ).layerDeletable( true ).layerSelectionable( true ).layerAddable( true );
	lm.getElement().appendTo( $(".container") );
	
	$("#tracePathBn").bind( "click" , function(){
		map.pathTraceable( true );
	});
	$("#editPathBn").bind( "click" , function(){
		map.pathEditable( true , [ { x : 50 , y : 50 } , { x : 50 , y : 150 } , { x : 150 , y : 50 } ] );
	});
};

scope.init = init;

})( this );

//window.onload = function(){ init(); }
