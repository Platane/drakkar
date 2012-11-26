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
			
			this.container = $("<div>").addClass( "popUp" );
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
		},
		valid : function(){
			
			this.close();
		},
		close : function(){
			$("#popUpPanel").css( {"z-index" : 100 , "display" : "block" } );
			this.container.remove();
			currentlyDisplayed = null;
		},
		finish : function(){},
		prepare : function(){},
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


function initLayerMgr(){
	
	function updateLayerMgr(){
	
		var liste = $("#layerMgr").find("ul");
		
		// clear the list
		liste.children("li").remove();
		
		// 
		var layers = map.getLayers();
		
		for( var i = 0 ; i < layers.length ; i ++ ){
			
			(function(){
				// create this anonymous scope make the var set persistent
				var j = i;
				var item = $("<li>").attr( "i" , ""+i );
				var bin = $("<span> |_| </span>");
				
				// the name
				$("<span>"+layers[i].name+"</span>").appendTo( item );
				
				
				// bind event on the trash bin
				bin.bind( "click" , function(){
					
					cmd.mgr.execute( cmd.deleteLayer.create( map.getLayer( j ) , map , { f : updateLayerMgr , o : this } ) );
					
				});
				
				// attach the trash bin
				bin.appendTo( item );
				bin.hide();
				
				//bind event on the item
				var over = function(){
					bin.show();
				};
				var out = function(){
					bin.hide();
				};
				item.bind("mouseover", over );
				item.bind("mouseout", out );
				
				// attach the item to the list
				item.appendTo( liste );
				
			})();
		}
	}
	
	updateLayerMgr();
	
	// bind action on tool bn
	// delete all
	$("#layerMgr>.tools").find("#delAllLayerBn").bind( "click" , function(){
		
		var cmds = [];
		
		for( var i = 0 ; i < map.getLayerCount() ; i ++ )
			cmds.push( cmd.deleteLayer.create( map.getLayer( i ) , map ) );
		
		cmd.mgr.execute( cmd.multi.createWithTab( cmds , { f : updateLayerMgr , o : this } )  );
		
	});
	// add
	$("#layerMgr>.tools").find("#addLayerBn").bind( "click" , function(){
		
		popUp.addLayer.create( map , { f : updateLayerMgr , o : this } );
		
	});
	
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
	initLayerMgr();
};

scope.init = init;

})( this );
