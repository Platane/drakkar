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

// Data
var frameNavigator = new (Backbone.Model.extend({
	defaults: function() {
      return {
        frame:"header",
      };
    },
	setFrame:function(f) {
		this.set({'frame':f});
		this.trigger('goto');
	},
	instanciate:function(){},
}))();

var Scrollor = function( model , flow ){
	this.model=model;
	this.flow=flow;
	this.model.on( 'goto' , this.changeFrame ,this );
};
Scrollor.prototype={
	power:0.34,		//% of window height
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
			console.log(t/this.delay+"  "+alpha);
			sc=alpha*this.to+(1-alpha)*this.from;
		}
		sc=Math.round(sc);
		if( Math.abs(window-sc) == 100 )		//tricks, assuming one mouse wheel make the scroll +/- 100 px, we dont want to miss a wheel event because
			sc+=1;
		this.predictat=sc;
		window.scrollTo(0,sc);
		
		if( this.run )
			window.requestAnimationFrame($.proxy(this.animate,this));
	},
	checkScroll:function(){
		if( this.timeout )
			window.clearTimeout(this.timeout);
		var power = this.power;
		$(".frame").each(function(){
			var f=$(this);
			if( f.attr('id') == "frame-header" || f.attr('id') == "frame-footer" )
				return;
			if( Math.abs( f.position().top + window.innerHeight*0.04 - window.scrollY ) < window.innerHeight * power ){
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
	
	
	$("#guide").find(".close").on('click',function(){
		$("#guide").find(".alert").hide();
	}).click();
	$('#guide-portrait').on('click',function(){
		$("#guide").find(".alert").show();
	});
	
});
