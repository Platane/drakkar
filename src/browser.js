

// Data
var frameNavigator = new (Backbone.Model.extend({
	defaults: function() {
      return {
        frame:"header",
      };
    },
	goto:null,
	setFrame:function(f) {
		this.set({'frame':f});
		this.trigger('goto');
	},
	instanciate:function(){},
	
}))();
frameNavigator.goto=frameNavigator.setFrame; // alias



// dependancy
if(!window.requestAnimFrame)
	window.requestAnimFrame=(function(callback){
			return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback){
				window.setTimeout(callback, 1000 / 60 );
			};
	})();

var Scrollor = function( model , flow ){
	this.model=model;
	this.flow=flow;
	this.model.on( 'goto' , this.changeFrame ,this );
};
Scrollor.prototype={
	power:0.38,		//% of window height
	wait:400,		//ms
	delay:1800,		//ms
	model:null,
	flow:null,
	timeout:null,
	predictat:null,	// if the animation is running, should be the next scollY value, ( if its not that probably an user action )
	changeFrame:function(){
		var id='frame-'+this.model.get('frame');
		var frame=this.flow.find('#'+id );
		
		
		this.to=frame.offset().top;
		this.from=window.scrollY;
		this.fromT=(new Date()).getTime();
		this.delay=Math.min( Math.abs(this.from-this.to)*1.5 , 800 );
		this.run=true;
		this.animate();
	},
	scheduleToCheckScroll:function(){
		if( window.scrollY==this.predictat )	// taht the animation going
			return;
		this.run=false;
		window.clearTimeout(this.timeout);
		this.timeout=window.setTimeout($.proxy(function(){
			if(this.down)
				$("body").one('mouseup.magnetism.release mouseenter.magnetism.release',$.proxy(this.checkScroll,this));
			else
				this.checkScroll();
		},this),this.wait);
	},
	from:null,
	to:null,
	fromT:null,
	run:false,
	ease:function(x){
		return 1/( 1 + (1-x)*(1-x)/(x*x) );
	},
	animate:function(){
		if(!this.run)
			return;
		var t=(new Date()).getTime()-this.fromT;
		var sc;
		if( t > this.delay ){
			sc=this.to;
			this.run=false;
		}else{
			var alpha=this.ease( t/this.delay );
			sc=alpha*this.to+(1-alpha)*this.from;
		}
		sc=Math.round(sc);
		if( Math.abs(window-sc) == 100 )		//tricks, assuming one mouse wheel make the scroll +/- 100 px, we dont want to miss a wheel event because
			sc+=1;
		this.predictat=sc;
		window.scrollTo(0,sc);
		
		if( this.run )
			window.requestAnimFrame($.proxy(this.animate,this));
	},
	checkScroll:function(){
		if( this.timeout )
			window.clearTimeout(this.timeout);
		var power = Math.min( 200, window.innerHeight * this.power );
		$(".frame").each(function(){
			var f=$(this);
			if( f.hasClass('hidden') || f.attr('id') == "frame-header" || f.attr('id') == "frame-footer" )
				return;
			if( Math.abs( f.position().top + window.innerHeight*0.04 - window.scrollY ) < power ){
				var frame=f.attr('id').substr(6);
				frameNavigator.setFrame(frame);
			}
		});
	},
	mousedown:function(e){
		this.down=true;
	},
	mouseup:function(e){
		this.down=false;
	},
	unableMagnetism:function(unable){
		if( unable ){
			$(document).off('scroll.magnetism').on('scroll.magnetism',$.proxy(this.scheduleToCheckScroll,this) )
			.off('mousedown.magnetism').on('mousedown.magnetism',$.proxy(this.mousedown,this) )
			.off('mouseenter.magnetism mouseup.magnetism').on('mouseenter.magnetism mouseup.magnetism',$.proxy(this.mouseup,this) );
			this.checkScroll();
		}else
			$(document).off('scroll.magnetism')
			.off('mousedown.magnetism')
			.off('mouseenter.magnetism mouseup.magnetism');
	},
}
$(document).ready(function(){
	var sc = new Scrollor( frameNavigator , $('#flow') );
	
	var nav=$('nav#frame-navigator');
	nav.find('[data-action=goto-search]').on('click',function(){ frameNavigator.setFrame('search'); } );
	nav.find('[data-action=goto-data]').on('click',function(){ frameNavigator.setFrame('data'); } );
	nav.find('[data-action=goto-presentation]').on('click',function(){ frameNavigator.setFrame('presentation'); } );
	nav.find('[data-action=goto-decoration]').on('click',function(){ frameNavigator.setFrame('decoration'); } );
	
	nav.find('[type=checkbox]').on('change',function(e){ sc.unableMagnetism( $(e.target).is(':checked') ); } )
	.change();
});



var ParallaxMgr = function(){
	
	this.init();
	this.initsvg();
	
	$(document).on('scroll.parallax',$.proxy(this.scroll,this) );
	this.scroll();
};
ParallaxMgr.prototype={
	layers:null,
	path:null,
	svglayer:null,
	init:function(){
		var pool = $('#background-pool');
		
		var sceneHeight=document.height;
		var windowHeight=window.innerHeight;
		
		var layers=[];
		pool.children('.flat').each(function(e){
			
			var $el=$(this);
			var deep=$el.attr('data-deep') || 0.8;
			var height= ( sceneHeight - windowHeight )*deep + windowHeight;
			
			var marge=1000;
			
			$el.css({
				'background-position' : 'center 0',
				'height' : (marge+height)+'px',
				'position':'fixed',
				'width':'100%',
			});
			
			layers.push({ deep:deep , $el:$el }); 
			
		});
		
		this.layers=layers;
	},
	scroll:function(){
		var i=this.layers.length;
		var y=window.scrollY;
		while(i--){
			var $el=this.layers[i].$el;
			var deep=this.layers[i].deep;
			
			$el.css({'top': (-y*deep)+'px' }); 
		}
		this.scrollsvg();
	},
	initsvg:function(){
		var svg=$('#background-pool').find('svg');
		var sceneHeight=document.height;
		var windowHeight=window.innerHeight;
		
		var $el=$(this);
		var deep=$el.attr('data-deep') || 0.8;
		var height= ( sceneHeight - windowHeight )*deep + windowHeight;
		
		var marge=1000;
			
		$el.css({
			'height' : (marge+height)+'px',
			'position':'fixed',
			'width':'500px',
		});
		this.svglayer={ deep:deep , $el:$el };
	},
	scrollsvg:function(){
	
	},
};
$(document).ready(function(){
	new ParallaxMgr();
});

// hint displayer


var hintdisplayer = {
	alert:null,
	initialize:function(){
		this.alert=$("#guide").find(".alert");
		this.alert.find('.close').on('click',function(e){
			$(e.target).parents(".alert").hide();
		});
	},
	/**
	 * @param option set of param
	 * option is a string -> write the string
	 * option.title
	 * option.body
	 * option.$el  -> a jQuery element
	 * option.status ->  error || success || info modify the style of the pop up
	 */
	 
	pop:function( option ){
		var c=this.alert.children('.close').detach();
		this.alert.empty().append(c);
		if( typeof( option ) == "string" ){
			this.alert
			.append( $('<span>'+option+'</span>') )
		}else
		if( option.$el ){
			this.alert
			.append( $el )
		}else{
			if( option.title )
				this.alert.append( $('<h4>'+option.title+'</h4>') );
			if( option.body )
				this.alert.append( $('<span>'+option.body+'</span>') )
		}
		this.alert.removeClass('alert-error alert-success alert-info');
		if( option.status && ( option.status=='error' || option.status=='success' || option.status=='info') )
			this.alert.addClass( 'alert-'+option.status );
		this.alert.show();
	},
};
$(document).ready(function(){
	hintdisplayer.initialize();
	hintdisplayer.pop({title:'hello' , 'body':'i will be your guide' });
	
	$("#guide").click(function(){ 
		var dataPackage=new DataPackage();
		var dataPolygon=new DataPolygon({'structure':[ new L.LatLng(50.378992,3.588184) , new L.LatLng(50.378992,-3.588184) , new L.LatLng(40.378992,-3.588184) ] });

		dataPackage.addElement(dataPolygon);
		datamap.addPackage(dataPackage);
		
		vam.polygonTracable(true,dataPolygon);
	});
});
	
